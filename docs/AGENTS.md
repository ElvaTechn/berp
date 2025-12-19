<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# AGENTS.md

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run all tests
- `npm test -- --testNamePattern="test name"` - Run single test
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

## Code Style Guidelines

### Imports & Formatting
- Use `@/*` path alias for src imports (e.g., `@/lib/utils`)
- Group imports: React, third-party, local components, utils
- Use Prettier/ESLint configuration for formatting

### Types & Naming  
- Use TypeScript with strict mode enabled
- Define types with Zod schemas in `src/lib/validations.ts`
- Use PascalCase for components, camelCase for variables/functions
- Interface names: `ComponentProps`, `AuthState`

### Error Handling
- Use Zod for input validation with `validateInput()` helper
- Wrap async operations in try-catch blocks
- Use toast notifications for user feedback
- Log errors with `@/lib/logger`

### React Patterns
- Use `React.forwardRef` for component refs
- Implement `displayName` for components
- Use `useCallback` for event handlers, `useState` for state
- Follow existing component structure (variants, cva for styling)

### Testing
- Place tests in `src/__tests__/` or `*.test.tsx` files
- Use Jest with jsdom environment
- Test components with React Testing Library patterns