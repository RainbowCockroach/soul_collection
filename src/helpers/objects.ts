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
  displayIcon: string[]; // Array of image URLs for the ship icon
  oc: string[]; // Array of OC slugs involved in the ship
}

export interface DialogItem {
  text: string;
  requireAcknowledgment?: boolean;
}

export type DialogEntry = string | DialogItem;

export type DialogTexts = Record<string, DialogEntry[]>;
