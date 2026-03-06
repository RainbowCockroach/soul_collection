import censorData from "../data/kid-mode-censor.json";

export interface KidModeCensorData {
  ocs: string[];
  tags: string[];
}

const censor: KidModeCensorData = censorData;

export function isOcCensored(slug: string): boolean {
  return censor.ocs.includes(slug);
}

export function isTagCensored(slug: string): boolean {
  return censor.tags.includes(slug);
}
