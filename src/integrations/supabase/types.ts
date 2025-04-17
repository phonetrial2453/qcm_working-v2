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
      applications: {
        Row: {
          call_response: string | null
          class_code: string
          created_at: string
          current_residence: Json
          followup_by: string | null
          hometown_details: Json
          id: string
          naqeeb: string | null
          naqeeb_response: string | null
          other_details: Json
          referred_by: Json
          remarks: string | null
          status: string
          student_category: string | null
          student_details: Json
          student_nature: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          call_response?: string | null
          class_code: string
          created_at?: string
          current_residence: Json
          followup_by?: string | null
          hometown_details: Json
          id?: string
          naqeeb?: string | null
          naqeeb_response?: string | null
          other_details: Json
          referred_by: Json
          remarks?: string | null
          status?: string
          student_category?: string | null
          student_details: Json
          student_nature?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          call_response?: string | null
          class_code?: string
          created_at?: string
          current_residence?: Json
          followup_by?: string | null
          hometown_details?: Json
          id?: string
          naqeeb?: string | null
          naqeeb_response?: string | null
          other_details?: Json
          referred_by?: Json
          remarks?: string | null
          status?: string
          student_category?: string | null
          student_details?: Json
          student_nature?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      "applications-class1": {
        Row: {
          "Application ID": number | null
          Area: string | null
          "Batch#": string | null
          "Birth Year (YYYY)": string | null
          "Call Response": string | null
          City: string | null
          Country: string | null
          District: string | null
          "Email Address": string | null
          Final_StudentID: number | null
          "FollowUp By": string | null
          HomeCntry: string | null
          "Mobile#": string | null
          Name: string | null
          "Naqeeb (1)": string | null
          "Naqeeb Response": string | null
          NaqeebCleaned: string | null
          "Phy Meet": string | null
          ProcessDate: string | null
          Profession: string | null
          Qualification: string | null
          Ref_FullName: string | null
          Ref_Mobile: string | null
          RngStart: number | null
          Seq: number | null
          State: string | null
          "Student Category": string | null
          "Student ID#": string | null
          "Student Nature": string | null
          "Town/City": string | null
          "WhatsApp#": string | null
          Zone: string | null
        }
        Insert: {
          "Application ID"?: number | null
          Area?: string | null
          "Batch#"?: string | null
          "Birth Year (YYYY)"?: string | null
          "Call Response"?: string | null
          City?: string | null
          Country?: string | null
          District?: string | null
          "Email Address"?: string | null
          Final_StudentID?: number | null
          "FollowUp By"?: string | null
          HomeCntry?: string | null
          "Mobile#"?: string | null
          Name?: string | null
          "Naqeeb (1)"?: string | null
          "Naqeeb Response"?: string | null
          NaqeebCleaned?: string | null
          "Phy Meet"?: string | null
          ProcessDate?: string | null
          Profession?: string | null
          Qualification?: string | null
          Ref_FullName?: string | null
          Ref_Mobile?: string | null
          RngStart?: number | null
          Seq?: number | null
          State?: string | null
          "Student Category"?: string | null
          "Student ID#"?: string | null
          "Student Nature"?: string | null
          "Town/City"?: string | null
          "WhatsApp#"?: string | null
          Zone?: string | null
        }
        Update: {
          "Application ID"?: number | null
          Area?: string | null
          "Batch#"?: string | null
          "Birth Year (YYYY)"?: string | null
          "Call Response"?: string | null
          City?: string | null
          Country?: string | null
          District?: string | null
          "Email Address"?: string | null
          Final_StudentID?: number | null
          "FollowUp By"?: string | null
          HomeCntry?: string | null
          "Mobile#"?: string | null
          Name?: string | null
          "Naqeeb (1)"?: string | null
          "Naqeeb Response"?: string | null
          NaqeebCleaned?: string | null
          "Phy Meet"?: string | null
          ProcessDate?: string | null
          Profession?: string | null
          Qualification?: string | null
          Ref_FullName?: string | null
          Ref_Mobile?: string | null
          RngStart?: number | null
          Seq?: number | null
          State?: string | null
          "Student Category"?: string | null
          "Student ID#"?: string | null
          "Student Nature"?: string | null
          "Town/City"?: string | null
          "WhatsApp#"?: string | null
          Zone?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
