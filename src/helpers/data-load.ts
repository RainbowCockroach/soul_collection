import type {
  OC,
  Group,
  Spieces,
  FormLink,
  Tag,
  Ship,
  DialogTexts,
  DialogEntry,
  AdLocations,
  HeightChartGroup,
  VNBioData,
} from "./objects";
import groupData from "../data/group.json";
import speciesData from "../data/spieces.json";
import formLinkData from "../data/form-link.json";
import tagData from "../data/tag.json";
import shipData from "../data/ships.json";
import dialogData from "../data/dialog.json";
import adsData from "../data/ads.json";
import heightChartData from "../data/height-chart.json";
import heightChartGodlyData from "../data/height-chart-godly.json";
import vnBioData from "../data/vn-bio.json";

export interface LoadedData {
  ocs: OC[];
  groups: Group[];
  species: Spieces[];
  tags: Tag[];
  ships: Ship[];
  dialogs: DialogTexts;
}

let ocDataPromise: Promise<Record<string, Omit<OC, "slug">>> | null = null;
function getOcData(): Promise<Record<string, Omit<OC, "slug">>> {
  if (!ocDataPromise) {
    ocDataPromise = import("../data/oc.json").then(
      (m) => m.default as Record<string, Omit<OC, "slug">>,
    );
  }
  return ocDataPromise;
}

export async function loadOCs(): Promise<OC[]> {
  const ocData = await getOcData();
  return Object.entries(ocData)
    .map(([slug, oc]) => ({
      slug,
      ...oc,
    }))
    .sort(
      (a, b) => (a.order ?? Number.MAX_VALUE) - (b.order ?? Number.MAX_VALUE),
    );
}

export async function loadGroups(): Promise<Group[]> {
  return Object.entries(groupData)
    .map(([slug, group]) => ({
      slug,
      ...(group as Omit<Group, "slug">),
    }))
    .sort(
      (a, b) => (a.order ?? Number.MAX_VALUE) - (b.order ?? Number.MAX_VALUE),
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

export async function loadShips(): Promise<Ship[]> {
  return shipData as Ship[];
}

export interface OcWithDetails extends OC {
  groupDetails: Group[];
  speciesDetails: Spieces[];
  tagDetails: Tag[];
}

export async function loadOcBySlug(
  slug: string,
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
    oc.spieces.includes(species.slug),
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

export async function findLinkedOc(
  ocSlug: string,
): Promise<{ linkedSlug: string; isGodForm: boolean } | null> {
  const formLinks = await loadFormLinks();

  for (const link of formLinks) {
    if (link[0] === ocSlug) {
      // Current OC is birth form (index 0), linked is god form (index 1)
      return { linkedSlug: link[1], isGodForm: false };
    } else if (link[1] === ocSlug) {
      // Current OC is god form (index 1), linked is birth form (index 0)
      return { linkedSlug: link[0], isGodForm: true };
    }
  }

  return null;
}

export async function loadDialogs(): Promise<DialogTexts> {
  return dialogData as DialogTexts;
}

export async function loadDialogByKey(
  key: string,
): Promise<DialogEntry[] | null> {
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
    if (content.includes("<!DOCTYPE html>") || content.includes("<html")) {
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
  const [ocs, groups, species, tags, ships, dialogs] = await Promise.all([
    loadOCs(),
    loadGroups(),
    loadSpecies(),
    loadTags(),
    loadShips(),
    loadDialogs(),
  ]);

  return {
    ocs,
    groups,
    species,
    tags,
    ships,
    dialogs,
  };
}

export async function loadVNBio(): Promise<VNBioData> {
  return vnBioData as VNBioData;
}

export async function loadAds(): Promise<AdLocations> {
  return adsData as AdLocations;
}

function sortHeightChartGroups(groups: HeightChartGroup[]): HeightChartGroup[] {
  return [...groups].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

export async function loadHeightChartGroups(): Promise<HeightChartGroup[]> {
  return sortHeightChartGroups(heightChartData as HeightChartGroup[]);
}

export async function loadGodlyHeightChartGroups(): Promise<
  HeightChartGroup[]
> {
  return sortHeightChartGroups(heightChartGodlyData as HeightChartGroup[]);
}
