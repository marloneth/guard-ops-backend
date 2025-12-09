# Agent Guidelines for Guard Ops Backend

## Commands

- Build: `pnpm run build`
- Lint: `pnpm run lint` (auto-fixes issues)
- Test single file: `pnpm test -- path/to/file.spec.ts`
- Test all: `pnpm test`
- Test watch: `pnpm run test:watch`
- Format: `pnpm run format`

## Code Style

- Use single quotes, trailing commas
- Import order: NestJS modules → third-party → local modules → relative imports
- TypeScript with decorators (@Injectable, @Controller, etc.)
- Async/await for async operations
- Argon2 for password hashing
- JWT tokens with 15m access, 7d refresh expiry
- Prisma ORM with PostgreSQL
- Error handling with NestJS exceptions (UnauthorizedException, etc.)

## Patterns

- DTOs in dto/ folders with class-validator decorators
- Guards for JWT authentication
- Services handle business logic, controllers handle HTTP
- Use dependency injection constructor pattern
- Environment variables for secrets
