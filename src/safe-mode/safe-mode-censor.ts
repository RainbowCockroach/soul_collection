import censorData from "../data/safe-mode-censor.json";

export interface SafeModeCensorData {
  ocs: string[];
  tags: string[];
}

const censor: SafeModeCensorData = censorData;

export function isOcCensored(slug: string): boolean {
  return censor.ocs.includes(slug);
}

export function isTagCensored(slug: string): boolean {
  return censor.tags.includes(slug);
}
