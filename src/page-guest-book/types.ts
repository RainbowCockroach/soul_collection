export interface MessageContent {
  name: string;
  content: string;
  blinkie?: string;
  thumbnail?: string;
  full_image?: string;
  caption?: string;
  content_warning?: string;
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
