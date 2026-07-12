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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
  mux: {
    Tables: {
      assets: {
        Row: {
          aspect_ratio: string | null
          created_at: string | null
          duration_seconds: number | null
          errors: Json | null
          id: string
          ingest_type: string | null
          input_info: Json | null
          is_live: boolean | null
          is_premium: boolean | null
          live_stream_id: string | null
          master: Json | null
          master_access: string | null
          max_resolution_tier: string | null
          max_stored_frame_rate: number | null
          meta: Json | null
          non_standard_input_reasons: Json | null
          normalize_audio: boolean | null
          passthrough: string | null
          playback_ids: Json | null
          progress: Json | null
          recording_times: Json | null
          resolution_tier: string | null
          source_asset_id: string | null
          static_renditions: Json | null
          status: string | null
          test: boolean | null
          tracks: Json | null
          upload_id: string | null
          video_quality: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          errors?: Json | null
          id: string
          ingest_type?: string | null
          input_info?: Json | null
          is_live?: boolean | null
          is_premium?: boolean | null
          live_stream_id?: string | null
          master?: Json | null
          master_access?: string | null
          max_resolution_tier?: string | null
          max_stored_frame_rate?: number | null
          meta?: Json | null
          non_standard_input_reasons?: Json | null
          normalize_audio?: boolean | null
          passthrough?: string | null
          playback_ids?: Json | null
          progress?: Json | null
          recording_times?: Json | null
          resolution_tier?: string | null
          source_asset_id?: string | null
          static_renditions?: Json | null
          status?: string | null
          test?: boolean | null
          tracks?: Json | null
          upload_id?: string | null
          video_quality?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          errors?: Json | null
          id?: string
          ingest_type?: string | null
          input_info?: Json | null
          is_live?: boolean | null
          is_premium?: boolean | null
          live_stream_id?: string | null
          master?: Json | null
          master_access?: string | null
          max_resolution_tier?: string | null
          max_stored_frame_rate?: number | null
          meta?: Json | null
          non_standard_input_reasons?: Json | null
          normalize_audio?: boolean | null
          passthrough?: string | null
          playback_ids?: Json | null
          progress?: Json | null
          recording_times?: Json | null
          resolution_tier?: string | null
          source_asset_id?: string | null
          static_renditions?: Json | null
          status?: string | null
          test?: boolean | null
          tracks?: Json | null
          upload_id?: string | null
          video_quality?: string | null
        }
        Relationships: []
      }
      live_streams: {
        Row: {
          active_asset_id: string | null
          active_ingest_protocol: string | null
          audio_only: boolean | null
          created_at: string | null
          embedded_subtitles: Json | null
          generated_subtitles: Json | null
          id: string
          latency_mode: string | null
          max_continuous_duration_seconds: number | null
          meta: Json | null
          new_asset_settings: Json | null
          passthrough: string | null
          playback_ids: Json | null
          recent_asset_ids: Json | null
          reconnect_slate_url: string | null
          reconnect_window_seconds: number | null
          simulcast_targets: Json | null
          srt_passphrase: string | null
          status: string | null
          stream_key: string | null
          test: boolean | null
          use_slate_for_standard_latency: boolean | null
        }
        Insert: {
          active_asset_id?: string | null
          active_ingest_protocol?: string | null
          audio_only?: boolean | null
          created_at?: string | null
          embedded_subtitles?: Json | null
          generated_subtitles?: Json | null
          id: string
          latency_mode?: string | null
          max_continuous_duration_seconds?: number | null
          meta?: Json | null
          new_asset_settings?: Json | null
          passthrough?: string | null
          playback_ids?: Json | null
          recent_asset_ids?: Json | null
          reconnect_slate_url?: string | null
          reconnect_window_seconds?: number | null
          simulcast_targets?: Json | null
          srt_passphrase?: string | null
          status?: string | null
          stream_key?: string | null
          test?: boolean | null
          use_slate_for_standard_latency?: boolean | null
        }
        Update: {
          active_asset_id?: string | null
          active_ingest_protocol?: string | null
          audio_only?: boolean | null
          created_at?: string | null
          embedded_subtitles?: Json | null
          generated_subtitles?: Json | null
          id?: string
          latency_mode?: string | null
          max_continuous_duration_seconds?: number | null
          meta?: Json | null
          new_asset_settings?: Json | null
          passthrough?: string | null
          playback_ids?: Json | null
          recent_asset_ids?: Json | null
          reconnect_slate_url?: string | null
          reconnect_window_seconds?: number | null
          simulcast_targets?: Json | null
          srt_passphrase?: string | null
          status?: string | null
          stream_key?: string | null
          test?: boolean | null
          use_slate_for_standard_latency?: boolean | null
        }
        Relationships: []
      }
      uploads: {
        Row: {
          asset_id: string | null
          cors_origin: string | null
          error: Json | null
          id: string
          status: string | null
          test: boolean | null
          timeout_seconds: number | null
          url: string | null
        }
        Insert: {
          asset_id?: string | null
          cors_origin?: string | null
          error?: Json | null
          id: string
          status?: string | null
          test?: boolean | null
          timeout_seconds?: number | null
          url?: string | null
        }
        Update: {
          asset_id?: string | null
          cors_origin?: string | null
          error?: Json | null
          id?: string
          status?: string | null
          test?: boolean | null
          timeout_seconds?: number | null
          url?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          attempts: Json | null
          created_at: string | null
          environment: Json | null
          headers: Json | null
          id: string
          object: Json | null
          raw_body: Json | null
          type: string | null
        }
        Insert: {
          attempts?: Json | null
          created_at?: string | null
          environment?: Json | null
          headers?: Json | null
          id: string
          object?: Json | null
          raw_body?: Json | null
          type?: string | null
        }
        Update: {
          attempts?: Json | null
          created_at?: string | null
          environment?: Json | null
          headers?: Json | null
          id?: string
          object?: Json | null
          raw_body?: Json | null
          type?: string | null
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
  pgmq_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive: {
        Args: { msg_id: number; queue_name: string }
        Returns: boolean
      }
      delete: { Args: { msg_id: number; queue_name: string }; Returns: boolean }
      pop: {
        Args: { queue_name: string }
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "message_record"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      read: {
        Args: { n?: number; queue_name: string; sleep_seconds?: number }
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "message_record"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      send: { Args: { message: Json; queue_name: string }; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      users: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          received_welcome_email: boolean | null
          username: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          received_welcome_email?: boolean | null
          username?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          received_welcome_email?: boolean | null
          username?: string | null
        }
        Relationships: []
      }
      video_metadata: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          mux_asset_id: string | null
          mux_playback_id: string | null
          mux_upload_id: string | null
          status: string | null
          thumbnail_url: string | null
          title: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mux_asset_id?: string | null
          mux_playback_id?: string | null
          mux_upload_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mux_asset_id?: string | null
          mux_playback_id?: string | null
          mux_upload_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_metadata_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "video_thumbnails"
            referencedColumns: ["id"]
          },
        ]
      }
      video_thumbnails: {
        Row: {
          created_at: string
          id: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          url?: string | null
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
  graphql_public: {
    Enums: {},
  },
  mux: {
    Enums: {},
  },
  pgmq_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
