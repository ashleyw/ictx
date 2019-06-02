import anyTest, { TestInterface } from 'ava';
import httpMocks from 'node-mocks-http';

export const test = anyTest as TestInterface<{}>;

export function reqBuilder({
  userId,
  invocationId,
  requestId,
}: {
  userId?: any;
  invocationId?: string;
  requestId?: string;
} = {}) {
  return httpMocks.createRequest({
    headers: {
      ...(userId ? { 'x-user-id': userId } : {}),
      ...(invocationId ? { 'x-invocation-id': invocationId } : {}),
      ...(requestId ? { 'x-request-id': requestId } : {}),
    },
  });
}

export function resBuilder() {
  return httpMocks.createResponse();
}

export function requestBuilder(...args: Parameters<typeof reqBuilder>) {
  return {
    req: reqBuilder(...args),
    res: resBuilder(),
  };
}
