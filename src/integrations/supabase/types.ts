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
      deposits: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_method: string
          processed_at: string | null
          processed_by: string | null
          receipt_url: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_method: string
          processed_at?: string | null
          processed_by?: string | null
          receipt_url?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string
          processed_at?: string | null
          processed_by?: string | null
          receipt_url?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      earning_history: {
        Row: {
          created_at: string
          id: string
          session_type: string
          stake_amount: number | null
          tokens_earned: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_type: string
          stake_amount?: number | null
          tokens_earned?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          session_type?: string
          stake_amount?: number | null
          tokens_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      farming_sessions: {
        Row: {
          id: string
          is_active: boolean
          last_reward_at: string | null
          session_type: string
          stake_amount: number | null
          started_at: string | null
          tokens_earned: number
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          last_reward_at?: string | null
          session_type: string
          stake_amount?: number | null
          started_at?: string | null
          tokens_earned?: number
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean
          last_reward_at?: string | null
          session_type?: string
          stake_amount?: number | null
          started_at?: string | null
          tokens_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          bet_amount: number
          client_seed: string
          created_at: string
          game_type: string
          id: string
          itlog_won: number
          nonce: number
          result_hash: string
          server_seed: string
          user_id: string
          win_amount: number
        }
        Insert: {
          bet_amount: number
          client_seed: string
          created_at?: string
          game_type: string
          id?: string
          itlog_won?: number
          nonce: number
          result_hash: string
          server_seed: string
          user_id: string
          win_amount?: number
        }
        Update: {
          bet_amount?: number
          client_seed?: string
          created_at?: string
          game_type?: string
          id?: string
          itlog_won?: number
          nonce?: number
          result_hash?: string
          server_seed?: string
          user_id?: string
          win_amount?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          coins: number
          created_at: string
          id: string
          is_admin: boolean
          is_banned: boolean
          is_suspended: boolean
          itlog_tokens: number
          php_balance: number
          updated_at: string
          user_id: string
          username: string
          wallet_id: string
        }
        Insert: {
          coins?: number
          created_at?: string
          id?: string
          is_admin?: boolean
          is_banned?: boolean
          is_suspended?: boolean
          itlog_tokens?: number
          php_balance?: number
          updated_at?: string
          user_id: string
          username: string
          wallet_id: string
        }
        Update: {
          coins?: number
          created_at?: string
          id?: string
          is_admin?: boolean
          is_banned?: boolean
          is_suspended?: boolean
          itlog_tokens?: number
          php_balance?: number
          updated_at?: string
          user_id?: string
          username?: string
          wallet_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          id: string
          processed_at: string | null
          processed_by: string | null
          status: string
          user_id: string
          withdrawal_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          user_id: string
          withdrawal_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          user_id?: string
          withdrawal_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_user_balance: {
        Args: {
          p_user_id: string
          p_php_change?: number
          p_coins_change?: number
          p_itlog_change?: number
        }
        Returns: boolean
      }
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