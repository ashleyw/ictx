import { ContextFactory } from './Context';
import { test } from './helpers/test-utils';

test('can set initial values', async t => {
  type Ctx = {
    userId: number;
    username: string;
  };

  const initialValues = {
    userId: 123,
    username: 'ashleyw',
  };

  const Context = ContextFactory<Ctx>({ initialValues });

  Context.Provider(() => {
    t.is(Context.userId(), initialValues.userId);
    t.is(Context.get('userId'), initialValues.userId);
    t.is(Context.get('username'), initialValues.username);
  });
});

test('get invocationId', async t => {
  const invocationId = 'abc';

  const Context = ContextFactory<{ invocationId: string }>({ initialValues: { invocationId } });

  await Context.Provider(async () => {
    t.is(Context.invocationId(), invocationId);
  });
});

test('set invocationId', async t => {
  const invocationId = 'abc';
  const nextVal = 'def';

  const Context = ContextFactory<{ invocationId: string }>({ initialValues: { invocationId } });
  await Context.Provider(async () => {
    t.is(Context.invocationId(), invocationId, 'should be initial value');
    t.is(Context.invocationId(nextVal), nextVal, 'should be new value');
  });
});

test('set value', async t => {
  const name = 'abc';
  const nextVal = 'def';

  const Context = ContextFactory<{ name: string }>({ initialValues: { name } });

  await Context.Provider(async () => {
    t.is(Context.get('name'), name);
    Context.set('name', nextVal);
    t.is(Context.get('name'), nextVal);
  });
});

test('delete value', async t => {
  const name = 'abc';

  const Context = ContextFactory<{ name: string }>({ initialValues: { name } });

  await Context.Provider(async () => {
    t.is(Context.get('name'), name);
    Context.delete('name');
    t.falsy(Context.has('name'));
    t.is(Context.get('name'), undefined);
  });
});

test('multiple properties', async t => {
  const invocationId = 'abc';
  const userId = '123';

  const Context = ContextFactory<{ invocationId: string; userId: string }>({
    initialValues: { invocationId, userId },
  });
  await Context.Provider(async () => {
    t.is(Context.invocationId(), invocationId);
    t.is(Context.userId(), userId);
  });
});
