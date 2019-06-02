import { omit } from 'lodash';
import sinon from 'sinon';

import { requestBuilder, test } from './helpers/test-utils';
import { ContextFactory } from '.';

test('can set initial values', async t => {
  const initialValues = {
    userId: 123,
    username: 'ashleyw',
  };

  const Context = ContextFactory<{
    userId: number;
    username: string;
  }>({ initialValues });

  Context.Provider(() => {
    t.is(Context.userId(), initialValues.userId);
    t.is(Context.get('userId'), initialValues.userId);
    t.is(Context.get('username'), initialValues.username);
  });
});

test('set multiple properties', async t => {
  const invocationId = 'abc';
  const userId = 123;
  const initialValues = { invocationId, userId };

  const Context = ContextFactory<typeof initialValues>({ initialValues });

  await Context.Provider(async () => {
    const newValues = { invocationId: 'def', userId: 333 };

    t.deepEqual(Context.set(newValues), newValues);
    t.deepEqual(Context.set({ invocationId: 'def' }), { invocationId: 'def' });

    t.is(Context.invocationId(), newValues.invocationId);
    t.is(Context.userId(), newValues.userId);
  });
});

test('should overwrite initial userId value w/ header', async t => {
  const Context = ContextFactory({ initialValues: { userId: 'abc' } });

  const userId = 'def';
  const { req, res } = requestBuilder({ userId });

  Context.Middleware(req, res, () => {
    t.is(Context.get<string>('userId'), userId);
    t.is(Context.userId(), userId);
  });
});

test('should NOT overwrite initial userId value if no header', async t => {
  const userId = 'abc';
  const Context = ContextFactory({ initialValues: { userId } });

  const { req, res } = requestBuilder();

  Context.Middleware(req, res, () => {
    t.is(Context.get('userId'), userId);
    t.is(Context.userId(), userId);
  });
});

test('should overwrite initial invocationId value w/ header', async t => {
  const Context = ContextFactory({ initialValues: { invocationId: 'abc' } });

  const invocationId = 'def';
  const { req, res } = requestBuilder({ invocationId });

  Context.Middleware(req, res, () => {
    t.is(Context.get('invocationId'), invocationId);
    t.is(Context.invocationId(), invocationId);
  });
});

test('should NOT overwrite initial invocationId value if no header', async t => {
  const invocationId = 'abc';
  const Context = ContextFactory({ initialValues: { invocationId } });

  const { req, res } = requestBuilder();

  Context.Middleware(req, res, () => {
    t.is(Context.get('invocationId'), invocationId);
    t.is(Context.invocationId(), invocationId);
  });
});

test('delete value', async t => {
  const country = 'uk';
  const Context = ContextFactory({ initialValues: { country } });

  await Context.Provider(async () => {
    t.is(Context.get('country'), country);

    Context.delete('country');

    t.is(Context.get('country'), undefined);
  });
});

test('custom method', async t => {
  const values = {
    duck: 'abc',
    rabbit: 123,
    fox: new Date(),
    bird: true,
    bug: { any: 1, key: '2' },
    bear: { any: '1', key: 2 },
  };

  const Context = ContextFactory<{
    duck: string;
    rabbit: number;
    fox: Date;
    bird: boolean;
    bug: any;
    bear: { any: string; key: number };
  }>({
    initialValues: values,
  });

  const { req, res } = requestBuilder();

  Context.Middleware(req, res, async () => {
    t.is(Context.duck(), values.duck);
    t.is(typeof Context.duck(), typeof values.duck);
    t.is(Context.duck('quack'), Context.duck());

    t.is(Context.rabbit(), values.rabbit);
    t.is(typeof Context.rabbit(), typeof values.rabbit);
    t.is(Context.rabbit(999), Context.rabbit());

    t.is(Context.fox(), values.fox);
    t.is(typeof Context.fox(), typeof values.fox);
    t.is(Context.fox(new Date(1991, 1, 1)), Context.fox());

    t.is(Context.bird(), values.bird);
    t.is(typeof Context.bird(), typeof values.bird);
    t.is(Context.bird(false), Context.bird());

    t.is(Context.bug(), values.bug);
    t.is(typeof Context.bug(), typeof values.bug);
    t.is(Context.bug([1, 2, 3]), Context.bug());

    t.is(Context.bear(), values.bear);
    t.is(typeof Context.bear(), typeof values.bear);
    t.is(Context.bear({ any: '2', key: 1 }), Context.bear());
  });
});

test('calls beforeHook w/ generated invocationId', async t => {
  const beforeHook = sinon.fake();

  const Context = ContextFactory({ beforeHook });

  const { req, res } = requestBuilder();

  await Context.Middleware(req, res, async () => {});
  await Context.Provider(async () => {});

  t.is(beforeHook.callCount, 2);
  t.deepEqual(Object.keys(beforeHook.getCall(0).args[0]), ['invocationId', 'userId']);
  t.deepEqual(Object.keys(beforeHook.getCall(1).args[0]), ['invocationId']);
  t.deepEqual(beforeHook.getCall(0).args[0].invocationId.length, 25);
  t.deepEqual(beforeHook.getCall(1).args[0].invocationId.length, 25);
});

test('calls afterHook w/ full context', async t => {
  const afterHook = sinon.fake();

  const Context = ContextFactory({ initialValues: { name: 'ash' }, afterHook });

  const { req, res } = requestBuilder();

  await Context.Middleware(req, res, async () => {});
  await Context.Provider(async () => {});

  t.is(afterHook.callCount, 2);

  t.deepEqual(omit(afterHook.getCall(0).args[0], ['invocationId']), { userId: null, name: 'ash' });
  t.deepEqual(omit(afterHook.getCall(1).args[0], ['invocationId']), { name: 'ash' });

  t.deepEqual(afterHook.getCall(0).args[0].invocationId.length, 25);
  t.deepEqual(afterHook.getCall(1).args[0].invocationId.length, 25);
});

[null, 'abc', 123, undefined].forEach(value => {
  test(`invocationId, initialValue = ${JSON.stringify(value)}`, async t => {
    const Context = ContextFactory({ initialValues: { invocationId: value } });

    const { req, res } = requestBuilder();

    await Context.Middleware(req, res, async () => {
      if (!!value) {
        t.truthy(value);
        t.is(Context.invocationId(), value);
      } else {
        t.is(Context.invocationId().toString().length, 25);
      }
    });
  });
});

[[null, null], ['abc', 'abc'], [123, 123], ['1234', 1234]].forEach(([userId, expected]) => {
  test(`userId, initialValue = ${JSON.stringify(userId)}`, async t => {
    t.plan(2);

    const Context = ContextFactory({ initialValues: { userId } });

    const { req, res } = requestBuilder();

    await Context.Middleware(req, res, async () => {
      t.is(Context.userId(), expected);
    });

    await Context.Provider({ userId }, async () => {
      if (userId === +userId) {
        t.is(Context.userId(), expected);
      } else {
        t.is(Context.userId(), userId);
      }
    });
  });
});

test('override userId type', async t => {
  const Context = ContextFactory<{ userId: number }>({ initialValues: { userId: 123 } });

  Context.Provider(() => {
    const result = Context.userId();
    t.is(result, 123);
    t.truthy(Number.isInteger(result));
  });
});

test('invocationId is a string', async t => {
  const Context = ContextFactory();

  Context.Provider(() => {
    const result = Context.invocationId();
    t.truthy(typeof result === 'string');
    t.is(result.length, 25);
  });
});

test('override invocationId type', async t => {
  const Context = ContextFactory<{ invocationId: number }>({ initialValues: { invocationId: 123 } });

  Context.Provider(() => {
    const result = Context.invocationId();
    t.is(result, 123);
    t.truthy(Number.isInteger(result));
  });
});
