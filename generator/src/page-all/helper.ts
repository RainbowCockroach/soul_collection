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
  ocFilesFullList: string[];
  ocFilesSpotlight: string[];
}

// Load OC files using fetch
async function loadOcData(settingsData: SettingsData): Promise<OcData[]> {
  try {
    const ocDataArray: OcData[] = [];

    // Get OC files list from settings
    const ocFiles = settingsData.ocFilesFullList;

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
    return { ocGroups: [], ocFilesFullList: [], ocFilesSpotlight: [] };
  } catch (error) {
    console.error("Error loading settings data:", error);
    return { ocGroups: [], ocFilesFullList: [], ocFilesSpotlight: [] };
  }
}

// Convert OC data to OC interface and group them
export async function loadAndGroupOcData(): Promise<OcGroupInfo[]> {
  try {
    // Load settings first to get the OC files list
    const settingsData = await loadSettingsData();
    const ocDataArray = await loadOcData(settingsData);

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
