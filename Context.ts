import { uniq } from 'lodash';

import { ContextMiddlewareBuilder } from './ContextMiddleware';
import { ContextProviderBuilder } from './ContextProvider';
import { contextValueFactory } from './helpers/contextValueFactory';
import {
  deleteContextValue,
  getAllContextValues,
  getContextValue,
  hasContextValue,
  setContextValue,
} from './Mutators';

export type ContextObject = { [key: string]: any };
export type BeforeHook = (context: { invocationId: string; userId?: any }) => Promise<void>;
export type AfterHook<Ctx> = (context: Ctx) => Promise<void>;
export type CustomMethod<C extends ContextObject, K extends keyof C> = (value?: C[K]) => C[K];

export function ContextFactory<Ctx extends ContextObject>({
  initialValues,
  beforeHook,
  afterHook,
}: {
  initialValues?: Ctx;
  beforeHook?: BeforeHook;
  afterHook?: AfterHook<Ctx>;
} = {}) {
  type Context = Ctx & Omit<{ invocationId: string; userId: any }, keyof Ctx>;
  const Middleware = ContextMiddlewareBuilder<Ctx>({ initialValues, beforeHook, afterHook });
  const Provider = ContextProviderBuilder<Ctx>({ initialValues, beforeHook, afterHook });

  const properties = uniq([...Object.keys(initialValues || {}), 'invocationId', 'userId']);

  function setFactoryContextValue<V extends { [K in keyof V]: K extends keyof Context ? V[K] : never }>(values: V): V; // prettier-ignore
  function setFactoryContextValue<K, V>(key: keyof Context, value: V): V;
  function setFactoryContextValue(...args: any[]) {
    // @ts-ignore
    return setContextValue(...args);
  }

  return {
    // Define custom getter/setter methods for properties
    ...properties.reduce((result, key) => ({ ...result, [key]: contextValueFactory(key) }), {} as {
      [K in keyof Context]: CustomMethod<Context, K>
    }),

    // Providers
    Middleware,
    Provider,

    // Mutators
    set: setFactoryContextValue,

    get<T = any>(key: keyof Context): T {
      return getContextValue(key as string);
    },

    delete(key: keyof Context) {
      return deleteContextValue(key as string);
    },

    has(key: keyof Context) {
      return hasContextValue(key as string);
    },

    all(): Context {
      return getAllContextValues();
    },
  };
}

export default {
  Provider: ContextProviderBuilder(),
  Middleware: ContextMiddlewareBuilder(),
  invocationId: contextValueFactory('invocationId'),
  userId: contextValueFactory('userId', null),
  get: getContextValue,
  set: setContextValue,
  delete: deleteContextValue,
  all: getAllContextValues,
  has: hasContextValue,
};
