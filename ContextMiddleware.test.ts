import { requestBuilder, test } from './helpers/test-utils';
import Context from '.';

test('pluck x-user-id header', async t => {
  const userId = 'abc';
  const { req, res } = requestBuilder({ userId });

  Context.Middleware(req, res, () => {
    t.is(Context.get('userId'), userId);
  });
});

test('pluck x-invocation-id header', async t => {
  const invocationId = 'def';
  const { req, res } = requestBuilder({ invocationId });

  Context.Middleware(req, res, () => {
    t.is(Context.get('invocationId'), invocationId);
  });
});

test('pluck x-request-id header', async t => {
  const requestId = 'def';
  const { req, res } = requestBuilder({ requestId });

  Context.Middleware(req, res, () => {
    t.is(Context.get('invocationId'), requestId);
  });
});

test('no headers', async t => {
  const { req, res } = requestBuilder();

  await Context.Middleware(req, res, () => {
    t.is(Context.get('userId'), null);
    t.is(Context.get<string>('invocationId').length, 25);
  });
});

test('cast userId to number', async t => {
  const userId = '999';
  const { req, res } = requestBuilder({ userId });

  await Context.Middleware(req, res, () => {
    t.is(Context.userId(), 999);
  });
});
