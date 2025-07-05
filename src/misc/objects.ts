export interface Group {
  slug: string;
  name: string;
  frameColour: string; // Hex code
}

export interface OC {
  slug: string;
  name: string;
  avatar: string; // Image URL
  group: string[]; // Slugs
  spieces: string[];
  info: string; // Rich text
  gallery: string[]; // Image URLs
  breadcrumbs: string[]; // Rich text
  tags: string[];
}
