import type { OC } from "./slot";
import type { OcGroupInfo } from "./group";

// Interface for OC data from JSON files
interface OcData {
  slug: string;
  name: string;
  group: string;
  avatar: string;
  description: string;
  gallery: string[];
}

// Interface for settings data
interface SettingsData {
  ocGroups: {
    slug: string;
    name: string;
    avatarFrameColor: string;
  }[];
}

// Interface for filepaths data
interface FilepathsData {
  ocFilesFullList: string[];
  ocFilesSpotlight: string[];
}

// Load OC files using fetch
async function loadOcData(filepathsData: FilepathsData): Promise<OcData[]> {
  try {
    const ocDataArray: OcData[] = [];

    // Get OC files list from filepaths
    const ocFiles = filepathsData.ocFilesFullList;

    for (const fileName of ocFiles) {
      try {
        const response = await fetch(`./oc/${fileName}`);
        if (response.ok) {
          const ocData = (await response.json()) as OcData;
          ocDataArray.push(ocData);
        }
      } catch (fileError) {
        console.warn(`Could not load OC file ${fileName}:`, fileError);
      }
    }

    return ocDataArray;
  } catch (error) {
    console.error("Error loading OC data:", error);
    return [];
  }
}

// Load settings data using fetch
async function loadSettingsData(): Promise<SettingsData> {
  try {
    const response = await fetch("./settings.json");
    if (response.ok) {
      const data = (await response.json()) as SettingsData;
      return data;
    }
    return { ocGroups: [] };
  } catch (error) {
    console.error("Error loading settings data:", error);
    return { ocGroups: [] };
  }
}

// Load filepaths data using fetch
async function loadFilepathsData(): Promise<FilepathsData> {
  try {
    const response = await fetch("./filepaths.json");
    if (response.ok) {
      const data = (await response.json()) as FilepathsData;
      return data;
    }
    return { ocFilesFullList: [], ocFilesSpotlight: [] };
  } catch (error) {
    console.error("Error loading filepaths data:", error);
    return { ocFilesFullList: [], ocFilesSpotlight: [] };
  }
}

// Convert OC data to OC interface and group them
export async function loadAndGroupOcData(): Promise<OcGroupInfo[]> {
  try {
    // Load settings and filepaths
    const settingsData = await loadSettingsData();
    const filepathsData = await loadFilepathsData();
    const ocDataArray = await loadOcData(filepathsData);

    // Create a map to group OCs by their group name
    const groupMap = new Map<string, OC[]>();

    // Process each OC and group them
    ocDataArray.forEach((ocData) => {
      const oc: OC = {
        slug: ocData.slug,
        name: ocData.name,
        avatar: `./media/${ocData.avatar}`,
      };

      if (!groupMap.has(ocData.group)) {
        groupMap.set(ocData.group, []);
      }
      groupMap.get(ocData.group)!.push(oc);
    });

    // Create grouped data based on settings
    const groupedData: OcGroupInfo[] = [];

    settingsData.ocGroups.forEach((groupSetting) => {
      const ocsInGroup = groupMap.get(groupSetting.name) || [];

      if (ocsInGroup.length > 0) {
        groupedData.push({
          id: groupSetting.slug,
          name: groupSetting.name,
          ocList: ocsInGroup,
        });
      }
    });

    return groupedData;
  } catch (error) {
    console.error("Error loading and grouping OC data:", error);
    return [];
  }
}
