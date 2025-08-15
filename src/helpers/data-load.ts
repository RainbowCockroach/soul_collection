import type { OC, Group, Spieces, FormLink, Tag } from "./objects";
import ocData from "../data/oc.json";
import groupData from "../data/group.json";
import speciesData from "../data/spieces.json";
import formLinkData from "../data/form-link.json";
import tagData from "../data/tag.json";

export interface LoadedData {
  ocs: OC[];
  groups: Group[];
  species: Spieces[];
  tags: Tag[];
}

export async function loadOCs(): Promise<OC[]> {
  return Object.entries(ocData)
    .map(([slug, oc]) => ({
      slug,
      ...(oc as Omit<OC, "slug">),
    }))
    .sort((a, b) => (a.order ?? Number.MAX_VALUE) - (b.order ?? Number.MAX_VALUE));
}

export async function loadGroups(): Promise<Group[]> {
  return Object.entries(groupData)
    .map(([slug, group]) => ({
      slug,
      ...(group as Omit<Group, "slug">),
    }))
    .sort((a, b) => (a.order ?? Number.MAX_VALUE) - (b.order ?? Number.MAX_VALUE));
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

export async function loadAllData(): Promise<LoadedData> {
  const [ocs, groups, species, tags] = await Promise.all([
    loadOCs(),
    loadGroups(),
    loadSpecies(),
    loadTags(),
  ]);

  return {
    ocs,
    groups,
    species,
    tags,
  };
}
