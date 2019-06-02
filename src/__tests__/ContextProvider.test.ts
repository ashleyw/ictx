import { omit } from 'lodash';
import sinon from 'sinon';

import { test } from './utils/test';
import Context, { ContextFactory } from '..';

test('get value', async t => {
  const day = 'friday';
  const date = new Date();

  await Context.Provider(async () => {
    Context.set('day', day);
    Context.set('date', date);

    t.is(Context.get('day'), day);
    t.is(Context.get('date'), date);
  });
});

test('set value', async t => {
  const day = 'monday';

  await Context.Provider(async () => {
    Context.set('day', day);
    t.is(Context.get('day'), day);
  });
});

test('set multiple values', async t => {
  const values = { a: 1, b: 2, c: 3 };

  await Context.Provider(async () => {
    Context.set(values);
    t.deepEqual(omit(Context.all(), ['invocationId']), values);
  });
});

test('delete value', async t => {
  const day = 'monday';

  await Context.Provider(async () => {
    Context.set('day', day);
    t.deepEqual(omit(Context.all(), ['invocationId']), { day });

    Context.delete('day');

    t.is(Context.get('day'), undefined);
    t.deepEqual(omit(Context.all(), ['invocationId']), {});
  });
});

test('has value', async t => {
  await Context.Provider({ cool: true }, async () => {
    t.truthy(Context.has('cool'));
    t.falsy(Context.has('not-cool'));
  });
});

test('Context.Provider w/ arbitrary initial values', async t => {
  const initialVals = { a: 1, b: 2, c: 3 };

  await Context.Provider(initialVals, async () => {
    t.is(Context.get('a'), 1);
    t.is(Context.get('b'), 2);
    t.is(Context.get('c'), 3);
    t.is(Context.get('d'), undefined);
  });
});

test('Context.all()', async t => {
  const initialVals = { a: 1, b: 2, c: 3 };

  await Context.Provider(initialVals, async () => {
    t.deepEqual(omit(Context.all(), ['invocationId']), initialVals);
    Context.set('d', 4);
    t.deepEqual(omit(Context.all(), ['invocationId']), { ...initialVals, d: 4 });
  });
});

test('w/ resolve', async t => {
  await Context.Provider(async resolve => {
    Context.set('abc', 123);
    t.is(Context.get('abc'), 123);
    resolve();
  });
});

test('set context within setTimeout', async t => {
  t.plan(1);

  const key = 'name';
  const val = 'ash';

  await Context.Provider(async () => {
    await new Promise(resolve => {
      setTimeout(() => {
        Context.set(key, val);
        resolve();
      }, 100);
    }).then(() => {
      t.is(Context.get(key), val);
    });
  });
});

test('Context.Provider w/o initial values', async t => {
  await Context.Provider(async () => {
    Context.set('user', 'abc');
    t.is(Context.get('user'), 'abc');
  });
});

test('userId defaults to null', async t => {
  await Context.Provider(async () => {
    t.is(Context.userId(), null);
  });
});

test('calls hooks', async t => {
  const beforeHook = sinon.fake();
  const afterHook = sinon.fake();

  const invocationId = 'def';

  const { Provider } = ContextFactory<{ invocationId: string }>({
    initialValues: { invocationId: null },
    beforeHook,
    afterHook,
  });

  let afterValues = {};

  await Provider({ invocationId }, async () => {
    t.is(Context.get('invocationId'), invocationId);
    afterValues = Context.all();
  });

  t.is(beforeHook.callCount, 1);
  t.deepEqual(Object.keys(beforeHook.getCall(0).args[0]), ['invocationId']);

  t.is(afterHook.callCount, 1);
  t.deepEqual(afterHook.getCall(0).args[0], afterValues);
});

test('calls beforeHook w/ generated invocationId', async t => {
  const beforeHook = sinon.fake();

  const { Provider } = ContextFactory<{ invocationId: string }>({
    initialValues: { invocationId: null },
    beforeHook,
  });

  Provider(() => {
    t.truthy(Context.has('invocationId'));
  });

  t.is(beforeHook.callCount, 1);
  t.deepEqual(Object.keys(beforeHook.getCall(0).args[0]), ['invocationId']);
  t.deepEqual(beforeHook.getCall(0).args[0].invocationId.length, 25);
});

test('can throw error', async t => {
  const error = await t.throwsAsync(async () => {
    await Context.Provider(() => {
      throw new Error('abc');
    });
  });

  t.is(error.message, 'abc');
});

test('retuns value (async)', async t => {
  const result = await Context.Provider({ cool: true }, async () => {
    return new Promise(resolve => setTimeout(() => resolve(123), 100));
  });

  t.is(result, 123);
});

test('retuns value (async, resolve)', async t => {
  const result = await Context.Provider<number>(async resolve => {
    setTimeout(() => resolve(123), 100);

    // result should not be 666
    return 666;
  });

  t.is(result, 123);
});

test('retuns value (sync)', async t => {
  const result = await Context.Provider(() => {
    return 'abc';
  });

  t.is(result, 'abc');
});

test('retuns value (resolve fn)', async t => {
  const result = await Context.Provider(resolve => {
    resolve(123);
  });

  t.is(result, 123);
});

test('retuns value (resolve fn, w/ initial values)', async t => {
  const result = await Context.Provider<number>({ cool: true }, resolve => {
    t.is(Context.get('cool'), true);
    resolve(123);
  });

  t.is(result, 123);
});

test('retuns value (sync, w/ initial values)', async t => {
  const result = await Context.Provider<number>({ cool: true }, () => {
    t.is(Context.get('cool'), true);
    return 123;
  });

  t.is(result, 123);
});

test('retuns value (async, w/ initial values)', async t => {
  const result = await Context.Provider<number>({ cool: true }, async () => {
    t.is(Context.get('cool'), true);
    return new Promise<number>(resolve => setTimeout(() => resolve(123), 100));
  });

  t.is(result, 123);
});

test('can catch', async t => {
  await Context.Provider(() => {
    throw new Error('abc');
  })
    .then(() => t.fail('provider should throw'))
    .catch(() => t.pass());
});
