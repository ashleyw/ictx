import httpMocks from 'node-mocks-http';
import sinon from 'sinon';

import { test } from './helpers/test-utils';
import { ContextFactory } from '.';

test('pluck x-user-id header', async t => {
  const Context = ContextFactory<{ userId: string }>({ initialValues: { userId: null } });

  const userId = 'abc';

  const req = httpMocks.createRequest({
    headers: {
      'x-user-id': userId,
    },
  });

  const res = httpMocks.createResponse();

  Context.Middleware(req, res, () => {
    t.is(Context.get('userId'), userId);
    t.is(Context.userId(), userId);
  });
});

test('pluck x-invocation-id header', async t => {
  const Context = ContextFactory<{ invocationId: string }>({ initialValues: { invocationId: null } });

  const invocationId = 'def';

  const req = httpMocks.createRequest({
    headers: {
      'x-invocation-id': invocationId,
    },
  });

  const res = httpMocks.createResponse();

  Context.Middleware(req, res, () => {
    t.is(Context.get('invocationId'), invocationId);
    t.is(Context.invocationId(), invocationId);
  });
});

test('should not set invocationId', async t => {
  const Context = ContextFactory<{ invocationId: string }>({ initialValues: { invocationId: null } });

  const invocationId = 'def';

  const req = httpMocks.createRequest({
    headers: {
      'x-invocation-id': invocationId,
    },
  });

  const res = httpMocks.createResponse();

  Context.Middleware(req, res, () => {
    t.is(Context.get('invocationId'), invocationId);
    t.is(Context.invocationId(), invocationId);
  });
});

test('calls onComplete', async t => {
  const onComplete = sinon.fake();

  const Context = ContextFactory<{ invocationId: string; name: string }>({
    initialValues: { invocationId: null, name: 'ash' },
    onComplete,
  });

  const invocationId = 'def';

  const req = httpMocks.createRequest({
    headers: {
      'x-invocation-id': invocationId,
    },
  });

  const res = httpMocks.createResponse();

  let allValues = {};

  Context.Middleware(req, res, () => {
    t.is(Context.get('invocationId'), invocationId);
    t.is(Context.invocationId(), invocationId);

    allValues = Context.all();
  });

  t.is(onComplete.callCount, 1);
  t.deepEqual(onComplete.getCall(0).args[0], allValues);
});
