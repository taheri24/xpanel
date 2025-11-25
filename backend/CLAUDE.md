# CLAUDE.md - Backend Development Guidelines

This document outlines coding standards and best practices for the XPanel backend, emphasizing Test-Driven Development (TDD), Functional Programming principles, Logging, and Clean Code practices.

## Table of Contents

1. [Test-Driven Development (TDD)](#test-driven-development-tdd)
2. [Functional Programming](#functional-programming)
3. [Logging](#logging)
4. [Clean Code Principles](#clean-code-principles)
5. [Go-Specific Best Practices](#go-specific-best-practices)

---

## Test-Driven Development (TDD)

### TDD Workflow

Follow the Red-Green-Refactor cycle:

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve code while keeping tests green

### Test Structure

Use table-driven tests for comprehensive coverage:

```go
func TestUserValidation(t *testing.T) {
    tests := []struct {
        name    string
        user    User
        wantErr bool
        errMsg  string
    }{
        {
            name:    "valid user",
            user:    User{Name: "John", Email: "john@example.com"},
            wantErr: false,
        },
        {
            name:    "empty name",
            user:    User{Name: "", Email: "john@example.com"},
            wantErr: true,
            errMsg:  "name is required",
        },
        {
            name:    "invalid email",
            user:    User{Name: "John", Email: "invalid"},
            wantErr: true,
            errMsg:  "invalid email format",
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := tt.user.Validate()
            if (err != nil) != tt.wantErr {
                t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
                return
            }
            if tt.wantErr && err.Error() != tt.errMsg {
                t.Errorf("Validate() error message = %v, want %v", err.Error(), tt.errMsg)
            }
        })
    }
}
```

### Testing Guidelines

- **Test file naming**: `*_test.go` (e.g., `user_service_test.go`)
- **Test function naming**: `TestFunctionName` or `TestStructName_MethodName`
- **Subtests**: Use `t.Run()` for organizing related test cases
- **Test coverage**: Aim for >80% code coverage
- **Run tests**: `make test` or `go test ./...`

### Mocking and Interfaces

Use interfaces for dependency injection to enable easy mocking:

```go
// Define interface for dependencies
type UserRepository interface {
    GetByID(ctx context.Context, id string) (*User, error)
    Save(ctx context.Context, user *User) error
}

// Implementation
type userService struct {
    repo UserRepository
    logger Logger
}

// Mock for testing
type mockUserRepository struct {
    getUserFn func(ctx context.Context, id string) (*User, error)
    saveFn    func(ctx context.Context, user *User) error
}

func (m *mockUserRepository) GetByID(ctx context.Context, id string) (*User, error) {
    if m.getUserFn != nil {
        return m.getUserFn(ctx, id)
    }
    return nil, errors.New("not implemented")
}
```

### Benchmarking

Write benchmarks for performance-critical code:

```go
func BenchmarkUserValidation(b *testing.B) {
    user := User{Name: "John", Email: "john@example.com"}

    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        _ = user.Validate()
    }
}
```

Run benchmarks: `go test -bench=. -benchmem`

---

## Functional Programming

### Pure Functions

Write functions without side effects whenever possible:

```go
// ❌ Impure - modifies input
func AddTax(order *Order) {
    order.Total = order.Subtotal * 1.15
}

// ✅ Pure - returns new value
func CalculateTotalWithTax(subtotal float64, taxRate float64) float64 {
    return subtotal * (1 + taxRate)
}
```

### Immutability

Prefer immutable data structures:

```go
// ❌ Mutable approach
type Config struct {
    Settings map[string]string
}

func (c *Config) Set(key, value string) {
    c.Settings[key] = value // Mutates config
}

// ✅ Immutable approach
type Config struct {
    settings map[string]string
}

func (c Config) WithSetting(key, value string) Config {
    newSettings := make(map[string]string, len(c.settings)+1)
    for k, v := range c.settings {
        newSettings[k] = v
    }
    newSettings[key] = value
    return Config{settings: newSettings}
}
```

### Higher-Order Functions

Use functions as first-class citizens:

```go
// Function that accepts a function as parameter
func Filter[T any](slice []T, predicate func(T) bool) []T {
    result := make([]T, 0)
    for _, item := range slice {
        if predicate(item) {
            result = append(result, item)
        }
    }
    return result
}

// Function that returns a function
func MakeValidator(minLength int) func(string) bool {
    return func(s string) bool {
        return len(s) >= minLength
    }
}

// Usage
activeUsers := Filter(users, func(u User) bool { return u.Active })
validatePassword := MakeValidator(8)
```

### Function Composition

Build complex operations from simple functions:

```go
type TransformFunc[T any] func(T) T

func Compose[T any](fns ...TransformFunc[T]) TransformFunc[T] {
    return func(input T) T {
        result := input
        for _, fn := range fns {
            result = fn(result)
        }
        return result
    }
}

// Usage
sanitize := Compose(
    strings.TrimSpace,
    strings.ToLower,
    removeSpecialChars,
)

clean := sanitize(userInput)
```

### Map, Filter, Reduce Patterns

Implement functional collection operations:

```go
func Map[T, U any](slice []T, fn func(T) U) []U {
    result := make([]U, len(slice))
    for i, v := range slice {
        result[i] = fn(v)
    }
    return result
}

func Reduce[T, U any](slice []T, initial U, fn func(U, T) U) U {
    result := initial
    for _, v := range slice {
        result = fn(result, v)
    }
    return result
}

// Usage
prices := []float64{10.0, 20.0, 30.0}
total := Reduce(prices, 0.0, func(sum, price float64) float64 {
    return sum + price
})
```

---

## Logging

### Structured Logging

Use structured logging with `slog` (Go 1.21+) or a compatible library:

```go
import "log/slog"

// Initialize logger with JSON handler
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelInfo,
    AddSource: true,
}))

// Log with structured fields
logger.Info("user created",
    "user_id", user.ID,
    "email", user.Email,
    "ip_address", request.IP,
)

logger.Error("database connection failed",
    "error", err,
    "database", dbConfig.Name,
    "retry_count", retries,
)
```

### Log Levels

Use appropriate log levels:

- **DEBUG**: Detailed diagnostic information (development only)
- **INFO**: General informational messages (normal operations)
- **WARN**: Warning messages (potentially harmful situations)
- **ERROR**: Error events (application errors that don't stop execution)
- **FATAL**: Severe errors (application must shut down)

```go
// ✅ Correct usage
logger.Debug("cache lookup", "key", cacheKey)
logger.Info("server started", "port", port)
logger.Warn("rate limit approaching", "current", current, "limit", limit)
logger.Error("payment processing failed", "error", err, "order_id", orderID)
```

### Context-Aware Logging

Attach request context to logs:

```go
func RequestLogger(logger *slog.Logger) gin.HandlerFunc {
    return func(c *gin.Context) {
        requestID := uuid.New().String()

        // Create request-scoped logger
        reqLogger := logger.With(
            "request_id", requestID,
            "method", c.Request.Method,
            "path", c.Request.URL.Path,
            "ip", c.ClientIP(),
        )

        // Store logger in context
        c.Set("logger", reqLogger)

        reqLogger.Info("request started")
        c.Next()
        reqLogger.Info("request completed", "status", c.Writer.Status())
    }
}

// Usage in handlers
func GetUser(c *gin.Context) {
    logger := c.MustGet("logger").(*slog.Logger)
    logger.Info("fetching user", "user_id", userID)
}
```

### Logging Best Practices

- **Never log sensitive data**: passwords, tokens, credit cards
- **Use consistent field names**: `user_id`, `email`, `ip_address`
- **Include correlation IDs**: for tracing requests across services
- **Log errors with context**: include relevant business context
- **Avoid logging in hot paths**: minimize performance impact

```go
// ❌ Bad - logs sensitive data
logger.Info("user login", "password", password)

// ✅ Good - logs relevant non-sensitive data
logger.Info("user login attempt",
    "user_id", userID,
    "ip_address", ip,
    "success", success,
)
```

---

## Clean Code Principles

### SOLID Principles

#### Single Responsibility Principle (SRP)

Each package, struct, and function should have one reason to change:

```go
// ❌ Violates SRP - handles multiple responsibilities
type UserService struct{}

func (s *UserService) CreateUser(user User) error {
    // Validates user
    // Saves to database
    // Sends email
    // Logs activity
}

// ✅ Follows SRP - separated concerns
type UserValidator struct{}
type UserRepository struct{}
type EmailService struct{}
type AuditLogger struct{}

type UserService struct {
    validator  *UserValidator
    repository *UserRepository
    email      *EmailService
    audit      *AuditLogger
}

func (s *UserService) CreateUser(ctx context.Context, user User) error {
    if err := s.validator.Validate(user); err != nil {
        return err
    }
    if err := s.repository.Save(ctx, user); err != nil {
        return err
    }
    s.email.SendWelcome(user.Email)
    s.audit.LogUserCreated(user.ID)
    return nil
}
```

#### Open/Closed Principle (OCP)

Open for extension, closed for modification:

```go
// Define interface for extension
type PaymentProcessor interface {
    Process(ctx context.Context, amount float64) error
}

// Implementations
type StripeProcessor struct{}
type PayPalProcessor struct{}

func (p *StripeProcessor) Process(ctx context.Context, amount float64) error {
    // Stripe-specific logic
}

func (p *PayPalProcessor) Process(ctx context.Context, amount float64) error {
    // PayPal-specific logic
}

// Service depends on interface, not concrete implementation
type PaymentService struct {
    processor PaymentProcessor
}
```

#### Dependency Inversion Principle (DIP)

Depend on abstractions, not concretions:

```go
// ✅ Good - depends on interface
type UserService struct {
    repo   UserRepository   // interface
    logger Logger           // interface
    cache  Cache            // interface
}

func NewUserService(repo UserRepository, logger Logger, cache Cache) *UserService {
    return &UserService{
        repo:   repo,
        logger: logger,
        cache:  cache,
    }
}
```

### Naming Conventions

#### Variables and Functions

- Use **camelCase** for unexported identifiers
- Use **PascalCase** for exported identifiers
- Use **descriptive names** over abbreviations
- Keep **scope proportional** to name length

```go
// ❌ Bad
func GetUsr(id int) (*U, error) {}
var x = 10

// ✅ Good
func GetUserByID(userID int) (*User, error) {}
var maxRetryAttempts = 10

// ✅ Good - short names for small scopes
for i, user := range users {
    // i is fine here
}
```

#### Interfaces

- Name with `-er` suffix: `Reader`, `Writer`, `Validator`
- Keep interfaces small (1-3 methods ideal)

```go
type UserRepository interface {
    GetByID(ctx context.Context, id string) (*User, error)
    Save(ctx context.Context, user *User) error
    Delete(ctx context.Context, id string) error
}

type Validator interface {
    Validate() error
}
```

### Error Handling

Follow Go error handling idioms:

```go
// ✅ Return errors, don't panic
func GetUser(id string) (*User, error) {
    if id == "" {
        return nil, errors.New("user ID is required")
    }

    user, err := repo.FindByID(id)
    if err != nil {
        return nil, fmt.Errorf("failed to get user: %w", err)
    }

    return user, nil
}

// ✅ Use error wrapping for context
if err := saveUser(user); err != nil {
    return fmt.Errorf("user creation failed for %s: %w", user.Email, err)
}

// ✅ Handle errors at the appropriate level
func handler(c *gin.Context) {
    user, err := service.CreateUser(c.Request.Context(), req)
    if err != nil {
        logger.Error("user creation failed", "error", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
        return
    }
    c.JSON(http.StatusCreated, user)
}
```

### Code Organization

```
backend/
├── cmd/                    # Application entrypoints
│   └── server/
│       └── main.go
├── internal/               # Private application code
│   ├── domain/            # Business entities and interfaces
│   │   ├── user.go
│   │   └── order.go
│   ├── repository/        # Data access implementations
│   │   ├── user_repository.go
│   │   └── user_repository_test.go
│   ├── service/           # Business logic
│   │   ├── user_service.go
│   │   └── user_service_test.go
│   ├── handler/           # HTTP handlers
│   │   └── user_handler.go
│   └── middleware/        # HTTP middleware
│       └── auth.go
├── pkg/                   # Public libraries
│   ├── logger/
│   └── validator/
└── migrations/            # Database migrations
```

### Function Length and Complexity

- Keep functions **under 50 lines**
- Extract complex logic into **helper functions**
- Use **early returns** to reduce nesting

```go
// ✅ Good - early returns
func ProcessOrder(order *Order) error {
    if order == nil {
        return errors.New("order is nil")
    }

    if err := order.Validate(); err != nil {
        return fmt.Errorf("invalid order: %w", err)
    }

    if order.Total <= 0 {
        return errors.New("order total must be positive")
    }

    return processPayment(order)
}
```

---

## Go-Specific Best Practices

### Context Usage

Always pass context as the first parameter:

```go
func GetUser(ctx context.Context, userID string) (*User, error) {
    // Use context for cancellation, timeouts, and values
    select {
    case <-ctx.Done():
        return nil, ctx.Err()
    default:
        return repo.FindByID(ctx, userID)
    }
}
```

### Goroutine and Concurrency

Use goroutines responsibly:

```go
// ✅ Use errgroup for concurrent operations with error handling
import "golang.org/x/sync/errgroup"

func ProcessUsers(ctx context.Context, userIDs []string) error {
    g, ctx := errgroup.WithContext(ctx)

    for _, id := range userIDs {
        id := id // Capture loop variable
        g.Go(func() error {
            return processUser(ctx, id)
        })
    }

    return g.Wait()
}

// ✅ Use sync.WaitGroup for fire-and-forget operations
var wg sync.WaitGroup
for _, user := range users {
    wg.Add(1)
    go func(u User) {
        defer wg.Done()
        sendNotification(u)
    }(user)
}
wg.Wait()
```

### Defer, Panic, Recover

Use `defer` for cleanup:

```go
func WriteToFile(filename string, data []byte) error {
    f, err := os.Create(filename)
    if err != nil {
        return err
    }
    defer f.Close() // Ensures file is closed

    _, err = f.Write(data)
    return err
}
```

### Package Design

- Keep packages **focused and cohesive**
- Avoid **circular dependencies**
- Use **internal/** for private packages
- Export only what's **necessary**

```go
// pkg/validator/validator.go - focused package
package validator

type Validator interface {
    Validate(v interface{}) error
}

type EmailValidator struct{}

func (e *EmailValidator) Validate(email string) error {
    // Validation logic
}
```

---

## Testing Checklist

Before committing code, ensure:

- [ ] All tests pass: `go test ./...`
- [ ] Test coverage is adequate: `go test -cover ./...`
- [ ] Benchmarks show acceptable performance: `go test -bench=.`
- [ ] No race conditions: `go test -race ./...`
- [ ] Code is formatted: `gofmt -w .` or `make fmt`
- [ ] Linter passes: `golangci-lint run` or `make lint`
- [ ] Documentation is updated for exported functions

---

## References

- [Effective Go](https://go.dev/doc/effective_go)
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- [Uber Go Style Guide](https://github.com/uber-go/guide/blob/master/style.md)
- [Clean Architecture in Go](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Remember**: Write code that is easy to read, test, and maintain. Future developers (including yourself) will thank you.
