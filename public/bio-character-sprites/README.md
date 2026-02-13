# Bio Character Sprites

This directory contains character sprite images for the Visual Novel Bio section on the main page.

## Usage

Place character sprite PNG images in this directory. The sprites should be:
- **Format**: PNG with transparent background
- **Dimensions**: Recommended 400-600px width, 700-1000px height (portrait orientation)
- **Style**: Full-body character illustrations

## Referencing in Data

Update `/src/data/vn-bio.json` to reference your sprites:

```json
{
  "spriteUrl": "/soul_collection/bio-character-sprites/your-character-name.png"
}
```

## Current Placeholders

The current implementation uses placeholder images from placehold.co. Replace these URLs in `vn-bio.json` with actual sprite paths when ready.
