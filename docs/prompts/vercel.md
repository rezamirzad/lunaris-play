Atlas:
We are preparing for a massive production deployment to Vercel. I need you to completely audit and harden the Convex backend to ensure no type errors bleed into the frontend.

1. Strict Type Check: Run npx tsc --noEmit inside the convex/ directory. You must fix any and all TypeScript errors.
2. Schema Alignment: Double-check schema.ts. Ensure that the gameType union strictly and perfectly matches the state objects returned by the mutations for dixit, pioupiou, themind, and nexus.
3. Dead Code Purge: Search through all convex/ files and delete any unused imports, dead variables, or lingering code from deleted prototypes.

Give me the green light when the backend compiler runs silently with zero errors.
