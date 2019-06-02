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
export type OnCompleteCallback = ({ invocationId }: { invocationId: string }) => void;

export function ContextFactory<Ctx extends ContextObject>({
  initialValues,
  onComplete,
}: {
  initialValues: Ctx;
  onComplete?: OnCompleteCallback;
}) {
  // Inject predefined getter/setter methods
  const customMethods = Object.keys(initialValues).reduce(
    (result, key) => {
      return { ...result, [key]: contextValueFactory<any>(key) };
    },
    {} as { [K in keyof Ctx]: ReturnType<typeof contextValueFactory> },
  );

  const Middleware = ContextMiddlewareBuilder({ initialValues, onComplete });
  const Provider = ContextProviderBuilder({ initialValues, onComplete });

  return {
    ...customMethods,

    Middleware,
    Provider,
    get: function<T = any>(key: keyof Ctx): T {
      return getContextValue(key as string);
    },
    set: function(key: keyof Ctx, value: any) {
      return setContextValue(key as string, value);
    },
    delete: function(key: keyof Ctx) {
      return deleteContextValue(key as string);
    },
    has: function(key: keyof Ctx) {
      return hasContextValue(key as string);
    },
    all: function(): Ctx {
      return getAllContextValues();
    },
  };
}

export default {
  Provider: ContextProviderBuilder(),
  Middleware: ContextMiddlewareBuilder(),
  get: getContextValue,
  set: setContextValue,
  delete: deleteContextValue,
  all: getAllContextValues,
  has: hasContextValue,
};
