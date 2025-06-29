import type { OC } from "./slot";
import type { OcGroupInfo } from "./group";

// Interface for OC data from JSON files
interface OcData {
  name: string;
  group: string;
  avatar: string;
  description: string;
  gallery: string[];
}

// Interface for settings data
interface SettingsData {
  ocGroups: {
    name: string;
    avatarFrameColor: string;
  }[];
}

// Load OC files using fetch
async function loadOcData(): Promise<OcData[]> {
  try {
    const ocDataArray: OcData[] = [];

    // Hardcoded list of OC files - in a real app you might get this list from an API
    const ocFiles = ["1_non.json", "2_vhhz.json"];

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

// Convert OC data to OC interface and group them
export async function loadAndGroupOcData(): Promise<OcGroupInfo[]> {
  try {
    const [ocDataArray, settingsData] = await Promise.all([
      loadOcData(),
      loadSettingsData(),
    ]);

    // Create a map to group OCs by their group name
    const groupMap = new Map<string, OC[]>();

    // Process each OC and group them
    ocDataArray.forEach((ocData, index) => {
      const oc: OC = {
        id: (index + 1).toString(),
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

    settingsData.ocGroups.forEach((groupSetting, index) => {
      const ocsInGroup = groupMap.get(groupSetting.name) || [];

      if (ocsInGroup.length > 0) {
        groupedData.push({
          id: `group-${index}`,
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
