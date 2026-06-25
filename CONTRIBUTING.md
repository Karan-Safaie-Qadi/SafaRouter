# Contributing to SafaRouter

Thank you for considering contributing! Every contribution helps.

## Development Setup

```bash
git clone https://github.com/Karan-Safaie-Qadi/SafaRouter.git
cd SafaRouter
npm install
node dev-server.js
# Open http://localhost:3000/test-app/
```

## Running Tests

```bash
npm test            # run all tests
npm run test:watch  # watch mode
npm run test:coverage  # coverage report
```

## Code Style

- ES modules only (type: "module" in package.json)
- No transpilation — code runs directly in the browser and Node
- No external runtime dependencies
- JSDoc comments for public API methods

## Commit Conventions

Use conventional commit prefixes:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `test:` tests
- `refactor:` code restructure
- `chore:` tooling, config, CI
- `types:` type definitions
- `demo:` demo app changes

## Pull Request Process

1. Ensure tests pass (`npm test`)
2. Update documentation if needed
3. Add tests for new features
