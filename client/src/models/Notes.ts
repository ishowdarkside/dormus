export interface Notes {
  id: number;
  title: string;
  is_pinned: boolean;
  description: string;
  created_at: Date;
  created_by: number;
}
