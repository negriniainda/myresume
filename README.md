# Bilingual Interactive Resume

A modern, bilingual (Portuguese/English) interactive website showcasing Marcelo Negrini's professional experience, built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🌐 Bilingual support (Portuguese/English)
- 📱 Fully responsive design
- ⚡ Optimized performance with Next.js 14
- 🎨 Modern UI with Tailwind CSS
- 🔍 Interactive search and filtering
- 📊 Skills visualization
- 📈 Experience timeline
- 🎯 Project gallery

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Testing:** Jest + React Testing Library
- **Linting:** ESLint + Prettier
- **Animations:** Framer Motion (to be added)
- **Internationalization:** i18next (to be added)

## Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Footer, Layout components
│   ├── sections/        # Hero, Summary, Experience, etc.
│   ├── ui/             # Reusable UI components
│   └── interactive/    # Interactive components
├── data/               # Resume and project data
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format
```

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## Development Status

This project is currently in the foundation phase. The basic project structure, tooling, and configuration have been set up. Next steps include implementing the core features according to the project specification.

## Requirements Addressed

- ✅ Next.js 14 project initialization with TypeScript
- ✅ Tailwind CSS configuration
- ✅ Project structure with components, data, hooks, and utils directories
- ✅ ESLint configuration
- ✅ Prettier configuration
- ✅ Jest testing framework setup
- ✅ Basic component placeholders

## License

Private project for Marcelo Negrini's professional portfolio.