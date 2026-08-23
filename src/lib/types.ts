import type { Region } from "@/lib/regions";

export type BabyGender = "male" | "female";

export interface Baby {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  photo_url: string | null;
  diet_filter: string;
  gender: BabyGender | null;
  created_at: string;
}

export interface Profile {
  user_id: string;
  display_name: string | null;
  is_admin: boolean;
  phone_number: string | null;
  region: Region | null;
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
