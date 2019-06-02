import { IncomingMessage, OutgoingMessage } from 'http';

import cuid from 'cuid';

import Context, { AfterHook, BeforeHook, ContextObject } from './Context';
import { namespace } from './helpers/namespace';

function pluckInvocationId({ req, res, initialValue }: { req?: any; res?: any; initialValue?: string }) {
  const header = req.headers['x-invocation-id'] || req.headers['x-request-id'];
  const invocationId = header || initialValue || cuid();

  if (!header) {
    req.headers['x-invocation-id'] = invocationId;
    res.setHeader('x-invocation-id', invocationId);
  }

  return invocationId;
}

function pluckCurrentUserId({ req, initialValue }: { req?: any; initialValue?: any }) {
  let userId = req.headers['x-user-id'] || initialValue || null;

  // Check if we can cast to an integer
  const numberCast = parseInt(userId, 10);
  if (userId === numberCast.toString()) {
    userId = numberCast;
  }

  return userId;
}

export function ContextMiddlewareBuilder<Ctx extends ContextObject>({
  initialValues = {} as Ctx,
  beforeHook,
  afterHook,
}: { initialValues?: Ctx; beforeHook?: BeforeHook; afterHook?: AfterHook<Ctx> } = {}) {
  return function ContextMiddleware(req: IncomingMessage, res: OutgoingMessage, next: any): void {
    namespace.bindEmitter(req);
    namespace.bindEmitter(res);

    let { invocationId, userId } = initialValues;

    namespace.run(async () => {
      invocationId = pluckInvocationId({ req, res, initialValue: invocationId });
      userId = pluckCurrentUserId({ req, initialValue: userId });

      Context.set({ ...initialValues, invocationId, userId });

      if (beforeHook) {
        await beforeHook({ invocationId, userId });
      }

      if (afterHook) {
        res.on('finish', () => afterHook(Context.all()));
      }

      await next();
    });
  };
}
