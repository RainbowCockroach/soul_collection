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
}

export interface BreadcrumbItem {
  title?: string; // Optional title for the breadcrumb
  images: string[]; // Array of image URLs
  description: string; // Rich text description
}

export interface GalleryItem {
  image: string;
  thumbnail?: string;
  caption?: string;
}

export interface OC {
  slug: string;
  name: string;
  avatar: string; // Image URL
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
