export interface MessageContent {
  name: string | null;
  content: string | null;
  blinkie?: string | null;
  thumbnail?: string | null;
  full_image?: string | null;
  caption?: string | null;
  content_warning?: string | null;
}

export interface Message {
  id: number;
  content: MessageContent;
  created_at: string;
  updated_at: string;
  expire_at: string;
  type: "note" | "fan art";
  password: string | null;
  uploaded_path: string | null;
  content_warning?: string;
}
