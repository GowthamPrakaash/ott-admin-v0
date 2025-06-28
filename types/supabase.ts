export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      movies: {
        Row: {
          id: string
          title: string
          description: string
          meta_title: string | null
          meta_description: string | null
          duration: number
          release_year: number
          genre: string
          video_id: string
          poster_url: string
          created_at: string
          status: string
          subtitles: Json
        }
        Insert: {
          id?: string
          title: string
          description: string
          meta_title?: string | null
          meta_description?: string | null
          duration: number
          release_year: number
          genre: string
          video_id: string
          poster_url: string
          created_at?: string
          status?: string
          subtitles?: Json
        }
        Update: {
          id?: string
          title?: string
          description?: string
          meta_title?: string | null
          meta_description?: string | null
          duration?: number
          release_year?: number
          genre?: string
          video_id?: string
          poster_url?: string
          created_at?: string
          status?: string
          subtitles?: Json
        }
      }
      series: {
        Row: {
          id: string
          title: string
          description: string
          meta_title: string | null
          meta_description: string | null
          release_year: number
          genre: string
          poster_url: string
          created_at: string
          status: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          meta_title?: string | null
          meta_description?: string | null
          release_year: number
          genre: string
          poster_url: string
          created_at?: string
          status?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          meta_title?: string | null
          meta_description?: string | null
          release_year?: number
          genre?: string
          poster_url?: string
          created_at?: string
          status?: string
        }
      }
      episodes: {
        Row: {
          id: string
          series_id: string
          title: string
          description: string
          meta_title: string | null
          meta_description: string | null
          season_number: number
          episode_number: number
          duration: number
          video_id: string
          poster_url: string
          created_at: string
          status: string
          release_date: string
          subtitles: Json
        }
        Insert: {
          id?: string
          series_id: string
          title: string
          description: string
          meta_title?: string | null
          meta_description?: string | null
          season_number: number
          episode_number: number
          duration: number
          video_id: string
          poster_url: string
          created_at?: string
          status?: string
          release_date?: string
          subtitles?: Json
        }
        Update: {
          id?: string
          series_id?: string
          title?: string
          description?: string
          meta_title?: string | null
          meta_description?: string | null
          season_number?: number
          episode_number?: number
          duration?: number
          video_id?: string
          poster_url?: string
          created_at?: string
          status?: string
          release_date?: string
          subtitles?: Json
        }
      }
      genres: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
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
      [_ in never]: never
    }
  }
}
