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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          address: string | null
          amount: number
          buyer_id: string | null
          created_at: string
          customer_id: string | null
          id: string
          location: string | null
          notes: string | null
          paid_at: string | null
          payment_status: string
          payout_amount: number
          paystack_reference: string | null
          photo_urls: string[]
          platform_fee: number
          platform_fee_ngn: number
          price_ngn: number
          provider_id: string
          released_at: string | null
          scheduled_at: string | null
          service_id: string | null
          service_title: string | null
          status: Database["public"]["Enums"]["booking_status"]
          transfer_reference: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          amount?: number
          buyer_id?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_status?: string
          payout_amount?: number
          paystack_reference?: string | null
          photo_urls?: string[]
          platform_fee?: number
          platform_fee_ngn?: number
          price_ngn?: number
          provider_id: string
          released_at?: string | null
          scheduled_at?: string | null
          service_id?: string | null
          service_title?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          transfer_reference?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          amount?: number
          buyer_id?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_status?: string
          payout_amount?: number
          paystack_reference?: string | null
          photo_urls?: string[]
          platform_fee?: number
          platform_fee_ngn?: number
          price_ngn?: number
          provider_id?: string
          released_at?: string | null
          scheduled_at?: string | null
          service_id?: string | null
          service_title?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          transfer_reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      favourites: {
        Row: {
          created_at: string
          id: string
          provider_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          provider_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          provider_id?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string | null
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          sender_id: string
        }
        Insert: {
          body?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          sender_id: string
        }
        Update: {
          body?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          category: string
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          category: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          full_name: string | null
          id: string
          shop_name: string | null
          suspended: boolean
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          full_name?: string | null
          id: string
          shop_name?: string | null
          suspended?: boolean
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          full_name?: string | null
          id?: string
          shop_name?: string | null
          suspended?: boolean
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      provider_payout_details: {
        Row: {
          account_name: string
          account_number: string
          bank_code: string
          bank_name: string
          created_at: string
          paystack_recipient_code: string | null
          provider_id: string
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_code: string
          bank_name: string
          created_at?: string
          paystack_recipient_code?: string | null
          provider_id: string
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_code?: string
          bank_name?: string
          created_at?: string
          paystack_recipient_code?: string | null
          provider_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_payout_details_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_profiles: {
        Row: {
          area: string | null
          available_today: boolean
          business_name: string
          category_id: string | null
          cover_image_url: string | null
          created_at: string
          id: string
          open_now: boolean
          phone: string | null
          price_from: number | null
          published: boolean
          rating: number
          review_count: number
          tagline: string | null
          tier: string
          updated_at: string
          verified: boolean
          whatsapp: string | null
        }
        Insert: {
          area?: string | null
          available_today?: boolean
          business_name?: string
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          id: string
          open_now?: boolean
          phone?: string | null
          price_from?: number | null
          published?: boolean
          rating?: number
          review_count?: number
          tagline?: string | null
          tier?: string
          updated_at?: string
          verified?: boolean
          whatsapp?: string | null
        }
        Update: {
          area?: string | null
          available_today?: boolean
          business_name?: string
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          open_now?: boolean
          phone?: string | null
          price_from?: number | null
          published?: boolean
          rating?: number
          review_count?: number
          tagline?: string | null
          tier?: string
          updated_at?: string
          verified?: boolean
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_profiles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          booking_id: string
          buyer_id: string
          created_at: string
          id: string
          media_urls: string[]
          provider_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          body?: string | null
          booking_id: string
          buyer_id: string
          created_at?: string
          id?: string
          media_urls?: string[]
          provider_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          body?: string | null
          booking_id?: string
          buyer_id?: string
          created_at?: string
          id?: string
          media_urls?: string[]
          provider_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          category: string | null
          category_id: string | null
          created_at: string
          description: string | null
          duration: string | null
          duration_minutes: number | null
          id: string
          image_url: string | null
          is_active: boolean
          price: number
          price_ngn: number
          provider_id: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          price?: number
          price_ngn?: number
          provider_id: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          price?: number
          price_ngn?: number
          provider_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
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
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount_ngn: number
          booking_id: string | null
          created_at: string
          id: string
          metadata: Json
          reference: string | null
          status: Database["public"]["Enums"]["wallet_txn_status"]
          type: Database["public"]["Enums"]["wallet_txn_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_ngn: number
          booking_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          reference?: string | null
          status?: Database["public"]["Enums"]["wallet_txn_status"]
          type: Database["public"]["Enums"]["wallet_txn_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_ngn?: number
          booking_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          reference?: string | null
          status?: Database["public"]["Enums"]["wallet_txn_status"]
          type?: Database["public"]["Enums"]["wallet_txn_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unique_username: { Args: { seed: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      booking_status:
        | "pending"
        | "accepted"
        | "declined"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed"
      wallet_txn_status: "pending" | "completed" | "failed"
      wallet_txn_type:
        | "escrow_hold"
        | "escrow_release"
        | "tip"
        | "withdrawal"
        | "refund"
        | "topup"
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
      app_role: ["admin", "moderator", "user"],
      booking_status: [
        "pending",
        "accepted",
        "declined",
        "in_progress",
        "completed",
        "cancelled",
        "disputed",
      ],
      wallet_txn_status: ["pending", "completed", "failed"],
      wallet_txn_type: [
        "escrow_hold",
        "escrow_release",
        "tip",
        "withdrawal",
        "refund",
        "topup",
      ],
    },
  },
} as const
