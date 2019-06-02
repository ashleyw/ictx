import sinon from 'sinon';

import { ContextFactory } from './Context';
import { test } from './helpers/test-utils';
import Context from '.';

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
    t.deepEqual(Context.all(), values);
  });
});

test('delete value', async t => {
  const day = 'monday';

  await Context.Provider(async () => {
    Context.set('day', day);
    t.deepEqual(Context.all(), { day });

    Context.delete('day');

    t.is(Context.get('day'), undefined);
    t.deepEqual(Context.all(), {});
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
    t.deepEqual(Context.all(), initialVals);
    Context.set('d', 4);
    t.deepEqual(Context.all(), { ...initialVals, d: 4 });
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
      }, 500);
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

test('calls onComplete', async t => {
  const onComplete = sinon.fake();
  const invocationId = 'def';

  const Context = ContextFactory<{ invocationId: string }>({
    initialValues: { invocationId: null },
    onComplete,
  });

  let allValues = {};

  await Context.Provider({ invocationId }, async () => {
    t.is(Context.get('invocationId'), invocationId);

    allValues = Context.all();
  });

  t.is(onComplete.callCount, 1);
  t.deepEqual(onComplete.getCall(0).args[0], allValues);
});
