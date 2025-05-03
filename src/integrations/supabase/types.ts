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
          city: string | null
          classification: number
          contact_person: string
          created_at: string
          credit_balance: number
          credit_limit: number | null
          credit_period: number | null
          current_points: number
          governorate: string | null
          id: string
          lastactive: string | null
          level: number
          name: string
          opening_balance: number | null
          phone: string
          points_earned: number
          points_redeemed: number
          updated_at: string
        }
        Insert: {
          business_type: Database["public"]["Enums"]["business_type"]
          city?: string | null
          classification?: number
          contact_person: string
          created_at?: string
          credit_balance?: number
          credit_limit?: number | null
          credit_period?: number | null
          current_points?: number
          governorate?: string | null
          id: string
          lastactive?: string | null
          level?: number
          name: string
          opening_balance?: number | null
          phone: string
          points_earned?: number
          points_redeemed?: number
          updated_at?: string
        }
        Update: {
          business_type?: Database["public"]["Enums"]["business_type"]
          city?: string | null
          classification?: number
          contact_person?: string
          created_at?: string
          credit_balance?: number
          credit_limit?: number | null
          credit_period?: number | null
          current_points?: number
          governorate?: string | null
          id?: string
          lastactive?: string | null
          level?: number
          name?: string
          opening_balance?: number | null
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
      permissions: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      points_history: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          notes: string | null
          points: number
          source: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          notes?: string | null
          points: number
          source: string
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          notes?: string | null
          points?: number
          source?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_history_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
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
          email: string | null
          full_name: string
          id: string
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
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
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
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
      user_permissions: {
        Row: {
          permission_id: string
          user_id: string
        }
        Insert: {
          permission_id: string
          user_id: string
        }
        Update: {
          permission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_role"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
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
        | "المستلزمات"
      redemption_status: "completed" | "cancelled" | "pending"
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
      app_role: ["admin", "manager", "accountant", "sales", "user"],
      business_type: [
        "مركز خدمة",
        "مركز صيانة",
        "معرض سيارات",
        "محل كماليات",
        "محطة وقود",
        "ماركت",
      ],
      invoice_status: ["مدفوع", "غير مدفوع", "مدفوع جزئياً", "متأخر"],
      payment_method: ["نقداً", "آجل"],
      payment_type: ["payment", "refund"],
      product_category: [
        "العناية بالمحرك",
        "العناية بالسطح الخارجي",
        "العناية بالإطارات",
        "العناية بالتابلوه",
        "العناية بالفرش الداخلي",
        "المستلزمات",
      ],
      redemption_status: ["completed", "cancelled", "pending"],
    },
  },
} as const
