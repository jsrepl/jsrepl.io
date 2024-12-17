import * as ReplFS from '@/lib/repl-fs'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          id: string
          user_name: string | null
        }
        Insert: {
          avatar_url?: string | null
          id: string
          user_name?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      repls: {
        Row: {
          active_model: string
          created_at: string
          description: string
          fs: ReplFS.FS
          id: string
          opened_models: string[]
          show_preview: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_model?: string
          created_at?: string
          description?: string
          fs: ReplFS.FS
          id?: string
          opened_models?: string[]
          show_preview?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          active_model?: string
          created_at?: string
          description?: string
          fs?: ReplFS.FS
          id?: string
          opened_models?: string[]
          show_preview?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'repls_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'public_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      views: {
        Row: {
          created_at: string
          id: number
          repl_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          repl_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: number
          repl_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'views_repl_id_fkey'
            columns: ['repl_id']
            isOneToOne: false
            referencedRelation: 'recent_user_repls'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'views_repl_id_fkey'
            columns: ['repl_id']
            isOneToOne: false
            referencedRelation: 'repls'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'views_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'public_profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      recent_user_repls: {
        Row: {
          active_model: string
          created_at: string
          description: string
          fs: ReplFS.FS
          id: string
          opened_models: string[]
          show_preview: boolean
          title: string
          updated_at: string
          user_id: string
          viewed_at: string
        }
        Relationships: [
          {
            foreignKeyName: 'repls_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'public_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      recent_user_views: {
        Row: {
          created_at: string
          id: number
          repl_id: string
          user_id: string
        }
        Relationships: [
          {
            foreignKeyName: 'views_repl_id_fkey'
            columns: ['repl_id']
            isOneToOne: false
            referencedRelation: 'recent_user_repls'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'views_repl_id_fkey'
            columns: ['repl_id']
            isOneToOne: false
            referencedRelation: 'repls'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'views_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'public_profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Functions: {
      nanoid: {
        Args: {
          size?: number
          alphabet?: string
          additionalbytesfactor?: number
        }
        Returns: string
      }
      nanoid_optimized: {
        Args: {
          size: number
          alphabet: string
          mask: number
          step: number
        }
        Returns: string
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

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never
