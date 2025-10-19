# Contributing to Known

Thank you for your interest in contributing to Known! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/known.git`
3. Add the upstream repository: `git remote add upstream https://github.com/Eric-Hei/known.git`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Prerequisites

- Node.js (v18+) and Yarn

### Setting Up the Development Environment

```bash
# Navigate to the frontend app
cd src/frontend/apps/impress

# Install dependencies
yarn install

# Run the development server
yarn dev
```

The app will be available at `http://localhost:3000`.

### Building for Production

```bash
# Build the app
yarn build

# Preview the production build
yarn start
```

## Coding Standards

### Frontend

- Use TypeScript for all new code
- Follow the existing code style (enforced by ESLint and Prettier)
- Write meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/)
- Add tests for new features
- Keep components small and focused
- Use styled-components for styling

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

## Testing

```bash
cd src/frontend/apps/impress
yarn test
```

## Submitting Changes

1. Ensure all tests pass
2. Update documentation if needed
3. Push your changes to your fork
4. Create a Pull Request to the main repository
5. Wait for review and address any feedback

### Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Include screenshots for UI changes
- Keep PRs focused on a single feature or fix
- Update the version number in package.json and .env.development if needed

## Reporting Bugs

When reporting bugs, please include:

- A clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Browser/OS information
- Any error messages

## Feature Requests

We welcome feature requests! Please:

- Check if the feature has already been requested
- Provide a clear use case
- Explain how it would benefit users
- Be open to discussion and feedback

## Areas for Contribution

Here are some areas where contributions are especially welcome:

### Database Features
- Board view (Kanban)
- List view
- Calendar view
- Gallery view
- Customizable select options
- Relations between databases
- Formulas and calculations

### UI/UX Improvements
- Dark mode
- Keyboard shortcuts
- Accessibility improvements
- Mobile responsiveness

### Core Features
- Templates system
- Import/Export (CSV, JSON)
- Search improvements
- Offline support enhancements

### Documentation
- Tutorials
- Video guides
- API documentation
- Translation to other languages

## Questions?

If you have questions, feel free to:

- Open an issue on [GitHub](https://github.com/Eric-Hei/known/issues)
- Check existing issues and discussions

## Credits

Known is based on [La Suite Docs](https://github.com/suitenumerique/docs), an amazing collaborative text editor. We're grateful for their work and the open-source community.

## License

By contributing to Known, you agree that your contributions will be licensed under the MIT License.

