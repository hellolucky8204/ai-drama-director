# Codex Implementation Guide

## Mission
Build the V1 described in docs/PRD-V1.md and Issue #1.

## Priority
Ship a working guided MVP before adding integrations.

## Implementation order
1. Bootstrap Next.js + TypeScript + Tailwind.
2. Add app shell and project dashboard.
3. Implement 8-step guided project flow.
4. Seed built-in demo project.
5. Implement local persistence.
6. Add structured domain models.
7. Add story health check UI.
8. Add character lock/edit flow.
9. Add script and shot views.
10. Add prompt views with copy actions.
11. Add export Markdown/JSON.
12. Add AI provider interface with mock implementation.

## UX constraints
- Chinese UI.
- Desktop-first, responsive.
- Beginner-friendly.
- One primary CTA per screen.
- Always show current step and next step.
- Hide advanced parameters by default.
- Avoid professional film jargon in primary UI.

## Architecture
Keep AI/image/video integrations behind adapters/interfaces.
Do not hardwire the app to one model provider.

## Definition of Done
- npm install + npm run dev works
- demo project works end-to-end
- user can create a new project
- all 8 steps are navigable
- prompts can be copied
- export works
- no external API key required for V1 demo

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
