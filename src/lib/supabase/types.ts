export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  competition: {
    Tables: {
      policies: {
        Row: {
          id: number
          title: string
          short_name: string
          category: string
          sport_id: number | null
          policy_number: string
          version: string
          status: string
          content_text: string
          content_html: string | null
          summary: string | null
          effective_date: string
          expiration_date: string | null
          tags: string[]
          keywords: string[]
          applies_to_sports: string[]
          metadata: Json
          created_by: string | null
          updated_by: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          short_name: string
          category: string
          sport_id?: number | null
          policy_number: string
          version?: string
          status?: string
          content_text: string
          content_html?: string | null
          summary?: string | null
          effective_date: string
          expiration_date?: string | null
          tags?: string[]
          keywords?: string[]
          applies_to_sports?: string[]
          metadata?: Json
          created_by?: string | null
          updated_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          short_name?: string
          category?: string
          sport_id?: number | null
          policy_number?: string
          version?: string
          status?: string
          content_text?: string
          content_html?: string | null
          summary?: string | null
          effective_date?: string
          expiration_date?: string | null
          tags?: string[]
          keywords?: string[]
          applies_to_sports?: string[]
          metadata?: Json
          created_by?: string | null
          updated_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sports: {
        Row: {
          id: number
          name: string
          abbreviation: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          abbreviation: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          abbreviation?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      policy_category: 
        | 'scheduling_policies'
        | 'officiating'
        | 'playing_rules'
        | 'equipment_specifications'
        | 'facility_standards'
        | 'travel_procedures'
        | 'media_relations'
        | 'safety_protocols'
        | 'awards_recognition'
        | 'championship_procedures'
        | 'venue_requirements'
        | 'broadcasting_standards'
        | 'governance'
        | 'game_management'
        | 'crowd_control'
        | 'eligibility'
        | 'administrative'
      policy_status: 'draft' | 'current' | 'archived' | 'pending_approval'
    }
  }
}