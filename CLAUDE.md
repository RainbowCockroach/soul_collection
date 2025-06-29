# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a character collection generator project with two main parts:
- **Data layer**: JSON files containing character data (OCs and species) in `/data/`
- **Generator app**: React/TypeScript application in `/generator/` that displays the character collection

### Data Structure
- `/data/oc/`: Original character JSON files with name, avatar, description, and gallery
- `/data/spieces/`: Species JSON files with similar structure
- `/data/settings.json`: Configuration for display categories with names and avatar frame colors
- `/data/media/`: Asset storage for character images

### Generator Application
- Built with React 19, TypeScript, Vite, and Tailwind CSS
- Main components:
  - `App.tsx`: Root component with navbar
  - `nav-bar/`: Navigation component
  - `page-all/`: Main display pages including yearbook-style layout with collapsible class sections
- Builds to `/docs/` directory for GitHub Pages deployment (configured in vite.config.ts)

## Development Commands

Navigate to the `/generator/` directory for all development tasks:

```bash
cd generator
```

### Primary Commands
- `yarn dev` - Start development server with hot reload
- `yarn build` - Build for production (outputs to ../docs/)
- `yarn lint` - Run ESLint for code quality
- `yarn preview` - Preview production build locally

### Project Setup
- Uses Yarn for package management
- TypeScript configuration split across tsconfig.app.json and tsconfig.node.json
- ESLint configured with React and TypeScript rules

## Key Implementation Details

- The application displays character data in a yearbook-style interface with expandable sections
- Characters are organized by categories defined in settings.json
- Vite build outputs to `/docs/` for easy GitHub Pages deployment
- Uses Tailwind CSS for styling with custom CSS files for specific components