export interface Group {
  slug: string;
  name: string;
  frameColour: string; // Hex code
}

export interface Spieces {
  slug: string;
  name: string;
  description: string;
  gallery: string[]; // Image URLs
}

export interface OC {
  slug: string;
  name: string;
  avatar: string; // Image URL
  group: string[]; // Group slugs
  spieces: string[]; // Species slugs
  info: string; // Rich text
  gallery: string[]; // Image URLs
  breadcrumbs: string[]; // Rich text
  tags: string[];
}
