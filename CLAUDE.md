# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This project uses Yarn as the package manager. Core commands:

- `yarn dev` - Start development server (runs on localhost:5173)
- `yarn build` - Build for production (runs TypeScript compilation + Vite build)
- `yarn lint` - Run ESLint
- `yarn preview` - Preview production build locally

Note: No test framework is currently configured.

## Special Scripts

- `SamClickHereToOpenEditor.bat` - Windows batch script that pulls latest code, installs dependencies, starts dev server, and opens the editor at `/soul_collection/editor`
- `SamClickHereToUpdate.bat` - Windows batch script that commits and pushes data changes to the `sam` branch

## Architecture

This is a React + TypeScript + Vite application for managing a character collection ("OCs" - Original Characters). The app serves as both a viewer and editor for character data.

### Core Data Model

The application manages three main data types defined in `src/helpers/objects.ts`:

- **OC (Original Character)**: Characters with name, avatar, group affiliations, species, info, gallery, breadcrumbs, and tags
  - **BreadcrumbItem**: Breadcrumbs are now structured objects with `images` (string array) and `description` (string) fields
- **Group**: Character groups with name, slug, and frame color
- **Spieces**: Species with name, slug, description, and gallery

### Data Management

- **Data Storage**: Character data is stored in JSON files in `src/data/`:
  - `oc.json` - Character data (keyed by slug)
  - `group.json` - Group data (keyed by slug)
  - `spieces.json` - Species data (keyed by slug)
  - `tag.json` - Tag data (keyed by slug)
  - `form-link.json` - Character form relationships/links
  - `dialog.json` - Dialog text content
  - `settings.json` - Application settings

- **Data Loading**: `src/helpers/data-load.ts` provides functions to load and transform data from JSON files into typed objects with automatic slug mapping

- **Data Writing**: Data is edited through the editor components but currently saved via external batch scripts (no in-app data writing implemented)

### Application Structure

- **Routing**: Uses React Router with routes for:
  - `/` - Main page
  - `/ocs` - Character list page
  - `/ocs/:slug` - Character detail page
  - `/lore` - Lore page
  - `/search` - Search page
  - `/editor` - Data editor

- **Components**:
  - `src/page-oc-list/` - Character listing components
  - `src/page-detail/` - Character detail view components
    - `DetailBlockSpiecesInfo.tsx` - Enhanced species display with carousel galleries
    - `SpiecesInfo.tsx` - Species information component (in development)
  - `src/editor/` - Data editing components (separate editors for OCs, groups, species)
  - `src/common-components/` - Shared components including:
    - `BBCodeDisplay.tsx` - BBCode rendering
    - `GenericCarousel.tsx` - Reusable carousel component with auto-play and navigation
    - `ImageCarousel.tsx` - Image-specific carousel with responsive design
  - `src/nav-bar/` - Navigation components

### Carousel Components

The application includes reusable carousel components for media display:

- **GenericCarousel**: A flexible carousel that can display any React content
  - Auto-play functionality with pause on hover
  - Navigation arrows and dot indicators
  - Keyboard navigation support (arrow keys)
  - Slide counter display
  - Responsive design with mobile optimizations

- **ImageCarousel**: Specialized carousel for image galleries
  - Optimized for image display with proper scaling
  - Responsive height adjustments for different screen sizes
  - Inherits all GenericCarousel features

### Base URL Configuration

The application uses a configurable base URL from `src/helpers/constants.ts` for deployment flexibility. Currently set to "/soul_collection/" for deployment compatibility.

### Editor Features

The editor provides separate interfaces for managing:
- Character data (EditorOc.tsx)
  - Enhanced breadcrumb editor with support for multiple images and rich text descriptions per breadcrumb item
  - Structured breadcrumb management with add/remove functionality for both breadcrumbs and their associated images
- Group data (EditorGroup.tsx) 
- Species data (EditorSpieces.tsx)
- Tag data (EditorTag.tsx)
- Form links (EditorFormLink.tsx)
- Dialog text (EditorDialog.tsx)

Changes are written back to the JSON files and can be committed using the provided batch scripts.