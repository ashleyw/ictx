# ictx (Invocation Context)

[![npm version](https://badge.fury.io/js/ictx.svg)](https://badge.fury.io/js/ictx)
[![Actions Status](https://github.com/ashleyw/ictx/workflows/Node%20CI/badge.svg)](https://github.com/ashleyw/ictx/actions)

Globally maintains context throughout a invocation/request lifecycle, using [cls-hooked](https://npmjs.com/package/@ashleyw/cls-hooked) under the hood.

Context can be set and retrieved during the entire lifetime a request, through all chains of function calls, even if defined in another module entirely.

## Examples

### Context.Middlware (for Express)

```typescript
import Context from 'ictx';
import express from 'express';

function getCurrentUser() {
  return User.findById(Context.get('userId'));
}

const app = express();

app.use(Context.Middleware);

app.get('/me', async (req, res) => {
  // Request header `x-user-id` was set as '123'

  Context.get('userId'); // => '123'
  Context.userId(); // => '123'

  const currentUser = getCurrentUser();

  res.json(currentUser);
});
```

Certain headers will be automatically assigned as context properties:

- `x-user-id` can be accessed via `Context.get('userId')` or `Context.userId()`
- `x-invocation-id` / `x-request-id` can be accessed via `Context.get('invocationId')` or `Context.invocationId()`

### Context.Provider

Generic provider. Works much like `Context.Middlware`, except you don't need to pass `req` and `res`.

```typescript
import Context from 'ictx';

Context.Provider({ userId: 'abc' }, () => {
  Context.get('userId'); // => 'abc'
});
```

### Typed Context

```typescript
import Container from 'typedi';
import { ContextFactory } from 'ictx';

const Context = ContextFactory<{ userId: string }>({
  initialValues: { userId: 123 },
  beforeHook: ({ invocationId }) => {
    Container.of(invocationId).set('connection', new DBConnection());
  },
  afterHook: ({ invocationId }) => {
    Container.reset(invocationId);
  },
});

Context.Provider(() => {
  // Defines methods for values
  Context.userId(); // => 123
  Context.userId(999);
  Context.userId(); // => 999
});
```
