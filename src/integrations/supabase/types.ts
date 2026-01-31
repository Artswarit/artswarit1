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
      artist_availability: {
        Row: {
          artist_id: string
          created_at: string | null
          date: string
          id: string
          note: string | null
          status: string
        }
        Insert: {
          artist_id: string
          created_at?: string | null
          date: string
          id?: string
          note?: string | null
          status?: string
        }
        Update: {
          artist_id?: string
          created_at?: string | null
          date?: string
          id?: string
          note?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_availability_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_availability_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_services: {
        Row: {
          artist_id: string
          created_at: string
          description: string | null
          id: string
          starting_price: number | null
          title: string
          updated_at: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          description?: string | null
          id?: string
          starting_price?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          description?: string | null
          id?: string
          starting_price?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_services_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_services_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          sort_order: number | null
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
          sort_order?: number | null
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
          sort_order?: number | null
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
            referencedRelation: "public_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artworks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_reviews: {
        Row: {
          artist_id: string
          client_id: string
          created_at: string
          id: string
          project_id: string
          rating: number
          review_text: string | null
          updated_at: string
        }
        Insert: {
          artist_id: string
          client_id: string
          created_at?: string
          id?: string
          project_id: string
          rating: number
          review_text?: string | null
          updated_at?: string
        }
        Update: {
          artist_id?: string
          client_id?: string
          created_at?: string
          id?: string
          project_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_reviews_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_reviews_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
            referencedRelation: "public_users"
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
      country_currencies: {
        Row: {
          country_code: string
          country_name: string
          created_at: string
          currency_code: string
          currency_symbol: string
          id: string
        }
        Insert: {
          country_code: string
          country_name: string
          created_at?: string
          currency_code: string
          currency_symbol: string
          id?: string
        }
        Update: {
          country_code?: string
          country_name?: string
          created_at?: string
          currency_code?: string
          currency_symbol?: string
          id?: string
        }
        Relationships: []
      }
      dispute_evidence: {
        Row: {
          created_at: string
          description: string | null
          dispute_id: string
          file_name: string | null
          file_url: string | null
          id: string
          submitted_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          dispute_id: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          submitted_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          dispute_id?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_evidence_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          milestone_id: string | null
          project_id: string
          raised_by: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          milestone_id?: string | null
          project_id: string
          raised_by: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          milestone_id?: string | null
          project_id?: string
          raised_by?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
            referencedRelation: "public_users"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "public_users"
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
            referencedRelation: "public_users"
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
      login_sessions: {
        Row: {
          browser: string | null
          created_at: string
          device_info: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          is_current: boolean | null
          last_active_at: string | null
          location: string | null
          os: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_info?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active_at?: string | null
          location?: string | null
          os?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_info?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active_at?: string | null
          location?: string | null
          os?: string | null
          user_id?: string
        }
        Relationships: []
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
      milestone_revisions: {
        Row: {
          created_at: string
          id: string
          milestone_id: string
          reason: string
          requested_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          milestone_id: string
          reason: string
          requested_by: string
        }
        Update: {
          created_at?: string
          id?: string
          milestone_id?: string
          reason?: string
          requested_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_revisions_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_submissions: {
        Row: {
          created_at: string
          id: string
          is_final: boolean | null
          milestone_id: string
          notes: string | null
          submitted_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_final?: boolean | null
          milestone_id: string
          notes?: string | null
          submitted_by: string
        }
        Update: {
          created_at?: string
          id?: string
          is_final?: boolean | null
          milestone_id?: string
          notes?: string | null
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_submissions_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
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
            referencedRelation: "public_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          artist_id: string
          artist_payout: number
          client_id: string
          created_at: string
          currency: string
          error_message: string | null
          id: string
          milestone_id: string
          paid_at: string | null
          payment_method: string | null
          platform_fee: number
          project_id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          artist_id: string
          artist_payout?: number
          client_id: string
          created_at?: string
          currency?: string
          error_message?: string | null
          id?: string
          milestone_id: string
          paid_at?: string | null
          payment_method?: string | null
          platform_fee?: number
          project_id: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          artist_id?: string
          artist_payout?: number
          client_id?: string
          created_at?: string
          currency?: string
          error_message?: string | null
          id?: string
          milestone_id?: string
          paid_at?: string | null
          payment_method?: string | null
          platform_fee?: number
          project_id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          avatar_url: string | null
          avg_response_hours: number | null
          bio: string | null
          city: string | null
          country: string | null
          cover_url: string | null
          created_at: string
          currency: string | null
          email: string
          email_notifications: boolean | null
          experience_years: number | null
          full_name: string | null
          hourly_rate: number | null
          id: string
          in_app_notifications: boolean | null
          is_on_vacation: boolean | null
          is_verified: boolean | null
          language: string | null
          last_active_at: string | null
          location: string | null
          message_notifications: boolean | null
          portfolio_url: string | null
          profile_visibility: boolean | null
          project_update_notifications: boolean | null
          recovery_codes_hash: string | null
          recovery_phone: string | null
          role: string
          show_activity_stats: boolean | null
          show_last_active: boolean | null
          social_links: Json | null
          tags: string[] | null
          timezone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          account_status?: string | null
          avatar_url?: string | null
          avg_response_hours?: number | null
          bio?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string | null
          email: string
          email_notifications?: boolean | null
          experience_years?: number | null
          full_name?: string | null
          hourly_rate?: number | null
          id: string
          in_app_notifications?: boolean | null
          is_on_vacation?: boolean | null
          is_verified?: boolean | null
          language?: string | null
          last_active_at?: string | null
          location?: string | null
          message_notifications?: boolean | null
          portfolio_url?: string | null
          profile_visibility?: boolean | null
          project_update_notifications?: boolean | null
          recovery_codes_hash?: string | null
          recovery_phone?: string | null
          role?: string
          show_activity_stats?: boolean | null
          show_last_active?: boolean | null
          social_links?: Json | null
          tags?: string[] | null
          timezone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          account_status?: string | null
          avatar_url?: string | null
          avg_response_hours?: number | null
          bio?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string | null
          email?: string
          email_notifications?: boolean | null
          experience_years?: number | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          in_app_notifications?: boolean | null
          is_on_vacation?: boolean | null
          is_verified?: boolean | null
          language?: string | null
          last_active_at?: string | null
          location?: string | null
          message_notifications?: boolean | null
          portfolio_url?: string | null
          profile_visibility?: boolean | null
          project_update_notifications?: boolean | null
          recovery_codes_hash?: string | null
          recovery_phone?: string | null
          role?: string
          show_activity_stats?: boolean | null
          show_last_active?: boolean | null
          social_links?: Json | null
          tags?: string[] | null
          timezone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      project_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          milestone_id: string | null
          project_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          milestone_id?: string | null
          project_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          milestone_id?: string | null
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_activity_logs_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activity_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          created_at: string
          id: string
          mime_type: string | null
          original_name: string
          project_id: string
          size_bytes: number | null
          storage_bucket: string
          storage_path: string
          uploader_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime_type?: string | null
          original_name: string
          project_id: string
          size_bytes?: number | null
          storage_bucket?: string
          storage_path: string
          uploader_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mime_type?: string | null
          original_name?: string
          project_id?: string
          size_bytes?: number | null
          storage_bucket?: string
          storage_path?: string
          uploader_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          amount: number
          amount_paid: number | null
          approved_at: string | null
          auto_approve_at: string | null
          created_at: string
          created_by: string
          deliverables: string | null
          description: string | null
          due_date: string | null
          id: string
          max_revisions: number | null
          paid_at: string | null
          payment_id: string | null
          payment_link: string | null
          project_id: string
          revision_count: number | null
          sort_order: number
          status: string
          submitted_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number
          amount_paid?: number | null
          approved_at?: string | null
          auto_approve_at?: string | null
          created_at?: string
          created_by: string
          deliverables?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          max_revisions?: number | null
          paid_at?: string | null
          payment_id?: string | null
          payment_link?: string | null
          project_id: string
          revision_count?: number | null
          sort_order?: number
          status?: string
          submitted_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_paid?: number | null
          approved_at?: string | null
          auto_approve_at?: string | null
          created_at?: string
          created_by?: string
          deliverables?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          max_revisions?: number | null
          paid_at?: string | null
          payment_id?: string | null
          payment_link?: string | null
          project_id?: string
          revision_count?: number | null
          sort_order?: number
          status?: string
          submitted_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_reviews: {
        Row: {
          artist_id: string
          artist_response: string | null
          artist_response_at: string | null
          client_id: string
          created_at: string
          id: string
          project_id: string
          rating: number
          review_text: string | null
          updated_at: string
        }
        Insert: {
          artist_id: string
          artist_response?: string | null
          artist_response_at?: string | null
          client_id: string
          created_at?: string
          id?: string
          project_id: string
          rating: number
          review_text?: string | null
          updated_at?: string
        }
        Update: {
          artist_id?: string
          artist_response?: string | null
          artist_response_at?: string | null
          client_id?: string
          created_at?: string
          id?: string
          project_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_reviews_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_reviews_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          artist_id: string | null
          auto_approve_days: number | null
          budget: number | null
          client_id: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          is_locked: boolean | null
          progress: number | null
          reference_files: Json | null
          status: string | null
          terms_accepted_at: string | null
          terms_accepted_by: string | null
          title: string
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          auto_approve_days?: number | null
          budget?: number | null
          client_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_locked?: boolean | null
          progress?: number | null
          reference_files?: Json | null
          status?: string | null
          terms_accepted_at?: string | null
          terms_accepted_by?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          auto_approve_days?: number | null
          budget?: number | null
          client_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_locked?: boolean | null
          progress?: number | null
          reference_files?: Json | null
          status?: string | null
          terms_accepted_at?: string | null
          terms_accepted_by?: string | null
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
      razorpay_accounts: {
        Row: {
          account_status: string
          bank_account_name: string | null
          bank_account_number: string | null
          bank_iban: string | null
          bank_ifsc_code: string | null
          bank_swift_code: string | null
          country: string | null
          created_at: string
          id: string
          kyc_status: string
          payouts_enabled: boolean
          phone: string | null
          razorpay_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_iban?: string | null
          bank_ifsc_code?: string | null
          bank_swift_code?: string | null
          country?: string | null
          created_at?: string
          id?: string
          kyc_status?: string
          payouts_enabled?: boolean
          phone?: string | null
          razorpay_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_iban?: string | null
          bank_ifsc_code?: string | null
          bank_swift_code?: string | null
          country?: string | null
          created_at?: string
          id?: string
          kyc_status?: string
          payouts_enabled?: boolean
          phone?: string | null
          razorpay_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recently_viewed: {
        Row: {
          id: string
          item_id: string
          item_type: string
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          item_id: string
          item_type: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recently_viewed_user_id_fkey"
            columns: ["user_id"]
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
            referencedRelation: "public_users"
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
            referencedRelation: "public_users"
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
      saved_artworks: {
        Row: {
          artwork_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          artwork_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          artwork_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_artworks_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_artworks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_artworks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_files: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_preview: boolean | null
          submission_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_preview?: boolean | null
          submission_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_preview?: boolean | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_files_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "milestone_submissions"
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
            referencedRelation: "public_users"
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
            referencedRelation: "public_users"
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
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
      user_warnings: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          issued_by: string | null
          reason: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          issued_by?: string | null
          reason: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          issued_by?: string | null
          reason?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
      webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed: boolean
          processed_at: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed?: boolean
          processed_at?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
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
          cover_url: string | null
          created_at: string | null
          experience_years: number | null
          full_name: string | null
          hourly_rate: number | null
          id: string | null
          is_verified: boolean | null
          last_active_at: string | null
          location: string | null
          portfolio_url: string | null
          profile_visibility: boolean | null
          role: string | null
          show_activity_stats: boolean | null
          show_last_active: boolean | null
          social_links: Json | null
          tags: string[] | null
          website: string | null
        }
        Insert: {
          account_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string | null
          experience_years?: number | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string | null
          is_verified?: boolean | null
          last_active_at?: string | null
          location?: string | null
          portfolio_url?: string | null
          profile_visibility?: boolean | null
          role?: string | null
          show_activity_stats?: boolean | null
          show_last_active?: boolean | null
          social_links?: Json | null
          tags?: string[] | null
          website?: string | null
        }
        Update: {
          account_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string | null
          experience_years?: number | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string | null
          is_verified?: boolean | null
          last_active_at?: string | null
          location?: string | null
          portfolio_url?: string | null
          profile_visibility?: boolean | null
          role?: string | null
          show_activity_stats?: boolean | null
          show_last_active?: boolean | null
          social_links?: Json | null
          tags?: string[] | null
          website?: string | null
        }
        Relationships: []
      }
      public_users: {
        Row: {
          bio: string | null
          cover_photo_url: string | null
          created_at: string | null
          id: string | null
          name: string | null
          profile_pic_url: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          social_links: Json | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          profile_pic_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          profile_pic_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          social_links?: Json | null
          updated_at?: string | null
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
      get_public_user_info: {
        Args: { target_user_id: string }
        Returns: {
          bio: string
          cover_photo_url: string
          created_at: string
          id: string
          name: string
          profile_pic_url: string
          role: Database["public"]["Enums"]["user_role"]
          social_links: Json
          updated_at: string
        }[]
      }
      increment_artwork_views: {
        Args: { artwork_uuid: string; user_uuid: string }
        Returns: number
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_project_participant: {
        Args: { project_uuid: string; user_uuid: string }
        Returns: boolean
      }
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
      dispute_status:
        | "open"
        | "under_review"
        | "resolved_approved"
        | "resolved_revision"
        | "resolved_cancelled"
      media_type_enum: "image" | "video" | "audio" | "3d_model"
      milestone_status:
        | "pending"
        | "in_progress"
        | "submitted"
        | "revision_requested"
        | "approved"
        | "paid"
        | "disputed"
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
      dispute_status: [
        "open",
        "under_review",
        "resolved_approved",
        "resolved_revision",
        "resolved_cancelled",
      ],
      media_type_enum: ["image", "video", "audio", "3d_model"],
      milestone_status: [
        "pending",
        "in_progress",
        "submitted",
        "revision_requested",
        "approved",
        "paid",
        "disputed",
      ],
      notification_type: ["success", "error", "info", "warning"],
      project_status: ["pending", "accepted", "completed", "cancelled"],
      subscription_tier: ["monthly", "yearly", "lifetime"],
      transaction_status: ["pending", "success", "failed"],
      user_role: ["artist", "client", "admin"],
    },
  },
} as const
