export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          level: number
          xp: number
          quests_created: number
          quests_completed: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          level?: number
          xp?: number
          quests_created?: number
          quests_completed?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          level?: number
          xp?: number
          quests_created?: number
          quests_completed?: number
          created_at?: string
          updated_at?: string
        }
      }
      quests: {
        Row: {
          id: string
          title: string
          description: string | null
          content: Json
          created_at: string
          updated_at: string
          user_id: string
          is_public: boolean
          published_at: string | null
          quest_type: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content: Json
          created_at?: string
          updated_at?: string
          user_id: string
          is_public?: boolean
          published_at?: string | null
          quest_type?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: Json
          created_at?: string
          updated_at?: string
          user_id?: string
          is_public?: boolean
          published_at?: string | null
          quest_type?: string | null
        }
      }
      quest_completions: {
        Row: {
          id: string
          quest_id: string
          user_id: string
          progress: number
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          quest_id: string
          user_id: string
          progress?: number
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          quest_id?: string
          user_id?: string
          progress?: number
          started_at?: string
          completed_at?: string | null
        }
      }
      quest_tasks: {
        Row: {
          id: string
          quest_id: string
          title: string
          description: string | null
          xp: number
          order_num: number
        }
        Insert: {
          id?: string
          quest_id: string
          title: string
          description?: string | null
          xp?: number
          order_num: number
        }
        Update: {
          id?: string
          quest_id?: string
          title?: string
          description?: string | null
          xp?: number
          order_num?: number
        }
      }
      user_task_progress: {
        Row: {
          id: string
          task_id: string
          user_id: string
          completed: boolean
          progress: number
          completed_at: string | null
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          completed?: boolean
          progress?: number
          completed_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          completed?: boolean
          progress?: number
          completed_at?: string | null
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          features: Json
          active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          features?: Json
          active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          features?: Json
          active?: boolean
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          starts_at: string
          expires_at: string | null
          active: boolean
          payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          starts_at?: string
          expires_at?: string | null
          active?: boolean
          payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          starts_at?: string
          expires_at?: string | null
          active?: boolean
          payment_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
