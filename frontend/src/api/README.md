# Frontend API Architecture

## Overview

All backend communication goes through the **API Gateway** — the frontend never calls internal services directly.

```
┌─────────────┐      ┌─────────────┐      ┌──────────────────┐
│   Frontend  │ ───► │ API Gateway │ ───► │ Backend Services │
│  (React)    │      │  (:4000)    │      │ (auth, room...)  │
└─────────────┘      └─────────────┘      └──────────────────┘
```

## Folder Structure

```
src/api/
├── client.js           # Centralized axios instance
├── index.js            # Barrel export for all APIs
├── README.md           # This file
└── domains/
    ├── auth.js         # Authentication (login, register, tokens)
    ├── room.js         # Room management (create, join, leave)
    ├── game.js         # Game state and actions
    ├── vote.js         # Voting during day phase
    ├── chat.js         # Chat history and messages
    └── profile.js      # User profiles and stats
```

## Configuration

API Gateway URL is configured via environment variable:

```bash
# .env.local
VITE_API_GATEWAY_URL=http://localhost:4000
```

For production, set this to your deployed API Gateway URL.

## Usage in Components

```jsx
import { authApi, roomApi } from '@/api'

// Login
const handleLogin = async () => {
  try {
    await authApi.login(email, password)
    navigate('/lobby')
  } catch (error) {
    // error is already normalized with { status, code, message }
    setError(error.message)
  }
}

// List rooms
const rooms = await roomApi.list({ status: 'waiting' })
```

## Adding a New API Domain

1. Create `src/api/domains/newdomain.js`:

```js
import client from '../client'

export const newDomainApi = {
  list: async () => {
    const { data } = await client.get('/newdomain')
    return data
  },
  
  create: async (payload) => {
    const { data } = await client.post('/newdomain', payload)
    return data
  },
}
```

2. Export from `src/api/index.js`:

```js
export { newDomainApi } from './domains/newdomain'
```

3. Use in components:

```js
import { newDomainApi } from '@/api'
```

## Error Handling

All errors are normalized by the client interceptor:

```js
{
  status: 401,              // HTTP status code
  code: 'UNAUTHORIZED',     // Error code from backend or generated
  message: 'Session expired', // Human-readable message
  errors: [...],            // Validation errors (if any)
  original: Error           // Original axios error
}
```

### Handling in Components

```jsx
try {
  await authApi.login(email, password)
} catch (error) {
  if (error.status === 422 && error.errors) {
    // Validation errors
    setFieldErrors(error.errors)
  } else {
    // General error
    setError(error.message)
  }
}
```

## Authentication Flow

1. `authApi.login()` stores token in localStorage automatically
2. `client.js` interceptor attaches token to all requests
3. On 401 response, token is cleared and user redirected to login

## Best Practices

1. **Never import `client.js` directly in components** — use domain APIs
2. **Keep API logic out of components** — components only call API methods
3. **Use the normalized error structure** — don't access `error.response` directly
4. **Add JSDoc comments** to all API methods for IDE support
5. **Group related endpoints** in the same domain file
