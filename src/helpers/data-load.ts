import type { OC, Group, Spieces } from "./objects";
import ocData from "../data/oc.json";
import groupData from "../data/group.json";
import speciesData from "../data/spieces.json";

export interface LoadedData {
  ocs: OC[];
  groups: Group[];
  species: Spieces[];
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

export interface OcWithDetails extends OC {
  groupDetails: Group[];
  speciesDetails: Spieces[];
}

export async function loadOcBySlug(
  slug: string
): Promise<OcWithDetails | null> {
  const [ocs, groups, species] = await Promise.all([
    loadOCs(),
    loadGroups(),
    loadSpecies(),
  ]);

  const oc = ocs.find((oc) => oc.slug === slug);
  if (!oc) {
    return null;
  }

  const groupDetails = groups.filter((group) => oc.group.includes(group.slug));
  const speciesDetails = species.filter((species) =>
    oc.spieces.includes(species.slug)
  );

  return {
    ...oc,
    groupDetails,
    speciesDetails,
  };
}

export async function loadAllData(): Promise<LoadedData> {
  const [ocs, groups, species] = await Promise.all([
    loadOCs(),
    loadGroups(),
    loadSpecies(),
  ]);

  return {
    ocs,
    groups,
    species,
  };
}
