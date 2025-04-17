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
