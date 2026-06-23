# Contributing to SafaRouter

We welcome contributions! Here's how to get started.

## Development

```bash
git clone https://github.com/pishro-dev/safa-router.git
cd safa-router
npm start
```

## Guidelines

- Use meaningful commit messages (prefix with `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
- Keep the code pure JavaScript with no dependencies
- Maintain backward compatibility
- Update the README if you change the public API
- Add or update demo pages for new features

## Project Structure

```
safa-router/
├── src/           # Source code (pure JS, zero deps)
├── test-app/      # Demo application
│   ├── pages/     # Route page components
│   ├── layouts/   # Layout components
│   └── styles/    # CSS
└── README.md      # Bilingual documentation
```

## Commit Convention

We follow a simple convention:

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation
- `refactor:` — code refactoring
- `chore:` — tooling, config
- `style:` — formatting
