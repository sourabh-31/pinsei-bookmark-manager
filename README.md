# Pinsei

A fast, keyboard-friendly bookmark manager built with React, TypeScript, and Supabase.

## Features

- **Folders** — organize bookmarks into custom folders, plus built-in smart folders for unsorted and favourite bookmarks
- **Favourites** — mark any bookmark as a favourite for quick access
- **Search palette** — a command-style modal (⌘K-style) to jump between pages, folders, and bookmarks, or run quick actions
- **Bulk import** — paste a list of URLs (or an HTML/text export) to import many bookmarks at once, with automatic page-title fetching and duplicate filtering
- **Duplicate detection** — warns when adding a bookmark whose URL already exists, instead of creating silent duplicates
- **Bulk actions** — select multiple bookmarks to move, favourite, or delete in one step
- **Trash / Bin** — deleted bookmarks and folders are soft-deleted and recoverable from the Bin, including bookmarks removed as part of a folder deletion
- **Move & rename** — move bookmarks between folders and rename folders without losing their contents
- **Auth** — user accounts and per-user data backed by Supabase
- **Responsive layout** — desktop header navigation with a dedicated mobile nav bar

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for tooling and dev server
- [React Router](https://reactrouter.com/) for routing
- [TanStack Query](https://tanstack.com/query) for data fetching and caching
- [Supabase](https://supabase.com/) for auth, database, and backend
- [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) / [shadcn](https://ui.shadcn.com/) components

## Development

```bash
pnpm install
pnpm dev
```

### Generating Supabase types

```bash
pnpm dlx supabase gen types typescript --linked --schema public > src/types/database.types.ts
```
