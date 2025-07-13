export interface Group {
  slug: string;
  name: string;
  frameColour: string; // Hex code
  groupHeaderColour: string; // Hex code
  groupHeaderTextColour: string; // Hex code
}

export interface Spieces {
  slug: string;
  name: string;
  description: string;
  gallery: string[]; // Image URLs
}

export interface BreadcrumbItem {
  images: string[]; // Array of image URLs
  description: string; // Rich text description
}

export interface OC {
  slug: string;
  name: string;
  avatar: string; // Image URL
  group: string[]; // Group slugs
  spieces: string[]; // Species slugs
  info: string; // Rich text
  gallery: string[]; // Image URLs
  breadcrumbs: BreadcrumbItem[]; // Array of breadcrumb items
  tags: string[];
}
