export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_requests: {
        Row: {
          clause_type: string
          created_at: string | null
          id: string
          language: string
          model: string
          prompt: string
          user_id: string
        }
        Insert: {
          clause_type: string
          created_at?: string | null
          id?: string
          language: string
          model: string
          prompt: string
          user_id: string
        }
        Update: {
          clause_type?: string
          created_at?: string | null
          id?: string
          language?: string
          model?: string
          prompt?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_responses: {
        Row: {
          clause_type: string
          created_at: string | null
          id: string
          language: string
          model: string
          prompt: string
          response: string
          user_id: string
        }
        Insert: {
          clause_type: string
          created_at?: string | null
          id?: string
          language: string
          model: string
          prompt: string
          response: string
          user_id: string
        }
        Update: {
          clause_type?: string
          created_at?: string | null
          id?: string
          language?: string
          model?: string
          prompt?: string
          response?: string
          user_id?: string
        }
        Relationships: []
      }
      approval_tokens: {
        Row: {
          contract_id: string
          created_at: string | null
          email: string | null
          expires_at: string | null
          party_id: string
          party_name: string
          party_role: string
          phone: string | null
          token: string
          used: boolean | null
          used_at: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          party_id: string
          party_name: string
          party_role: string
          phone?: string | null
          token: string
          used?: boolean | null
          used_at?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          party_id?: string
          party_name?: string
          party_role?: string
          phone?: string | null
          token?: string
          used?: boolean | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_tokens_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          created_at: string | null
          end_date: string
          first_party_crn_ar: string
          first_party_crn_en: string
          first_party_name_ar: string
          first_party_name_en: string
          id: string
          letterhead: string | null
          location_ar: string
          location_en: string
          product_ar: string
          product_en: string
          promoter_id_ar: string
          promoter_id_en: string
          promoter_name_ar: string
          promoter_name_en: string
          promoter_photo: string | null
          ref_number: string
          second_party_crn_ar: string
          second_party_crn_en: string
          second_party_name_ar: string
          second_party_name_en: string
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          first_party_crn_ar: string
          first_party_crn_en: string
          first_party_name_ar: string
          first_party_name_en: string
          id?: string
          letterhead?: string | null
          location_ar: string
          location_en: string
          product_ar: string
          product_en: string
          promoter_id_ar: string
          promoter_id_en: string
          promoter_name_ar: string
          promoter_name_en: string
          promoter_photo?: string | null
          ref_number: string
          second_party_crn_ar: string
          second_party_crn_en: string
          second_party_name_ar: string
          second_party_name_en: string
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          first_party_crn_ar?: string
          first_party_crn_en?: string
          first_party_name_ar?: string
          first_party_name_en?: string
          id?: string
          letterhead?: string | null
          location_ar?: string
          location_en?: string
          product_ar?: string
          product_en?: string
          promoter_id_ar?: string
          promoter_id_en?: string
          promoter_name_ar?: string
          promoter_name_en?: string
          promoter_photo?: string | null
          ref_number?: string
          second_party_crn_ar?: string
          second_party_crn_en?: string
          second_party_name_ar?: string
          second_party_name_en?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          contract_id: string
          created_at: string | null
          description: string | null
          file_url: string
          id: string
          include_in_print: boolean | null
          name: string
          type: string
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          description?: string | null
          file_url: string
          id?: string
          include_in_print?: boolean | null
          name: string
          type: string
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          description?: string | null
          file_url?: string
          id?: string
          include_in_print?: boolean | null
          name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      image_chunks: {
        Row: {
          chunk_data: string
          chunk_index: number
          contract_id: string
          created_at: string | null
          id: number
          image_type: string
        }
        Insert: {
          chunk_data: string
          chunk_index: number
          contract_id: string
          created_at?: string | null
          id?: number
          image_type: string
        }
        Update: {
          chunk_data?: string
          chunk_index?: number
          contract_id?: string
          created_at?: string | null
          id?: number
          image_type?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          channel: string
          contract_id: string | null
          created_at: string | null
          email_body: string | null
          id: string
          metadata: Json | null
          priority: string
          recipient_email: string | null
          recipient_name: string
          recipient_phone: string | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string
          whatsapp_body: string | null
        }
        Insert: {
          channel: string
          contract_id?: string | null
          created_at?: string | null
          email_body?: string | null
          id?: string
          metadata?: Json | null
          priority: string
          recipient_email?: string | null
          recipient_name: string
          recipient_phone?: string | null
          sent_at?: string | null
          status: string
          subject: string
          template_id: string
          whatsapp_body?: string | null
        }
        Update: {
          channel?: string
          contract_id?: string | null
          created_at?: string | null
          email_body?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          recipient_email?: string | null
          recipient_name?: string
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string
          whatsapp_body?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      signatories: {
        Row: {
          contract_id: string
          created_at: string | null
          email: string | null
          id: string
          name: string
          party_id: string
          phone: string | null
          role: string
          signature_data: string | null
          signed: boolean | null
          signed_at: string | null
          stamp_data: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          party_id: string
          phone?: string | null
          role: string
          signature_data?: string | null
          signed?: boolean | null
          signed_at?: string | null
          stamp_data?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          party_id?: string
          phone?: string | null
          role?: string
          signature_data?: string | null
          signed?: boolean | null
          signed_at?: string | null
          stamp_data?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signatories_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
