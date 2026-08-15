export interface Baby {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  photo_url: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      babies: {
        Row: Baby;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          birth_date: string;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          birth_date?: string;
          photo_url?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
