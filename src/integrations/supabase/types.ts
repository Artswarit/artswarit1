export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      artwork_feedback: {
        Row: {
          artwork_id: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          artwork_id: string
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          artwork_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artwork_feedback_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "artwork_feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      artwork_likes: {
        Row: {
          artwork_id: string | null
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          artwork_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          artwork_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artwork_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artwork_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artwork_views: {
        Row: {
          artwork_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          artwork_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          artwork_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      artworks: {
        Row: {
          artist_id: string
          category: string
          created_at: string
          description: string | null
          id: string
          media_type: Database["public"]["Enums"]["media_type_enum"]
          media_url: string
          metadata: Json | null
          price: number | null
          status: Database["public"]["Enums"]["artwork_status"]
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          artist_id: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          media_type?: Database["public"]["Enums"]["media_type_enum"]
          media_url: string
          metadata?: Json | null
          price?: number | null
          status?: Database["public"]["Enums"]["artwork_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          artist_id?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          media_type?: Database["public"]["Enums"]["media_type_enum"]
          media_url?: string
          metadata?: Json | null
          price?: number | null
          status?: Database["public"]["Enums"]["artwork_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artworks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          artwork_id: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          artwork_id: string
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          artwork_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          artist_id: string | null
          client_id: string | null
          created_at: string
          id: string
          project_title: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          project_title?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          project_title?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      function_logs: {
        Row: {
          action_type: string
          component_name: string | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          function_name: string
          id: string
          input_data: Json | null
          ip_address: unknown
          output_data: Json | null
          session_id: string | null
          success: boolean
          task_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          component_name?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          function_name: string
          id?: string
          input_data?: Json | null
          ip_address?: unknown
          output_data?: Json | null
          session_id?: string | null
          success?: boolean
          task_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          component_name?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          function_name?: string
          id?: string
          input_data?: Json | null
          ip_address?: unknown
          output_data?: Json | null
          session_id?: string | null
          success?: boolean
          task_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "function_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      function_task_mappings: {
        Row: {
          auto_assign: boolean
          auto_create_task: boolean
          component_name: string | null
          created_at: string
          default_priority: string
          function_name: string
          id: string
          task_template: Json
          updated_at: string
        }
        Insert: {
          auto_assign?: boolean
          auto_create_task?: boolean
          component_name?: string | null
          created_at?: string
          default_priority?: string
          function_name: string
          id?: string
          task_template?: Json
          updated_at?: string
        }
        Update: {
          auto_assign?: boolean
          auto_create_task?: boolean
          component_name?: string | null
          created_at?: string
          default_priority?: string
          function_name?: string
          id?: string
          task_template?: Json
          updated_at?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          artwork_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          artwork_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          artwork_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          experience_years: number | null
          full_name: string | null
          hourly_rate: number | null
          id: string
          is_verified: boolean | null
          location: string | null
          portfolio_url: string | null
          role: string
          social_links: Json | null
          tags: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          account_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          experience_years?: number | null
          full_name?: string | null
          hourly_rate?: number | null
          id: string
          is_verified?: boolean | null
          location?: string | null
          portfolio_url?: string | null
          role?: string
          social_links?: Json | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          account_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          experience_years?: number | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          is_verified?: boolean | null
          location?: string | null
          portfolio_url?: string | null
          role?: string
          social_links?: Json | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          artist_id: string | null
          budget: number | null
          client_id: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          budget?: number | null
          client_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          budget?: number | null
          client_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          artwork_id: string | null
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          artwork_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          status?: string
          user_id?: string | null
        }
        Update: {
          artwork_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          amount: number
          artist_id: string
          artwork_id: string | null
          buyer_id: string | null
          created_at: string
          currency: string | null
          id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          artist_id: string
          artwork_id?: string | null
          buyer_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          artist_id?: string
          artwork_id?: string | null
          buyer_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      saved_artists: {
        Row: {
          artist_id: string
          client_id: string
          created_at: string
          id: string
        }
        Insert: {
          artist_id: string
          client_id: string
          created_at?: string
          id?: string
        }
        Update: {
          artist_id?: string
          client_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_artists_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_artists_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          renew_at: string | null
          started_at: string
          stripe_customer_id: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at: string
          upgraded_role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          renew_at?: string | null
          started_at?: string
          stripe_customer_id?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
          upgraded_role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          renew_at?: string | null
          started_at?: string
          stripe_customer_id?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
          upgraded_role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscribers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          artist_id: string | null
          created_at: string | null
          id: string
          next_billing: string | null
          status: string | null
          tier: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          artist_id?: string | null
          created_at?: string | null
          id?: string
          next_billing?: string | null
          status?: string | null
          tier: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          artist_id?: string | null
          created_at?: string | null
          id?: string
          next_billing?: string | null
          status?: string | null
          tier?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          component_name: string | null
          created_at: string
          description: string | null
          function_name: string
          id: string
          metadata: Json | null
          priority: string
          started_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          component_name?: string | null
          created_at?: string
          description?: string | null
          function_name: string
          id?: string
          metadata?: Json | null
          priority?: string
          started_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          component_name?: string | null
          created_at?: string
          description?: string | null
          function_name?: string
          id?: string
          metadata?: Json | null
          priority?: string
          started_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          artwork_id: string
          buyer_id: string
          created_at: string
          id: string
          seller_id: string
          status: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          artwork_id: string
          buyer_id: string
          created_at?: string
          id?: string
          seller_id: string
          status?: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          artwork_id?: string
          buyer_id?: string
          created_at?: string
          id?: string
          seller_id?: string
          status?: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          bio: string | null
          cover_photo_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          profile_pic_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          social_links: Json | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          cover_photo_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          profile_pic_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          social_links?: Json | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          cover_photo_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          profile_pic_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          social_links?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_method: string
          processed_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_method: string
          processed_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_method?: string
          processed_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          account_status: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          experience_years: number | null
          full_name: string | null
          hourly_rate: number | null
          id: string | null
          is_verified: boolean | null
          location: string | null
          portfolio_url: string | null
          role: string | null
          social_links: Json | null
          tags: string[] | null
          website: string | null
        }
        Insert: {
          account_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          experience_years?: number | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string | null
          is_verified?: boolean | null
          location?: string | null
          portfolio_url?: string | null
          role?: string | null
          social_links?: Json | null
          tags?: string[] | null
          website?: string | null
        }
        Update: {
          account_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          experience_years?: number | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string | null
          is_verified?: boolean | null
          location?: string | null
          portfolio_url?: string | null
          role?: string | null
          social_links?: Json | null
          tags?: string[] | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_artist_dashboard_stats: {
        Args: { artist_uuid: string }
        Returns: Json
      }
      get_artist_stats: { Args: { artist_uuid: string }; Returns: Json }
      increment_artwork_views: {
        Args: { artwork_uuid: string; user_uuid: string }
        Returns: number
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      record_artwork_sale: {
        Args: { artwork_uuid: string; buyer_uuid: string; sale_amount: number }
        Returns: string
      }
    }
    Enums: {
      account_status: "pending" | "approved" | "rejected"
      app_role: "admin" | "moderator" | "artist" | "client"
      approval_status: "pending" | "approved" | "rejected"
      artwork_status: "public" | "private" | "archived"
      media_type_enum: "image" | "video" | "audio" | "3d_model"
      notification_type: "success" | "error" | "info" | "warning"
      project_status: "pending" | "accepted" | "completed" | "cancelled"
      subscription_tier: "monthly" | "yearly" | "lifetime"
      transaction_status: "pending" | "success" | "failed"
      user_role: "artist" | "client" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["pending", "approved", "rejected"],
      app_role: ["admin", "moderator", "artist", "client"],
      approval_status: ["pending", "approved", "rejected"],
      artwork_status: ["public", "private", "archived"],
      media_type_enum: ["image", "video", "audio", "3d_model"],
      notification_type: ["success", "error", "info", "warning"],
      project_status: ["pending", "accepted", "completed", "cancelled"],
      subscription_tier: ["monthly", "yearly", "lifetime"],
      transaction_status: ["pending", "success", "failed"],
      user_role: ["artist", "client", "admin"],
    },
  },
} as const
