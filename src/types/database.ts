export interface Clip {
  id: string;
  user_id: string;
  content: string;
  title: string | null;
  is_pinned: boolean;
  is_deleted: boolean;
  /**
   * Per-clip internal lock. When TRUE, the card renders the "locked cover"
   * design until the user clicks Unlock — useful for sensitive snippets.
   * UI-only — RLS still scopes reads/writes by user.
   */
  is_locked?: boolean;
  group_id: string | null;
  /**
   * Number of grid columns this clip occupies (1-3). Set by the corner
   * drag-resize handle in ClipCard; persisted in the `clips` table.
   * Older rows without this column will be `undefined` and treated as 1.
   */
  width_span?: number;
  /**
   * Number of grid row units this clip occupies (1-3). Same lifecycle
   * as width_span.
   */
  height_span?: number;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  user_id: string;
  name: string;
  is_deleted: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      clips: {
        Row: Clip;
        Insert: Omit<Clip, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Clip, 'id' | 'user_id'>>;
      };
      groups: {
        Row: Group;
        Insert: Omit<Group, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Group, 'id' | 'user_id'>>;
      };
    };
  };
}
