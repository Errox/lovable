# Lovable - React + TypeScript Boilerplate

A modern, minimal TypeScript React website boilerplate powered by Vite.

## Features

- ⚡️ **Vite** - Fast build tool and dev server
- ⚛️ **React 18** - Latest React with modern features
- 🔷 **TypeScript** - Type safety and better developer experience
- 🎨 **CSS** - Styled with modern CSS
- 📦 **ESLint** - Code linting with TypeScript support
- 🔥 **Hot Module Replacement (HMR)** - Instant feedback during development

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Linting

Run the linter:

```bash
npm run lint
```

## Project Structure

```
lovable/
├── public/          # Static assets
├── src/
│   ├── assets/      # Images, fonts, etc.
│   ├── App.css      # App component styles
│   ├── App.tsx      # Main App component
│   ├── index.css    # Global styles
│   ├── main.tsx     # Application entry point
│   └── vite-env.d.ts # Vite type declarations
├── index.html       # HTML template
├── package.json     # Dependencies and scripts
├── tsconfig.json    # TypeScript configuration
├── tsconfig.node.json # TypeScript config for Vite
└── vite.config.ts   # Vite configuration
```

## Technologies Used

- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **ESLint** - Linting utility

## License

MIT