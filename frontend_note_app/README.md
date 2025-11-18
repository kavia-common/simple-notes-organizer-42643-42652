# Simple Notes Organizer (Frontend)

Ocean Professional-themed notes app built with Vite + React.

Features:
- Two-pane layout: sidebar list + main editor
- Create, edit (auto-save), delete notes
- Search by title/content
- Sorted by last updated (desc)
- Local persistence via localStorage (key: `notes:v1`)
- Optional REST backend if `VITE_API_BASE` or `VITE_BACKEND_URL` is set (`${base}/notes` with GET, POST, PATCH, DELETE)

## Development
- Install deps: `npm i`
- Start dev server: `npm run dev` (defaults to port 3000)
- Build: `npm run build`
- Preview build: `npm run preview`

## Environment
- VITE_API_BASE (optional): Base URL for API, e.g. `https://api.example.com`
- VITE_BACKEND_URL (optional): Alternative base URL for API
If neither is set, the app uses localStorage.

## Accessibility
- Keyboard focus outlines
- Labeled controls and ARIA roles

## Notes
- Data shape: `{ id, title, content, createdAt, updatedAt }`
- Local storage key: `notes:v1`
