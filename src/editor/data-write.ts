import type { OC, Group, Spieces, GalleryItem } from "../helpers/objects";

interface SpiecesJsonData {
  [key: string]: Omit<Spieces, "slug">;
}

interface GroupJsonData {
  [key: string]: Omit<Group, "slug">;
}

interface OcJsonData {
  [key: string]: Omit<OC, "slug">;
}

// Helper function to simulate file writing in browser environment
async function writeToFile(
  fileName: string,
  data: SpiecesJsonData | GroupJsonData | OcJsonData
): Promise<void> {
  // In a real browser environment, this would use APIs like:
  // - File System Access API (if available)
  // - Download the file
  // - Send to a backend API
  // For now, we'll create a download
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(`File ${fileName} prepared for download`);
}

export async function saveSpecies(species: Spieces[]): Promise<void> {
  const data: SpiecesJsonData = {};
  species.forEach((item) => {
    const { slug, ...rest } = item;
    data[slug] = rest;
  });

  try {
    await writeToFile("spieces.json", data);
  } catch (error) {
    console.error("Error saving species data:", error);
    throw error;
  }
}

export async function saveGroups(groups: Group[]): Promise<void> {
  const data: GroupJsonData = {};
  groups.forEach((item) => {
    const { slug, ...rest } = item;
    data[slug] = rest;
  });

  try {
    await writeToFile("group.json", data);
  } catch (error) {
    console.error("Error saving group data:", error);
    throw error;
  }
}

export async function saveOCs(ocs: OC[]): Promise<void> {
  const data: OcJsonData = {};
  ocs.forEach((item) => {
    const { slug, ...rest } = item;
    data[slug] = rest;
  });

  try {
    await writeToFile("oc.json", data);
  } catch (error) {
    console.error("Error saving OC data:", error);
    throw error;
  }
}

export async function saveSpeciesById(
  slug: string,
  species: Omit<Spieces, "slug">
): Promise<void> {
  try {
    // Load current data from module
    const speciesModule = await import("../data/spieces.json");
    const currentData = { ...speciesModule.default } as SpiecesJsonData;

    // Update the specific species
    currentData[slug] = species;

    // Save the updated data
    await writeToFile("spieces.json", currentData);
  } catch (error) {
    console.error("Error saving species by ID:", error);
    throw error;
  }
}

export async function saveGroupById(
  slug: string,
  group: Omit<Group, "slug">
): Promise<void> {
  try {
    // Load current data from module
    const groupModule = await import("../data/group.json");
    const currentData = { ...groupModule.default } as GroupJsonData;

    // Update the specific group
    currentData[slug] = group;

    // Save the updated data
    await writeToFile("group.json", currentData);
  } catch (error) {
    console.error("Error saving group by ID:", error);
    throw error;
  }
}

export async function saveOCById(
  slug: string,
  oc: Omit<OC, "slug">
): Promise<void> {
  try {
    // Load current data from module
    const ocModule = await import("../data/oc.json");
    const currentData = { ...ocModule.default } as OcJsonData;

    // Update the specific OC
    currentData[slug] = oc;

    // Save the updated data
    await writeToFile("oc.json", currentData);
  } catch (error) {
    console.error("Error saving OC by ID:", error);
    throw error;
  }
}

export async function deleteSpeciesById(slug: string): Promise<void> {
  try {
    // Load current data from module
    const speciesModule = await import("../data/spieces.json");
    const currentData = { ...speciesModule.default } as SpiecesJsonData;

    // Delete the specific species
    delete currentData[slug];

    // Save the updated data
    await writeToFile("spieces.json", currentData);
  } catch (error) {
    console.error("Error deleting species by ID:", error);
    throw error;
  }
}

export async function deleteGroupById(slug: string): Promise<void> {
  try {
    // Load current data from module
    const groupModule = await import("../data/group.json");
    const currentData = { ...groupModule.default } as GroupJsonData;

    // Delete the specific group
    delete currentData[slug];

    // Save the updated data
    await writeToFile("group.json", currentData);
  } catch (error) {
    console.error("Error deleting group by ID:", error);
    throw error;
  }
}

export async function deleteOCById(slug: string): Promise<void> {
  try {
    // Load current data from module
    const ocModule = await import("../data/oc.json");
    const currentData = { ...ocModule.default } as OcJsonData;

    // Delete the specific OC
    delete currentData[slug];

    // Save the updated data
    await writeToFile("oc.json", currentData);
  } catch (error) {
    console.error("Error deleting OC by ID:", error);
    throw error;
  }
}
