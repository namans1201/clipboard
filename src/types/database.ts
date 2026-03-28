export interface Clip {
  id: string;
  user_id: string;
  content: string;
  title: string | null;
  is_pinned: boolean;
  is_deleted: boolean;
  group_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  user_id: string;
  name: string;
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
