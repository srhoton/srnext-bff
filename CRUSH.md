# CRUSH Configuration

## Build/Test Commands
```bash
# Build all lambdas
cd lambda/unit && npm run build
cd lambda/account && npm run build

# Test commands
cd lambda/unit && npm test                    # Run all tests
cd lambda/unit && npm run test:coverage      # Run with coverage
cd lambda/unit && npx jest unit-resolver     # Run single test file

# Lint and typecheck
cd lambda/unit && npm run lint               # Lint code
cd lambda/unit && npm run lint:fix          # Fix lint issues
cd lambda/unit && npm run typecheck         # TypeScript check

# Build deployment package
cd lambda/unit && ./build.sh                # Creates lambda.zip
```

## Code Style Guidelines

### TypeScript
- Explicit return types required: `async getUnit(): Promise<Unit>`
- No `any` types - use proper typing
- Strict null checks and boolean expressions
- Use nullish coalescing (`??`) and optional chaining (`?.`)

### Imports
- Group: builtin, external, internal, parent, sibling, index
- Alphabetical order with newlines between groups
- Use absolute imports from `../types`, `../services`

### Error Handling
- Custom error classes: `UnauthorizedError`, `ValidationError`, `ServiceError`
- Always handle axios errors with `handleApiError()`
- Validate inputs early with descriptive messages

### Naming & Structure
- Classes: PascalCase (`UnitResolver`, `UnitsApiService`)
- Methods: camelCase with descriptive names
- Static methods for resolvers
- Private methods prefixed with underscore pattern