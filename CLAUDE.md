# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is an Original Character (OC) collection viewer with two main parts:
- **Data layer**: JSON files containing OC data and configuration in `/data/`
- **Generator app**: React/TypeScript application in `/generator/` that displays the OC collection

### Data Structure
- `/data/oc/`: Original character JSON files with structure:
  ```json
  {
    "name": "Character Name",
    "group": "Group Name",
    "avatar": "avatar_filename.jpg",
    "description": "Character description",
    "gallery": ["image1.jpg", "image2.jpg"]
  }
  ```
- `/data/settings.json`: Configuration for OC groups with names and avatar frame colors
- `/data/media/`: Asset storage for character images and avatars
- `/data/species/`: Species JSON files (future expansion)

### Generator Application
- Built with React 19, TypeScript, Vite, React Router, and Tailwind CSS
- Component architecture:
  - `App.tsx`: Root component with routing and navbar
  - `nav-bar/`: Navigation component with routing
  - `page-all/`: OC collection display components
    - `page-all.tsx`: Main page component with data loading
    - `group.tsx`: Collapsible group/category component
    - `slot.tsx`: Individual OC card component
    - `helper.ts`: Data loading utilities
- Builds to `/docs/` directory for GitHub Pages deployment

### Data Loading
- Uses fetch API to load JSON files at runtime
- Groups OCs by their `group` property from JSON files
- Group configuration comes from `settings.json`
- Images served from `/data/media/` directory

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
- Vite configured with JSON asset support

## Key Implementation Details

- The application displays OCs in collapsible groups defined by `settings.json`
- OCs are loaded dynamically from JSON files in `/data/oc/`
- Each OC displays avatar, name, and can be expanded for more details
- Responsive design with mobile navigation support
- Minimal CSS focused on layout structure without heavy styling
- React Router handles navigation between different views (Main, All OCs, Lore, Search)