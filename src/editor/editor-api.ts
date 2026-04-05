const EDITOR_API_URL = "https://09176645.xyz/github-pages-editor";
const PROJECT_ID = "soul_collection";

function getStorageKey(): string {
  return `editor_password_${PROJECT_ID}`;
}

export function getSavedPassword(): string | null {
  return localStorage.getItem(getStorageKey());
}

export function savePassword(password: string): void {
  localStorage.setItem(getStorageKey(), password);
}

export function clearPassword(): void {
  localStorage.removeItem(getStorageKey());
}

export async function verifyPassword(password: string): Promise<boolean> {
  const response = await fetch(`${EDITOR_API_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId: PROJECT_ID, password }),
  });
  return response.ok;
}

export interface SaveResult {
  success: boolean;
  message: string;
  warnings?: string[];
  error?: string;
}

export async function saveAndPush(
  fileId: string,
  content: unknown,
  password: string,
): Promise<SaveResult> {
  const response = await fetch(`${EDITOR_API_URL}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: PROJECT_ID,
      fileId,
      content,
      password,
      timestamp: new Date().toISOString(),
    }),
  });

  const data = await response.json();

  if (response.status === 401) {
    clearPassword();
    return { success: false, message: "", error: "Invalid password" };
  }

  return data as SaveResult;
}
