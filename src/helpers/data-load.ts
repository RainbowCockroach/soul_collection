import type { OC, Group, Spieces, FormLink, Tag, DialogTexts } from "./objects";
import ocData from "../data/oc.json";
import groupData from "../data/group.json";
import speciesData from "../data/spieces.json";
import formLinkData from "../data/form-link.json";
import tagData from "../data/tag.json";
import dialogData from "../data/dialog.json";

export interface LoadedData {
  ocs: OC[];
  groups: Group[];
  species: Spieces[];
  tags: Tag[];
  dialogs: DialogTexts;
}

export async function loadOCs(): Promise<OC[]> {
  return Object.entries(ocData)
    .map(([slug, oc]) => ({
      slug,
      ...(oc as Omit<OC, "slug">),
    }))
    .sort(
      (a, b) => (a.order ?? Number.MAX_VALUE) - (b.order ?? Number.MAX_VALUE)
    );
}

export async function loadGroups(): Promise<Group[]> {
  return Object.entries(groupData)
    .map(([slug, group]) => ({
      slug,
      ...(group as Omit<Group, "slug">),
    }))
    .sort(
      (a, b) => (a.order ?? Number.MAX_VALUE) - (b.order ?? Number.MAX_VALUE)
    );
}

export async function loadSpecies(): Promise<Spieces[]> {
  return Object.entries(speciesData).map(([slug, species]) => ({
    slug,
    ...(species as Omit<Spieces, "slug">),
  }));
}

export async function loadTags(): Promise<Tag[]> {
  return Object.entries(tagData).map(([slug, tag]) => ({
    slug,
    ...(tag as Omit<Tag, "slug">),
  }));
}

export interface OcWithDetails extends OC {
  groupDetails: Group[];
  speciesDetails: Spieces[];
  tagDetails: Tag[];
}

export async function loadOcBySlug(
  slug: string
): Promise<OcWithDetails | null> {
  const [ocs, groups, species, tags] = await Promise.all([
    loadOCs(),
    loadGroups(),
    loadSpecies(),
    loadTags(),
  ]);

  const oc = ocs.find((oc) => oc.slug === slug);
  if (!oc) {
    return null;
  }

  const groupDetails = groups.filter((group) => oc.group.includes(group.slug));
  const speciesDetails = species.filter((species) =>
    oc.spieces.includes(species.slug)
  );
  const tagDetails = tags.filter((tag) => oc.tags.includes(tag.slug));

  return {
    ...oc,
    groupDetails,
    speciesDetails,
    tagDetails,
  };
}

export async function loadFormLinks(): Promise<FormLink[]> {
  return formLinkData as FormLink[];
}

export async function findLinkedOc(ocSlug: string): Promise<string | null> {
  const formLinks = await loadFormLinks();

  for (const link of formLinks) {
    if (link[0] === ocSlug) {
      return link[1];
    } else if (link[1] === ocSlug) {
      return link[0];
    }
  }

  return null;
}

export async function loadDialogs(): Promise<DialogTexts> {
  return dialogData as DialogTexts;
}

export async function loadDialogByKey(key: string): Promise<string[] | null> {
  const dialogs = await loadDialogs();
  return dialogs[key] || null;
}

export async function loadOcBackstory(slug: string): Promise<string | null> {
  try {
    const response = await fetch(`/soul_collection/lore/${slug}.txt`);
    if (!response.ok) {
      return null;
    }
    
    const content = await response.text();
    
    // Check if the response is HTML (indicating SPA redirect due to 404)
    // Real backstory files should not contain HTML tags
    if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
      return null;
    }
    
    // Check if content is empty or just whitespace
    if (!content.trim()) {
      return null;
    }
    
    return content;
  } catch (error) {
    console.warn(`Failed to load backstory for ${slug}:`, error);
    return null;
  }
}

export async function loadAllData(): Promise<LoadedData> {
  const [ocs, groups, species, tags, dialogs] = await Promise.all([
    loadOCs(),
    loadGroups(),
    loadSpecies(),
    loadTags(),
    loadDialogs(),
  ]);

  return {
    ocs,
    groups,
    species,
    tags,
    dialogs,
  };
}
