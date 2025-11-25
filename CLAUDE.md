# CLAUDE.md - AI Assistant Guide for xpanel

This document provides comprehensive guidance for AI assistants working on the xpanel project. It outlines the codebase structure, development workflows, conventions, and best practices.

**Last Updated:** 2025-11-25
**Project:** xpanel
**Repository:** taheri24/xpanel

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Codebase Structure](#codebase-structure)
3. [Development Workflow](#development-workflow)
4. [Git Conventions](#git-conventions)
5. [Code Style & Conventions](#code-style--conventions)
6. [Testing Guidelines](#testing-guidelines)
7. [Security Considerations](#security-considerations)
8. [Documentation Standards](#documentation-standards)
9. [Common Tasks](#common-tasks)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

### About xpanel
xpanel is [Brief description to be added as project develops]

### Tech Stack
- **Language:** [To be determined]
- **Framework:** [To be determined]
- **Database:** [To be determined]
- **Build Tools:** [To be determined]

### Key Features
- [Feature 1]
- [Feature 2]
- [Feature 3]

---

## Codebase Structure

```
xpanel/
├── .git/                   # Git repository metadata
├── CLAUDE.md              # This file - AI assistant guide
├── README.md              # Project documentation (to be created)
├── src/                   # Source code directory (to be created)
│   ├── components/        # UI components (if applicable)
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   └── types/             # Type definitions
├── tests/                 # Test files (to be created)
├── docs/                  # Additional documentation (to be created)
└── [config files]         # package.json, tsconfig.json, etc.
```

### Key Directories
- **src/**: Main source code
- **tests/**: Unit, integration, and e2e tests
- **docs/**: Project documentation and guides

### Important Files
- **CLAUDE.md**: This file - comprehensive guide for AI assistants
- **README.md**: Project overview and setup instructions
- **[package.json/requirements.txt/etc.]**: Dependency management

---

## Development Workflow

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd xpanel

# Install dependencies
[npm install / pip install -r requirements.txt / etc.]

# Set up environment
cp .env.example .env
# Configure environment variables

# Run initial build/setup
[npm run build / make setup / etc.]
```

### Development Process
1. **Create a feature branch** from the default branch
2. **Implement changes** following code conventions
3. **Write tests** for new functionality
4. **Run tests** to ensure nothing breaks
5. **Commit changes** with clear messages
6. **Push to remote** and create pull request

### Branch Strategy
- **main/master**: Production-ready code
- **develop**: Integration branch for features
- **feature/\***: New features and enhancements
- **bugfix/\***: Bug fixes
- **hotfix/\***: Critical production fixes
- **claude/\***: AI assistant working branches

---

## Git Conventions

### Branch Naming
- Feature branches: `feature/description-of-feature`
- Bug fixes: `bugfix/issue-description`
- Hotfixes: `hotfix/critical-fix`
- AI assistant branches: `claude/claude-md-[session-id]`

### Commit Messages
Follow the conventional commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add JWT authentication

Implement JWT-based authentication system with refresh tokens
and secure cookie handling.

Closes #123
```

```
fix(api): resolve race condition in user service

Fixed race condition that occurred when multiple requests
tried to update user profile simultaneously.
```

### Git Operations Best Practices

#### Pushing Changes
```bash
# Always push with upstream tracking
git push -u origin <branch-name>

# Branch names MUST start with 'claude/' for AI assistant work
# If push fails with network error, retry up to 4 times with exponential backoff:
# Wait 2s, 4s, 8s, 16s between retries
```

#### Fetching/Pulling
```bash
# Prefer fetching specific branches
git fetch origin <branch-name>

# For pulls
git pull origin <branch-name>

# Apply same retry logic for network failures
```

#### Important Git Rules
- **NEVER** update git config without explicit permission
- **NEVER** run destructive commands (force push, hard reset) without confirmation
- **NEVER** skip hooks (--no-verify, --no-gpg-sign) unless explicitly requested
- **NEVER** force push to main/master branches
- **AVOID** `git commit --amend` unless explicitly requested or fixing pre-commit hook issues

---

## Code Style & Conventions

### General Principles
1. **Clarity over cleverness**: Write code that's easy to understand
2. **DRY (Don't Repeat Yourself)**: Avoid code duplication
3. **KISS (Keep It Simple, Stupid)**: Prefer simple solutions
4. **YAGNI (You Aren't Gonna Need It)**: Don't add unnecessary features
5. **Single Responsibility**: Each function/class should do one thing well

### Naming Conventions
- **Variables**: `camelCase` or `snake_case` (depending on language)
- **Functions**: `camelCase` or `snake_case` with descriptive names
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `kebab-case.ext` or `snake_case.ext`

### Code Organization
- Group related functionality together
- Keep functions small and focused (< 50 lines ideally)
- Use meaningful variable names (avoid single letters except in loops)
- Add comments only when necessary to explain "why", not "what"
- Extract magic numbers into named constants

### Error Handling
- Always handle errors explicitly
- Use try-catch blocks appropriately
- Provide meaningful error messages
- Log errors with sufficient context
- Fail fast for programming errors
- Handle user errors gracefully

### Security Best Practices
- **Input Validation**: Validate all user inputs
- **SQL Injection**: Use parameterized queries
- **XSS Prevention**: Sanitize outputs
- **Authentication**: Use secure, well-tested libraries
- **Secrets**: Never commit secrets, use environment variables
- **Dependencies**: Keep dependencies updated
- **HTTPS**: Enforce HTTPS in production

---

## Testing Guidelines

### Test Structure
```
tests/
├── unit/           # Unit tests for individual functions/classes
├── integration/    # Integration tests for component interactions
├── e2e/           # End-to-end tests for user workflows
└── fixtures/      # Test data and mocks
```

### Testing Principles
1. **Write tests first** (TDD when appropriate)
2. **Test behavior, not implementation**
3. **Keep tests independent** and isolated
4. **Use descriptive test names**
5. **Follow AAA pattern**: Arrange, Act, Assert
6. **Mock external dependencies**
7. **Aim for high coverage** but don't obsess over 100%

### Test Naming
```javascript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', () => {
      // Test implementation
    });

    it('should throw error when email is invalid', () => {
      // Test implementation
    });
  });
});
```

### Running Tests
```bash
# Run all tests
[npm test / pytest / etc.]

# Run specific test file
[npm test -- path/to/test / pytest path/to/test.py]

# Run with coverage
[npm run test:coverage / pytest --cov]

# Watch mode for development
[npm run test:watch]
```

---

## Security Considerations

### OWASP Top 10 Prevention

1. **Injection**: Use parameterized queries, input validation
2. **Broken Authentication**: Use proven auth libraries, secure sessions
3. **Sensitive Data Exposure**: Encrypt sensitive data, use HTTPS
4. **XML External Entities**: Disable XML external entity processing
5. **Broken Access Control**: Implement proper authorization checks
6. **Security Misconfiguration**: Use secure defaults, keep updated
7. **XSS**: Sanitize outputs, use Content Security Policy
8. **Insecure Deserialization**: Validate serialized data
9. **Components with Known Vulnerabilities**: Update dependencies regularly
10. **Insufficient Logging**: Log security events, monitor anomalies

### Secret Management
- Use environment variables for secrets
- Never commit `.env` files
- Use secret management services (AWS Secrets Manager, HashiCorp Vault, etc.)
- Rotate secrets regularly
- Use different secrets for different environments

### Code Review Checklist
- [ ] No hardcoded secrets or credentials
- [ ] Input validation on all user inputs
- [ ] Proper error handling without information leakage
- [ ] Authentication and authorization checks
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output sanitization)
- [ ] CSRF protection (tokens, SameSite cookies)
- [ ] Secure headers configured
- [ ] Dependencies up to date

---

## Documentation Standards

### Code Documentation
- Document public APIs and interfaces
- Add JSDoc/docstrings for functions and classes
- Explain complex algorithms or business logic
- Document assumptions and constraints
- Keep comments up to date with code changes

### Example Documentation
```javascript
/**
 * Validates user credentials and returns authentication token
 *
 * @param {string} email - User's email address
 * @param {string} password - User's password (plain text)
 * @returns {Promise<AuthToken>} JWT authentication token
 * @throws {AuthenticationError} If credentials are invalid
 * @throws {RateLimitError} If too many attempts
 */
async function authenticateUser(email, password) {
  // Implementation
}
```

### README Structure
1. Project title and description
2. Features
3. Prerequisites
4. Installation instructions
5. Configuration
6. Usage examples
7. API documentation
8. Contributing guidelines
9. License
10. Contact information

---

## Common Tasks

### Adding a New Feature
1. Create feature branch: `git checkout -b feature/feature-name`
2. Implement feature with tests
3. Update documentation
4. Run test suite
5. Commit changes with conventional commit message
6. Push and create pull request

### Fixing a Bug
1. Create bugfix branch: `git checkout -b bugfix/bug-description`
2. Write failing test that reproduces bug
3. Fix the bug
4. Verify test passes
5. Commit and push

### Refactoring Code
1. Ensure tests exist for the code being refactored
2. Make small, incremental changes
3. Run tests after each change
4. Keep commits atomic and focused
5. Document why refactoring was necessary

### Updating Dependencies
```bash
# Check for outdated dependencies
[npm outdated / pip list --outdated]

# Update dependencies
[npm update / pip install --upgrade]

# Run tests to verify nothing broke
[npm test / pytest]

# Update lockfile and commit
git add [package-lock.json / requirements.txt]
git commit -m "chore(deps): update dependencies"
```

---

## Troubleshooting

### Common Issues

#### Issue: Tests failing after changes
**Solution:**
1. Review changed code for logic errors
2. Check if test expectations need updating
3. Verify test environment is set up correctly
4. Clear caches and rebuild if necessary

#### Issue: Git push fails with 403
**Solution:**
- Ensure branch name starts with 'claude/' for AI assistant work
- Verify authentication credentials
- Check repository permissions

#### Issue: Dependencies installation fails
**Solution:**
1. Clear package manager cache
2. Delete node_modules / venv and reinstall
3. Check for conflicting dependency versions
4. Verify network connectivity

#### Issue: Build fails in production
**Solution:**
1. Verify environment variables are set
2. Check production dependencies are installed
3. Review build logs for specific errors
4. Test build locally with production settings

### Debug Strategies
1. **Read error messages carefully** - they often contain the solution
2. **Use debugger** - step through code to understand flow
3. **Add logging** - instrument code to track execution
4. **Isolate the problem** - create minimal reproduction
5. **Check recent changes** - use git to identify what changed
6. **Search documentation** - official docs are often most helpful
7. **Check issues** - someone may have encountered same problem

---

## AI Assistant Specific Guidelines

### When Working on This Codebase

#### DO:
- ✅ Read files before modifying them
- ✅ Understand existing patterns and follow them
- ✅ Write tests for new functionality
- ✅ Use TodoWrite tool for complex multi-step tasks
- ✅ Commit changes with clear, descriptive messages
- ✅ Ask for clarification when requirements are ambiguous
- ✅ Use specialized tools (Read, Write, Edit) instead of bash commands
- ✅ Make atomic, focused commits
- ✅ Validate inputs and handle errors properly
- ✅ Keep changes minimal and focused on the request

#### DON'T:
- ❌ Make changes to code you haven't read
- ❌ Add unnecessary features or "improvements" beyond what's asked
- ❌ Skip security considerations (SQL injection, XSS, etc.)
- ❌ Commit secrets or sensitive data
- ❌ Force push without explicit permission
- ❌ Over-engineer solutions
- ❌ Add comments, docstrings, or type annotations to unchanged code
- ❌ Create abstractions for one-time operations
- ❌ Design for hypothetical future requirements
- ❌ Add error handling for scenarios that can't happen

### Tool Usage
- **Prefer Task tool** for open-ended searches and exploration
- **Use Read/Write/Edit tools** instead of cat/echo in bash
- **Run independent commands in parallel** when possible
- **Use TodoWrite** for tracking progress on complex tasks
- **Leverage Grep/Glob** for code search instead of find/grep in bash

### Code References
When referencing code, use the format: `file_path:line_number`

Example: "The authentication logic is in src/services/auth.ts:145"

---

## Project-Specific Notes

### [Section to be populated as project grows]
- Project-specific conventions
- Special considerations
- Known issues or technical debt
- Performance optimization notes
- Deployment procedures

---

## Resources

### Documentation
- [Link to main documentation]
- [Link to API documentation]
- [Link to architecture docs]

### Tools
- [Development tools]
- [CI/CD pipelines]
- [Monitoring and logging]

### Contacts
- Project Lead: [Name/Email]
- Tech Lead: [Name/Email]
- Repository: taheri24/xpanel

---

## Changelog

### 2025-11-25
- Initial CLAUDE.md creation
- Established structure and conventions
- Added comprehensive AI assistant guidelines

---

**Note:** This document should be updated regularly as the project evolves. When making significant changes to project structure, conventions, or workflows, update this file to keep it current.
