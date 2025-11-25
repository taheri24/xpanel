# CLAUDE.md - Frontend Development Guidelines

This document outlines coding standards and best practices for the XPanel frontend, emphasizing Test-Driven Development (TDD), Functional Programming principles, Logging, and Clean Code practices for React and TypeScript.

## Table of Contents

1. [Test-Driven Development (TDD)](#test-driven-development-tdd)
2. [Functional Programming](#functional-programming)
3. [Logging](#logging)
4. [Clean Code Principles](#clean-code-principles)
5. [React and TypeScript Best Practices](#react-and-typescript-best-practices)

---

## Test-Driven Development (TDD)

### TDD Workflow

Follow the Red-Green-Refactor cycle:

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve code while keeping tests green

### Testing with Vitest and React Testing Library

#### Component Testing

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should render login form with email and password fields', () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should call onSubmit with form data when submitted', async () => {
    const mockSubmit = vi.fn();
    render(<LoginForm onSubmit={mockSubmit} />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should display validation error for invalid email', async () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  });
});
```

#### Custom Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('should accept initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });
});
```

#### Integration Testing

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserDashboard } from './UserDashboard';
import { api } from '@/services/api';

vi.mock('@/services/api');

describe('UserDashboard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load and display user data', async () => {
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    vi.mocked(api.getUser).mockResolvedValue(mockUser);

    render(<UserDashboard userId="1" />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('should handle error states', async () => {
    vi.mocked(api.getUser).mockRejectedValue(new Error('Network error'));

    render(<UserDashboard userId="1" />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load user/i)).toBeInTheDocument();
    });
  });
});
```

### Testing Best Practices

- **Test behavior, not implementation**: Focus on what users see and do
- **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
- **Avoid testing implementation details**: Don't test state or props directly
- **Test user interactions**: Use `userEvent` instead of `fireEvent`
- **Run tests**: `npm test` or `npm run test:coverage`
- **Aim for high coverage**: Target >80% code coverage

### Testing Commands

```bash
npm test              # Run tests in watch mode
npm run test:ui       # Run tests with UI
npm run test:coverage # Generate coverage report
```

---

## Functional Programming

### Functional Components

Always use functional components with hooks:

```typescript
// ✅ Good - Functional component
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <Card>
      <Typography>{user.name}</Typography>
      <Button onClick={() => onEdit(user)}>Edit</Button>
    </Card>
  );
};

// ❌ Avoid - Class components
class UserCard extends React.Component<UserCardProps> {
  // ...
}
```

### Pure Components and Memoization

Optimize performance with pure components:

```typescript
import { memo, useMemo, useCallback } from 'react';

// Pure component - re-renders only when props change
export const UserList = memo<{ users: User[] }>(({ users }) => {
  return (
    <List>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </List>
  );
});

// Memoize expensive computations
const ExpensiveComponent: React.FC<{ data: number[] }> = ({ data }) => {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a - b);
  }, [data]);

  return <div>{sortedData.join(', ')}</div>;
};

// Memoize callbacks to prevent unnecessary re-renders
const ParentComponent: React.FC = () => {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  return <ChildComponent onClick={handleClick} />;
};
```

### Immutability

Never mutate state directly:

```typescript
// ❌ Bad - Mutates state
const addUser = () => {
  users.push(newUser); // Don't do this!
  setUsers(users);
};

// ✅ Good - Creates new array
const addUser = () => {
  setUsers([...users, newUser]);
};

// ✅ Good - Updating nested objects
const updateUserAddress = () => {
  setUser({
    ...user,
    address: {
      ...user.address,
      city: 'New York',
    },
  });
};

// ✅ Good - Using immer for complex updates
import { produce } from 'immer';

const updateUser = () => {
  setUser(
    produce((draft) => {
      draft.address.city = 'New York';
      draft.preferences.notifications = true;
    })
  );
};
```

### Function Composition

Compose small, reusable functions:

```typescript
// Small, focused functions
const filterActiveUsers = (users: User[]) => users.filter((u) => u.active);

const sortByName = (users: User[]) =>
  [...users].sort((a, b) => a.name.localeCompare(b.name));

const mapToViewModel = (users: User[]): UserViewModel[] =>
  users.map((u) => ({
    id: u.id,
    displayName: `${u.firstName} ${u.lastName}`,
    email: u.email,
  }));

// Compose them
const pipe =
  <T,>(...fns: Array<(arg: T) => T>) =>
  (value: T) =>
    fns.reduce((acc, fn) => fn(acc), value);

const processUsers = pipe(filterActiveUsers, sortByName, mapToViewModel);

// Usage
const viewModels = processUsers(allUsers);
```

### Higher-Order Components (HOCs) and Custom Hooks

Prefer custom hooks over HOCs:

```typescript
// ✅ Good - Custom hook for reusable logic
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}

// Usage in component
const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <LoginPrompt />;

  return <DashboardContent user={user} />;
};
```

### Declarative Programming

Write declarative, not imperative code:

```typescript
// ❌ Imperative
const UserList: React.FC<{ users: User[] }> = ({ users }) => {
  const items = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].active) {
      items.push(<li key={users[i].id}>{users[i].name}</li>);
    }
  }
  return <ul>{items}</ul>;
};

// ✅ Declarative
const UserList: React.FC<{ users: User[] }> = ({ users }) => {
  return (
    <ul>
      {users
        .filter((user) => user.active)
        .map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
    </ul>
  );
};
```

---

## Logging

### Browser Logging Strategies

#### Development Logging

```typescript
// utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    if (this.isDevelopment) {
      const style = this.getLogStyle(level);
      console.log(
        `%c[${level.toUpperCase()}] ${message}`,
        style,
        context || ''
      );
    }

    // Send to logging service in production
    if (!this.isDevelopment && level === 'error') {
      this.sendToLoggingService(entry);
    }
  }

  private getLogStyle(level: LogLevel): string {
    const styles = {
      debug: 'color: gray',
      info: 'color: blue',
      warn: 'color: orange',
      error: 'color: red; font-weight: bold',
    };
    return styles[level];
  }

  private sendToLoggingService(entry: LogEntry) {
    // Integrate with Sentry, LogRocket, etc.
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }
}

export const logger = new Logger();
```

#### Usage in Components

```typescript
import { logger } from '@/utils/logger';

export const UserForm: React.FC = () => {
  const handleSubmit = async (data: UserFormData) => {
    logger.info('User form submitted', { userId: data.id });

    try {
      await api.createUser(data);
      logger.info('User created successfully', { userId: data.id });
    } catch (error) {
      logger.error('Failed to create user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: data.id,
      });
    }
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
};
```

### Error Boundary with Logging

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('React error boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}
```

### API Request Logging

```typescript
// services/api.ts
import { logger } from '@/utils/logger';

export const api = {
  async request<T>(url: string, options?: RequestInit): Promise<T> {
    const requestId = crypto.randomUUID();

    logger.debug('API request started', {
      requestId,
      url,
      method: options?.method || 'GET',
    });

    try {
      const response = await fetch(url, options);

      logger.info('API request completed', {
        requestId,
        url,
        status: response.status,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('API request failed', {
        requestId,
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },
};
```

### Logging Best Practices

- **Never log sensitive data**: passwords, tokens, personal information
- **Use structured logging**: Include context objects
- **Log user actions**: Track important user interactions
- **Log errors with context**: Include relevant state and props
- **Disable debug logs in production**: Use environment variables
- **Integrate with error tracking**: Sentry, LogRocket, DataDog

---

## Clean Code Principles

### Component Design

#### Single Responsibility Principle

Each component should do one thing well:

```typescript
// ❌ Bad - Component has too many responsibilities
const UserDashboard = () => {
  // Fetches data
  // Handles authentication
  // Renders UI
  // Manages form state
  // Handles validation
};

// ✅ Good - Separated concerns
const UserDashboard = () => {
  return (
    <AuthGuard>
      <UserDataProvider>
        <UserProfile />
        <UserSettings />
        <UserActivity />
      </UserDataProvider>
    </AuthGuard>
  );
};
```

#### Component Size

Keep components focused and small:

```typescript
// ✅ Good - Small, focused component (< 150 lines)
export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <Card>
      <UserAvatar user={user} />
      <UserDetails user={user} />
      <UserActions user={user} onEdit={onEdit} />
    </Card>
  );
};
```

### TypeScript Best Practices

#### Type Safety

```typescript
// ✅ Define interfaces for props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

// ✅ Use strict types, avoid 'any'
const processData = (data: User[]): UserViewModel[] => {
  return data.map(mapUserToViewModel);
};

// ✅ Use generics for reusable components
interface SelectProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string;
}

export const Select = <T,>({ options, value, onChange, getLabel, getValue }: SelectProps<T>) => {
  // Implementation
};
```

#### Type Guards

```typescript
// Type guard for runtime type checking
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value
  );
}

// Usage
const data = await fetchData();
if (isUser(data)) {
  console.log(data.email); // TypeScript knows this is safe
}
```

### Naming Conventions

#### Components

```typescript
// ✅ PascalCase for components
export const UserProfile: React.FC = () => {};
export const LoginForm: React.FC = () => {};
```

#### Hooks

```typescript
// ✅ Start with 'use'
export const useAuth = () => {};
export const useLocalStorage = <T,>(key: string, initialValue: T) => {};
```

#### Handlers

```typescript
// ✅ Start with 'handle'
const handleSubmit = () => {};
const handleUserClick = () => {};
const handleInputChange = () => {};
```

#### Boolean Props

```typescript
// ✅ Use is/has/should prefix
interface UserCardProps {
  isLoading: boolean;
  hasError: boolean;
  shouldShowActions: boolean;
}
```

### File and Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   └── Card/
├── features/            # Feature-based modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   └── users/
├── hooks/               # Shared custom hooks
│   ├── useAuth.ts
│   └── useLocalStorage.ts
├── services/            # API and external services
│   ├── api.ts
│   └── auth.ts
├── types/               # Shared TypeScript types
│   └── models.ts
├── utils/               # Utility functions
│   ├── logger.ts
│   └── validation.ts
└── App.tsx
```

### Props Drilling Solution

Use composition and context:

```typescript
// ❌ Bad - Props drilling
<Parent user={user}>
  <Child user={user}>
    <GrandChild user={user} />
  </Child>
</Parent>

// ✅ Good - Context API
const UserContext = createContext<User | null>(null);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

// Usage
<UserProvider>
  <Parent>
    <Child>
      <GrandChild /> {/* No props needed */}
    </Child>
  </Parent>
</UserProvider>
```

### Conditional Rendering

```typescript
// ✅ Good - Clear conditional rendering
export const UserDashboard: React.FC = () => {
  const { user, loading, error } = useUser();

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <LoginPrompt />;

  return <Dashboard user={user} />;
};

// ✅ Good - Ternary for simple conditions
export const Button: React.FC<ButtonProps> = ({ isLoading, children }) => {
  return <button>{isLoading ? <Spinner /> : children}</button>;
};

// ✅ Good - Logical AND for conditional rendering
export const UserCard: React.FC<UserCardProps> = ({ user, showActions }) => {
  return (
    <Card>
      <UserDetails user={user} />
      {showActions && <UserActions user={user} />}
    </Card>
  );
};
```

---

## React and TypeScript Best Practices

### Custom Hooks

Extract reusable logic into custom hooks:

```typescript
// useDebounce hook
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Usage
const SearchInput: React.FC = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (debouncedSearch) {
      performSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
};
```

### Performance Optimization

```typescript
// ✅ Use React.lazy for code splitting
const UserDashboard = lazy(() => import('./features/users/UserDashboard'));
const AdminPanel = lazy(() => import('./features/admin/AdminPanel'));

const App: React.FC = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
};

// ✅ Virtualize long lists
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualizedList: React.FC<{ items: User[] }> = ({ items }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div key={virtualRow.index} style={{ height: '50px' }}>
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Error Handling

```typescript
// Custom hook for async operations with error handling
export const useAsync = <T,>(asyncFunction: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Async operation failed', { error: error.message });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  return { data, loading, error, execute };
};

// Usage
const UserProfile: React.FC = () => {
  const { data, loading, error, execute } = useAsync(() => api.getUser('123'));

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;

  return <UserDetails user={data} />;
};
```

---

## Testing Checklist

Before committing code, ensure:

- [ ] All tests pass: `npm test`
- [ ] Test coverage is adequate: `npm run test:coverage`
- [ ] No TypeScript errors: `npm run build`
- [ ] Linter passes: `npm run lint`
- [ ] Code is formatted: Configure Prettier or use ESLint auto-fix
- [ ] Components work in Storybook: `npm run storybook`
- [ ] Accessibility checks pass (use axe-core or similar)

---

## References

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Testing Library](https://testing-library.com/react)
- [Vitest Documentation](https://vitest.dev/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Material-UI Best Practices](https://mui.com/material-ui/guides/minimizing-bundle-size/)

---

**Remember**: Write code that is easy to read, test, and maintain. Prioritize user experience and accessibility. Future developers (including yourself) will thank you.
