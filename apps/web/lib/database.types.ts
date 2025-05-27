export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          avatar_url: string | null;
          character_name: string | null;
          preferences: Json | null;
          completed_onboarding: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          avatar_url?: string | null;
          character_name?: string | null;
          preferences?: Json | null;
          completed_onboarding?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          avatar_url?: string | null;
          character_name?: string | null;
          preferences?: Json | null;
          completed_onboarding?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      quests: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          content: Json;
          type: string;
          status: string;
          progress: number;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          content: Json;
          type?: string;
          status?: string;
          progress?: number;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          content?: Json;
          type?: string;
          status?: string;
          progress?: number;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_stats: {
        Row: {
          user_id: string;
          level: number;
          xp: number;
          quests_completed: number;
          quests_created: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          level?: number;
          xp?: number;
          quests_completed?: number;
          quests_created?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          level?: number;
          xp?: number;
          quests_completed?: number;
          quests_created?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      quest_achievements: {
        Row: {
          id: string;
          quest_id: string;
          title: string;
          description: string;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          quest_id: string;
          title: string;
          description: string;
          icon: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          quest_id?: string;
          title?: string;
          description?: string;
          icon?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
}
