import cuid from 'cuid';

import Context, { ContextObject, OnCompleteCallback } from './Context';
import { namespace } from './helpers/namespace';

function setupInvocationId({ req, res }: { req?: any; res?: any }): void {
  const headerValue = req.headers['x-invocation-id'] || req.headers['x-request-id'];
  const invocationId = headerValue || cuid();

  if (!headerValue) {
    req.headers['x-invocation-id'] = invocationId;
    res.setHeader('x-invocation-id', invocationId);
  }

  namespace.set('invocationId', invocationId);
}

function setupCurrentUserId({ req }: { req?: any }): void {
  const userId = req.headers['x-user-id'];

  if (userId) {
    namespace.set('userId', userId);
  }
}

export function ContextMiddlewareBuilder({
  initialValues,
  onComplete,
}: { initialValues?: ContextObject; onComplete?: OnCompleteCallback } = {}) {
  return function ContextMiddleware(req, res, next) {
    namespace.bindEmitter(req);
    namespace.bindEmitter(res);

    return namespace.run(async () => {
      if (initialValues) {
        Context.set(initialValues);
      }

      setupInvocationId({ req, res });
      setupCurrentUserId({ req });

      next();

      if (!!onComplete) {
        onComplete(Context.all());
      }
    });
  };
}
