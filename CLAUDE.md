# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This project uses NPM as the package manager. Core commands:

- `npm run dev` - Start development server (runs on localhost:5173)
- `npm run build` - Build for production (runs TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally
- `npx tsc --noEmit` - Run TypeScript type checking without emitting files

Note: No test framework is currently configured.

## Special Scripts

- `SamClickHereToOpenEditor.bat` - Windows batch script that pulls latest code, installs dependencies, starts dev server, and opens the editor at `/soul_collection/editor`
- `SamClickHereToUpdate.bat` - Windows batch script that commits and pushes data changes to the `sam` branch

## Architecture

This is a React + TypeScript + Vite application for managing a character collection ("OCs" - Original Characters). The app serves as both a viewer and editor for character data.

### Core Data Model

The application manages several main data types defined in `src/helpers/objects.ts`:

- **OC (Original Character)**: Characters with name, avatar, group affiliations, species, info, gallery, breadcrumbs, and tags
  - **BreadcrumbItem**: Breadcrumbs are structured objects with `images` (string array), `description` (string), optional `title`, `video` (YouTube embed), and `contentWarning` fields
  - **GalleryItem**: Gallery items with `image`, optional `thumbnail`, `caption`, and `contentWarning` fields
- **Group**: Character groups with name, slug, frame colors, header colors, and display order
- **Spieces**: Species with name, slug, description, gallery, and optional content warnings
- **Tag**: Tags with name, slug, background color, and text color
- **Ship**: Character relationship pairs with name, colored heart icon (hex color), and array of OC slugs
- **FormLink**: Character form relationships represented as pairs of OC slugs
- **DialogTexts**: Dialog system for character interactions with support for acknowledgment requirements

### Data Management

- **Data Storage**: Character data is stored in JSON files in `src/data/`:

  - `oc.json` - Character data (keyed by slug)
  - `group.json` - Group data (keyed by slug)
  - `spieces.json` - Species data (keyed by slug)
  - `tag.json` - Tag data (keyed by slug)
  - `ships.json` - Ship/relationship data (array format)
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
    - `GalleryBlock.tsx` - Gallery display component
    - `ImageWithInfo.tsx` and `ImageWithInfoMany.tsx` - Image display with metadata
    - `ZoomPanPinchImage.tsx` - Interactive image zoom/pan functionality
    - `StarryTrail.tsx` - Decorative mouse trail effect
    - `LoadingSpinner.tsx` - Loading state component
  - `src/nav-bar/` - Navigation components
  - `src/music-player/` - Music player system with context and controls

### Visual and Interactive Features

The application includes various visual and interactive components:

- **Background Effects**: Continuous sparkle animations (`src/background-sparkle/sparkles.ts`)
- **StarryTrail**: Mouse trail effect that follows cursor movement
- **Music Player**: Context-based music system with controls and state management
- **Image Zoom**: Interactive zoom/pan/pinch functionality for detailed image viewing
- **Gallery Systems**: Multiple gallery components for different display needs

### Deployment Configuration

- **Base URL**: Configured in `vite.config.ts` as `/soul_collection/` for GitHub Pages deployment
- **Build Output**: Static files are built to `./dist` directory
- **GitHub Actions**: Automated deployment via `.github/workflows/main.yml`
- **Content Warnings**: The application supports content warnings for images in species, gallery items, and breadcrumbs

### Editor Features

The editor provides separate interfaces for managing:

- Character data (EditorOc.tsx)
  - Enhanced breadcrumb editor with support for multiple images and rich text descriptions per breadcrumb item
  - Structured breadcrumb management with add/remove functionality for both breadcrumbs and their associated images
- Group data (EditorGroup.tsx)
- Species data (EditorSpieces.tsx)
- Tag data (EditorTag.tsx)
- Ship data (EditorShip.tsx)
  - Color picker for customizing ship heart icon color
  - Live preview showing FontAwesome heart icon with selected color
  - OC selection from available characters to assign to ships
- Form links (EditorFormLink.tsx)
- Dialog text (EditorDialog.tsx)

Changes are written back to the JSON files and can be committed using the provided batch scripts.
