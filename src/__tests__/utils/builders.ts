import { IncomingMessage, OutgoingMessage } from 'http';

import httpMocks from 'node-mocks-http';

export function reqBuilder({
  userId,
  invocationId,
  requestId,
}: {
  userId?: any;
  invocationId?: string;
  requestId?: string;
} = {}) {
  return httpMocks.createRequest<IncomingMessage>({
    headers: {
      ...(userId ? { 'x-user-id': userId } : {}),
      ...(invocationId ? { 'x-invocation-id': invocationId } : {}),
      ...(requestId ? { 'x-request-id': requestId } : {}),
    },
  });
}

export function resBuilder() {
  return httpMocks.createResponse<OutgoingMessage>({ eventEmitter: require('events').EventEmitter });
}

export function requestBuilder(...args: Parameters<typeof reqBuilder>) {
  return {
    req: reqBuilder(...args),
    res: resBuilder(),
  };
}
