import censorData from "../data/vanilla-mode-censor.json";

export interface VanillaModeCensorData {
  ocs: string[];
  tags: string[];
}

const censor: VanillaModeCensorData = censorData;

export function isOcCensored(slug: string): boolean {
  return censor.ocs.includes(slug);
}

export function isTagCensored(slug: string): boolean {
  return censor.tags.includes(slug);
}
