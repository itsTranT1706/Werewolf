# Werewolf Frontend

Fantasy-themed web frontend for the Werewolf (Mafia) game.

## Tech Stack
- React 18 + Vite
- Tailwind CSS
- React Router DOM
- Axios for API calls

## Setup

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:3000` and proxies `/api` requests to the API Gateway at `http://localhost:4000`.

## Project Structure

```
frontend/
├── public/
│   └── assets/           # Game UI assets (see assets/README.md)
├── src/
│   ├── api/              # API modules (auth, etc.)
│   ├── components/
│   │   └── ui/           # Reusable medieval UI components
│   ├── layouts/          # Page layouts (AuthLayout, etc.)
│   ├── pages/            # Page components
│   ├── App.jsx           # Routes
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles + Tailwind
├── tailwind.config.js
└── vite.config.js
```

## UI Components

### MedievalPanel
Container with stone/wood border, gold accents, and corner rivets.

### MedievalInput
Stone-carved input field with gold borders and icon support.

### MedievalButton
Wood-textured button with 3D press effect.

### Divider
Gold gradient divider with optional text.

## Design System

### Colors
- `parchment` - Text on dark backgrounds
- `gold` / `gold-light` - Accents and highlights
- `wood-dark` / `wood-light` - Button backgrounds
- `stone-dark` / `stone-light` - Input backgrounds
- `blood-red` - Errors and warnings
- `night-blue` - Background base

### Fonts
- `font-medieval` (MedievalSharp) - Titles and headers
- `font-fantasy` (Cinzel) - Body text and labels

## API Integration

All API calls go through the API Gateway. Auth endpoints:
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user

Tokens are stored in localStorage and attached to requests via axios interceptor.
