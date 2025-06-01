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
          ban_reason: string | null
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
          ban_reason?: string | null
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
          ban_reason?: string | null
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
      appeals: {
        Row: {
          admin_response: string | null
          created_at: string
          email: string
          id: string
          message: string
          status: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          status?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          status?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      receipt_validations: {
        Row: {
          confidence_score: number | null
          created_at: string
          deposit_id: string | null
          extracted_amount: number | null
          extracted_method: string | null
          extracted_text: string | null
          id: string
          is_valid: boolean | null
          validation_errors: string[] | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          deposit_id?: string | null
          extracted_amount?: number | null
          extracted_method?: string | null
          extracted_text?: string | null
          id?: string
          is_valid?: boolean | null
          validation_errors?: string[] | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          deposit_id?: string | null
          extracted_amount?: number | null
          extracted_method?: string | null
          extracted_text?: string | null
          id?: string
          is_valid?: boolean | null
          validation_errors?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "receipt_validations_deposit_id_fkey"
            columns: ["deposit_id"]
            isOneToOne: false
            referencedRelation: "deposits"
            referencedColumns: ["id"]
          }
        ]
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
          withdrawal_method: string | null
          admin_response: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
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
          withdrawal_method?: string | null
          admin_response?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
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
          withdrawal_method?: string | null
          admin_response?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
        }
        Relationships: []
      }
      deposit_notifications: {
        Row: {
          id: string
          user_id: string
          deposit_id: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          deposit_id: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          deposit_id?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      withdrawal_notifications: {
        Row: {
          id: string
          user_id: string
          withdrawal_id: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          withdrawal_id: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          withdrawal_id?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_notifications_withdrawal_id_fkey"
            columns: ["withdrawal_id"]
            isOneToOne: false
            referencedRelation: "withdrawals"
            referencedColumns: ["id"]
          }
        ]
      }
      game_history: {
        Row: {
          id: string
          user_id: string
          game_type: string
          bet_amount: number
          result_type: string
          win_amount: number
          loss_amount: number
          multiplier: number
          game_details: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_type: string
          bet_amount: number
          result_type: string
          win_amount?: number
          loss_amount?: number
          multiplier?: number
          game_details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_type?: string
          bet_amount?: number
          result_type?: string
          win_amount?: number
          loss_amount?: number
          multiplier?: number
          game_details?: Json
          created_at?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          activity_value: number
          game_type: string | null
          metadata: Json
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          activity_value?: number
          game_type?: string | null
          metadata?: Json
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          activity_value?: number
          game_type?: string | null
          metadata?: Json
          session_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      quest_definitions: {
        Row: {
          id: number
          title: string
          description: string
          difficulty_tier: string
          task_type: string
          target_value: number
          reward_min: number
          reward_max: number
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          description: string
          difficulty_tier: string
          task_type: string
          target_value?: number
          reward_min: number
          reward_max: number
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string
          difficulty_tier?: string
          task_type?: string
          target_value?: number
          reward_min?: number
          reward_max?: number
          created_at?: string
        }
        Relationships: []
      }
      daily_quests: {
        Row: {
          id: string
          user_id: string
          quest_definition_id: number
          date: string
          progress: number
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quest_definition_id: number
          date?: string
          progress?: number
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quest_definition_id?: number
          date?: string
          progress?: number
          is_completed?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_quests_quest_definition_id_fkey"
            columns: ["quest_definition_id"]
            isOneToOne: false
            referencedRelation: "quest_definitions"
            referencedColumns: ["id"]
          }
        ]
      }
      quest_rewards_claimed: {
        Row: {
          id: string
          user_id: string
          date: string
          total_reward: number
          quest_ids: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          total_reward: number
          quest_ids: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          total_reward?: number
          quest_ids?: string[]
          created_at?: string
        }
        Relationships: []
      }
      egg_types: {
        Row: {
          id: number
          name: string
          rarity: string
          price: number
          hatch_time: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          rarity: string
          price: number
          hatch_time?: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          rarity?: string
          price?: number
          hatch_time?: number
          created_at?: string
        }
        Relationships: []
      }
      pet_types: {
        Row: {
          id: number
          name: string
          egg_type_id: number
          rarity: string
          sprite_emoji: string
          trait_type: string
          trait_value: number
          drop_rate: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          egg_type_id: number
          rarity: string
          sprite_emoji?: string
          trait_type: string
          trait_value?: number
          drop_rate?: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          egg_type_id?: number
          rarity?: string
          sprite_emoji?: string
          trait_type?: string
          trait_value?: number
          drop_rate?: number
          created_at?: string
        }
        Relationships: []
      }
      user_eggs: {
        Row: {
          id: string
          user_id: string
          egg_type_id: number
          status: string
          incubation_start: string | null
          hatch_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          egg_type_id: number
          status?: string
          incubation_start?: string | null
          hatch_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          egg_type_id?: number
          status?: string
          incubation_start?: string | null
          hatch_time?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_pets: {
        Row: {
          id: string
          user_id: string
          pet_type_id: number
          name: string | null
          is_active: boolean
          garden_position: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pet_type_id: number
          name?: string | null
          is_active?: boolean
          garden_position?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pet_type_id?: number
          name?: string | null
          is_active?: boolean
          garden_position?: number | null
          created_at?: string
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
      update_quest_progress: {
        Args: {
          p_user_id: string
          p_activity_type: string
          p_activity_value?: number
          p_game_type?: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      clear_user_data: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      reset_all_php_balances: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      reset_all_coins: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      reset_all_itlog_tokens: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      reset_all_balances: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_balance_quests: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
      handle_deposit_approval: {
        Args: {
          p_user_id: string
          p_amount: number
          p_status?: string
        }
        Returns: undefined
      }
      handle_game_win: {
        Args: {
          p_user_id: string
          p_win_amount: number
          p_game_type: string
        }
        Returns: undefined
      }
      handle_game_play: {
        Args: {
          p_user_id: string
          p_game_type: string
        }
        Returns: undefined
      }
      fix_quest_progress_for_user: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
      claim_quest_rewards: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      assign_daily_quests: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
      purchase_egg: {
        Args: {
          p_user_id: string
          p_egg_type_id: number
        }
        Returns: Json
      }
      start_incubation: {
        Args: {
          p_user_id: string
          p_egg_id: string
        }
        Returns: Json
      }
      hatch_egg: {
        Args: {
          p_user_id: string
          p_egg_id: string
        }
        Returns: Json
      }
      place_pet_in_garden: {
        Args: {
          p_user_id: string
          p_pet_id: string
          p_position: number
        }
        Returns: Json
      }
      remove_pet_from_garden: {
        Args: {
          p_user_id: string
          p_pet_id: string
        }
        Returns: Json
      }
      get_user_pet_boosts: {
        Args: {
          p_user_id: string
        }
        Returns: {
          trait_type: string
          total_boost: number
        }[]
      }
      harvest_farming_rewards: {
        Args: {
          p_user_id: string
          p_session_id: string
        }
        Returns: Json
      }
      sell_pet: {
        Args: {
          p_user_id: string
          p_pet_id: string
        }
        Returns: Json
      }
      skip_egg_hatching: {
        Args: {
          p_user_id: string
          p_egg_id: string
        }
        Returns: Json
      }
      admin_delete_user: {
        Args: {
          target_user_id: string
        }
        Returns: Json
      }
      execute_sql: {
        Args: {
          sql_query: string
        }
        Returns: Json
      }
      admin_give_custom_amounts: {
        Args: {
          p_user_ids: string[]
          p_php_amount?: number
          p_coins_amount?: number
          p_itlog_amount?: number
        }
        Returns: Json
      }
      admin_reset_all_balances: {
        Args: {
          p_balance_type: string
        }
        Returns: Json
      }
      admin_clear_user_data: {
        Args: {
          p_user_id: string
        }
        Returns: Json
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