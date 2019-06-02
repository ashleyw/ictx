import cuid from 'cuid';

import Context, { AfterHook, BeforeHook, ContextObject } from './Context';
import { namespace } from './helpers/namespace';

type ResolveFn<T> = (resolve?: (result?: T) => void) => T | Promise<T> | void;

export function ContextProviderBuilder<Ctx extends ContextObject>({
  initialValues,
  beforeHook,
  afterHook,
}: { initialValues?: Ctx; beforeHook?: BeforeHook; afterHook?: AfterHook<Ctx> } = {}) {
  return async function ContextProvider<T extends any>(
    initialValuesOrCallback: Ctx | ResolveFn<T>,
    callback?: ResolveFn<T>,
  ): Promise<T> {
    let values: Ctx;

    if (typeof initialValuesOrCallback === 'object') {
      values = {
        ...initialValues,
        ...initialValuesOrCallback,
      };
    } else {
      values = { ...initialValues };
      callback = initialValuesOrCallback;
    }

    return namespace.runAndReturn(async () => {
      const invocationId = Context.get<string>('invocationId') || Context.set('invocationId', cuid());

      if (beforeHook) {
        await beforeHook({ invocationId });
      }

      if (values) {
        Context.set(values);
      }

      const result = await new Promise<T>(async (resolve: (value?: T | PromiseLike<T>) => void, reject) => {
        try {
          const callbackResult = await callback(resolve);

          // if our callback doesn't accept the resolve function, resolve manually
          if (callback.length === 0) {
            return resolve(callbackResult || undefined);
          }
        } catch (error) {
          reject(error);
        }
      });

      if (afterHook) {
        afterHook(Context.all());
      }

      return result;
    });
  };
}
