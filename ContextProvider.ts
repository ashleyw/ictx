import cuid from 'cuid';

import Context, { AfterHook, BeforeHook, ContextObject } from './Context';
import { namespace } from './helpers/namespace';

type ResolveFn = (resolve: () => void) => void;
type PromiseFn = () => Promise<void>;
type CallbackFn = ResolveFn | PromiseFn;

export type ProviderCallbackFn = CallbackFn;

export function ContextProviderBuilder<Ctx extends ContextObject>({
  initialValues,
  beforeHook,
  afterHook,
}: { initialValues?: Ctx; beforeHook?: BeforeHook; afterHook?: AfterHook<Ctx> } = {}) {
  return async function ContextProvider(
    initialValuesOrCallback: Ctx | CallbackFn,
    callback?: CallbackFn,
  ): Promise<void> {
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

      await new Promise(async (resolveCb: () => void) => {
        if (values) {
          Context.set(values);
        }

      await new Promise(async (resolveCb: () => void) => {
        await callback(resolveCb);

        // If our our callback is not async, we shouldn't await resolveCb
        if (callback.constructor.name === 'AsyncFunction') {
          resolveCb();
        }
      });

      if (afterHook) {
        afterHook(Context.all());
      }
    });
  };
}
