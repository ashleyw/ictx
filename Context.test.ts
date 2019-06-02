import Context from './Context';
import { test } from './helpers/test-utils';
import { requestBuilder } from './utils/builders';

test('get invocationId', async t => {
  await Context.Provider(async () => {
    t.is(Context.invocationId().length, 25);
  });
});

test('set invocationId', async t => {
  const invocationId = 'abc';
  const nextVal = 'def';

  await Context.Provider({ invocationId }, async () => {
    t.is(Context.invocationId(), invocationId, 'should be initial value');
    t.is(Context.invocationId(nextVal), nextVal, 'should be new value');
  });
});

test('set value', async t => {
  const name = 'abc';
  const nextVal = 'def';

  await Context.Provider({ name }, async () => {
    t.is(Context.get<string>('name'), name);
    Context.set('name', nextVal);
    t.is(Context.get('name'), nextVal);
  });
});

test('delete value', async t => {
  const name = 'abc';

  await Context.Provider({ name }, async () => {
    t.is(Context.get('name'), name);
    Context.delete('name');
    t.falsy(Context.has('name'));
    t.is(Context.get('name'), undefined);
  });
});

test('multiple properties', async t => {
  const invocationId = 'abc';
  const userId = 123;
  const values = { invocationId, userId };

  await Context.Provider(async () => {
    t.is(Context.set<typeof values>(values), values);

    t.is(Context.invocationId(), invocationId);
    t.is(Context.userId(), userId);
  });
});

test('invocationId omitted from Ctx', async t => {
  const invocationId = 'abc';
  const { req, res } = requestBuilder({ invocationId });

  await Context.Middleware(req, res, async () => {
    t.is(Context.invocationId(), invocationId);
  });

  await Context.Provider({ invocationId }, async () => {
    t.is(Context.invocationId(), invocationId);
  });
});

test('userId omitted from Ctx', async t => {
  const userId = 'abc';
  const { req, res } = requestBuilder({ userId });

  await Context.Middleware(req, res, async () => {
    t.is(Context.userId(), userId);
  });

  await Context.Provider({ userId }, async () => {
    t.is(Context.userId(), userId);
  });
});
