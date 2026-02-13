# Bio Character Sprites

This directory contains character sprite images for the Visual Novel Bio section on the main page.

## Usage

Place character sprite PNG images in this directory. The sprites should be:
- **Format**: PNG with transparent background
- **Dimensions**: Recommended 400-600px width, 700-1000px height (portrait orientation)
- **Style**: Full-body character illustrations

## Referencing in Code

The Visual Novel Bio data is hardcoded in `/src/page-main/VisualNovelBio.tsx` in the `VN_BIO_DATA` constant. Update the `spriteUrl` fields to reference your sprites:

```typescript
spriteUrl: "/soul_collection/bio-character-sprites/your-character-name.png"
```

## Current Placeholders

The current implementation uses placeholder images from placehold.co for Pink Truck V, and a real sprite for Sam (`/soul_collection/ui/bio_sprite_sam.webp`). Replace placeholder URLs in `VisualNovelBio.tsx` with actual sprite paths when ready.
