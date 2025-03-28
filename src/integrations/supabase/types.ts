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
      customers: {
        Row: {
          business_type: Database["public"]["Enums"]["business_type"]
          classification: number
          contact_person: string
          created_at: string
          credit_balance: number
          current_points: number
          id: string
          level: number
          name: string
          phone: string
          points_earned: number
          points_redeemed: number
          updated_at: string
        }
        Insert: {
          business_type: Database["public"]["Enums"]["business_type"]
          classification?: number
          contact_person: string
          created_at?: string
          credit_balance?: number
          current_points?: number
          id: string
          level?: number
          name: string
          phone: string
          points_earned?: number
          points_redeemed?: number
          updated_at?: string
        }
        Update: {
          business_type?: Database["public"]["Enums"]["business_type"]
          classification?: number
          contact_person?: string
          created_at?: string
          credit_balance?: number
          current_points?: number
          id?: string
          level?: number
          name?: string
          phone?: string
          points_earned?: number
          points_redeemed?: number
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          id: string
          invoice_id: string
          points_earned: number
          price: number
          product_id: string
          quantity: number
          total_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id: string
          points_earned: number
          price: number
          product_id: string
          quantity: number
          total_price: number
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string
          points_earned?: number
          price?: number
          product_id?: string
          quantity?: number
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          categories_count: number
          created_at: string
          customer_id: string
          date: string
          due_date: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          points_earned: number
          points_redeemed: number
          status: Database["public"]["Enums"]["invoice_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          categories_count: number
          created_at?: string
          customer_id: string
          date: string
          due_date?: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          points_earned: number
          points_redeemed: number
          status: Database["public"]["Enums"]["invoice_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          categories_count?: number
          created_at?: string
          customer_id?: string
          date?: string
          due_date?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          points_earned?: number
          points_redeemed?: number
          status?: Database["public"]["Enums"]["invoice_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          date: string
          id: string
          invoice_id: string | null
          method: string
          notes: string | null
          type: Database["public"]["Enums"]["payment_type"]
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          date: string
          id: string
          invoice_id?: string | null
          method: string
          notes?: string | null
          type: Database["public"]["Enums"]["payment_type"]
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          date?: string
          id?: string
          invoice_id?: string | null
          method?: string
          notes?: string | null
          type?: Database["public"]["Enums"]["payment_type"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string
          category: Database["public"]["Enums"]["product_category"]
          created_at: string
          id: string
          name: string
          points_earned: number
          points_required: number
          price: number
          unit: string
          updated_at: string
        }
        Insert: {
          brand: string
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string
          id: string
          name: string
          points_earned: number
          points_required: number
          price: number
          unit: string
          updated_at?: string
        }
        Update: {
          brand?: string
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          id?: string
          name?: string
          points_earned?: number
          points_required?: number
          price?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      redemption_items: {
        Row: {
          created_at: string
          id: string
          points_required: number
          product_id: string
          quantity: number
          redemption_id: string
          total_points_required: number
        }
        Insert: {
          created_at?: string
          id?: string
          points_required: number
          product_id: string
          quantity: number
          redemption_id: string
          total_points_required: number
        }
        Update: {
          created_at?: string
          id?: string
          points_required?: number
          product_id?: string
          quantity?: number
          redemption_id?: string
          total_points_required?: number
        }
        Relationships: [
          {
            foreignKeyName: "redemption_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemption_items_redemption_id_fkey"
            columns: ["redemption_id"]
            isOneToOne: false
            referencedRelation: "redemptions"
            referencedColumns: ["id"]
          },
        ]
      }
      redemptions: {
        Row: {
          created_at: string
          customer_id: string
          date: string
          id: string
          status: Database["public"]["Enums"]["redemption_status"]
          total_points_redeemed: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          date: string
          id: string
          status: Database["public"]["Enums"]["redemption_status"]
          total_points_redeemed: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          date?: string
          id?: string
          status?: Database["public"]["Enums"]["redemption_status"]
          total_points_redeemed?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          id: number
          settings_json: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: number
          settings_json?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          settings_json?: Json
          updated_at?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "accountant" | "sales" | "user"
      business_type:
        | "مركز خدمة"
        | "مركز صيانة"
        | "معرض سيارات"
        | "محل كماليات"
        | "محطة وقود"
        | "ماركت"
      invoice_status: "مدفوع" | "غير مدفوع" | "مدفوع جزئياً" | "متأخر"
      payment_method: "نقداً" | "آجل"
      payment_type: "payment" | "refund"
      product_category:
        | "العناية بالمحرك"
        | "العناية بالسطح الخارجي"
        | "العناية بالإطارات"
        | "العناية بالتابلوه"
        | "العناية بالفرش الداخلي"
      redemption_status: "completed" | "cancelled" | "pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
