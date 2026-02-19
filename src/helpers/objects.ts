export interface Group {
  slug: string;
  name: string;
  frameColour: string; // Hex code
  groupHeaderColour: string; // Hex code
  groupHeaderTextColour: string; // Hex code
  order?: number; // Display order
}

export interface Spieces {
  slug: string;
  name: string;
  description: string;
  gallery: string[]; // Image URLs
  contentWarning?: string; // Content warning for species images
}

export interface BreadcrumbItem {
  title?: string; // Optional title for the breadcrumb
  images: string[]; // Array of image URLs
  video?: string; // Optional YouTube embed HTML
  description: string; // Rich text description
  contentWarning?: string; // Content warning for breadcrumb images
}

export interface GalleryItem {
  image: string;
  thumbnail?: string;
  caption?: string;
  contentWarning?: string;
}

export interface OC {
  slug: string;
  name: string;
  avatar: string[]; // Array of image URLs
  voiceSample?: string; // Optional URL to audio file
  group: string[]; // Group slugs
  spieces: string[]; // Species slugs
  info: string; // Rich text
  gallery: GalleryItem[]; // Gallery items with image, thumbnail, and caption
  breadcrumbs: BreadcrumbItem[]; // Array of breadcrumb items
  tags: string[];
  order?: number; // Display order
}

export type FormLink = [string, string]; // Array of two OC slugs representing linked characters

export type Tag = {
  slug: string;
  name: string;
  backgroundColour: string;
  textColour: string;
};

export interface Ship {
  name: string;
  color: string; // Hex color code for the heart icon (e.g., #FF1493)
  oc: string[]; // Array of OC slugs involved in the ship
  shipText?: Record<string, string | undefined>; // Optional ship text for each OC (key: OC slug, value: ship text)
}

export interface DialogItem {
  text: string;
  requireAcknowledgment?: boolean;
}

export type DialogEntry = string | DialogItem;

export type DialogTexts = Record<string, DialogEntry[]>;

export interface VNCharacterSprite {
  characterId: string; // Unique ID for the character (e.g., "sam", "pink-truck-v")
  spriteUrl: string;
  position: "left" | "right"; // Which side of the screen
}

export interface VNDialogEntry {
  speaker: string; // Display name of the speaking character
  text: string;
  speakerId: string; // ID of the character speaking (matches characterId)
  nameBadgeColor: string;
  characters: VNCharacterSprite[]; // Array of characters visible on screen (max 2)
}

export interface AdItem {
  imageUrl: string;
  redirectUrl: string;
}

export type AdLocations = Record<string, AdItem[]>; // Key: location ID (e.g., "main-sidebar"), Value: array of ads

export interface HeightChartSprite {
  id: string;
  url: string;
  thumbnail: string;
  height: string;
}

export interface HeightChartGroup {
  name: string;
  groupId: string;
  variants: HeightChartSprite[];
}
