"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Trash2, Upload, X, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

// Update the SubtitleItem type
export type SubtitleItem = {
  language: string
  label: string
  src?: string // Keep this optional for backward compatibility
  file?: File
  isUploading?: boolean
  isNew?: boolean
}

interface SubtitleUploaderProps {
  videoId: string
  value: SubtitleItem[]
  onChange: (subtitles: SubtitleItem[]) => void
  contentType: "movie" | "episode"
}

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
]

export function SubtitleUploader({ videoId, value = [], onChange, contentType }: SubtitleUploaderProps) {
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([])
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newLanguage, setNewLanguage] = useState("")
  const [newLabel, setNewLabel] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initialRenderRef = useRef(true)

  // Initialize subtitles from value prop only once on mount
  useEffect(() => {
    setSubtitles(value || [])
  }, []) // Empty dependency array means this runs once on mount

  // Add an effect to clear subtitles when videoId changes
  useEffect(() => {
    // Clear subtitles when videoId changes (e.g., when uploading a new video)
    if (videoId === "" || !videoId) {
      setSubtitles([])
      onChange([])
    }
  }, [videoId, onChange])

  // Update local state when value prop changes, but only if it's different
  useEffect(() => {
    // Skip the first render to avoid double initialization
    if (initialRenderRef.current) {
      initialRenderRef.current = false
      return
    }

    // Only update if the value has actually changed
    const currentLanguages = subtitles
      .map((s) => s.language)
      .sort()
      .join(",")
    const newLanguages = value
      .map((s) => s.language)
      .sort()
      .join(",")

    if (currentLanguages !== newLanguages) {
      setSubtitles(value || [])
    }
  }, [value])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check if file is a valid subtitle format (srt, vtt, etc.)
      const validExtensions = [".srt", ".vtt", ".sub", ".sbv", ".ttml", ".dfxp"]
      const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()

      if (!validExtensions.includes(fileExtension)) {
        toast.error("Please upload a valid subtitle file (SRT, VTT, SUB, SBV, TTML, DFXP)")
        return
      }

      setSelectedFile(file)
    }
  }

  // Update the handleAddSubtitle function to not store src
  const handleAddSubtitle = async () => {
    if (!newLanguage || !newLabel || !selectedFile || !videoId) {
      toast.error("Please fill in all fields and select a subtitle file")
      return
    }
    if (subtitles.some((sub) => sub.language === newLanguage)) {
      toast.error("A subtitle for this language already exists. Please choose a different language.")
      return
    }
    setIsUploading(true)
    try {
      const newSubtitle: SubtitleItem = {
        language: newLanguage,
        label: newLabel,
        file: selectedFile,
        isUploading: true,
        isNew: true,
      }
      const updatedSubtitles = [...subtitles, newSubtitle]
      setSubtitles(updatedSubtitles)
      // Upload the subtitle file to our local API endpoint
      const formData = new FormData()
      formData.append("file", selectedFile)
      const response = await fetch("/api/upload/subtitle", {
        method: "POST",
        body: formData,
      })
      if (!response.ok) {
        throw new Error("Failed to upload subtitle")
      }
      const data = await response.json()
      // Update the subtitle with the src property
      const finalSubtitles = updatedSubtitles.map((sub) => {
        if (sub.language === newLanguage) {
          return {
            language: sub.language,
            label: sub.label,
            src: data.url,
          }
        }
        return sub
      })
      setSubtitles(finalSubtitles)
      onChange(finalSubtitles)
      toast.success(`${newLabel} subtitle has been added successfully.`)
      setNewLanguage("")
      setNewLabel("")
      setSelectedFile(null)
      setIsAddingNew(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error: any) {
      console.error("Error uploading subtitle:", error)
      const filteredSubtitles = subtitles.filter((sub) => sub.language !== newLanguage)
      setSubtitles(filteredSubtitles)
      onChange(filteredSubtitles)
      toast.error(error.message || "Failed to upload subtitle. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveSubtitle = async (language: string) => {
    // Remove from the list
    const updatedSubtitles = subtitles.filter((sub) => sub.language !== language)
    setSubtitles(updatedSubtitles)
    onChange(updatedSubtitles)

    toast.success("The subtitle has been removed successfully.")
  }

  const getLanguageLabel = (code: string) => {
    const language = LANGUAGE_OPTIONS.find((lang) => lang.value === code)
    return language ? language.label : code
  }

  return (
    <div className="space-y-4">
      {subtitles.length > 0 && (
        <div className="space-y-2">
          <Card>
            <CardContent className="p-4">
              <ul className="space-y-2">
                {subtitles.map((subtitle) => (
                  <li key={subtitle.language} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{subtitle.language}</Badge>
                      <span>{subtitle.label}</span>
                      {subtitle.isUploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSubtitle(subtitle.language)}
                      disabled={subtitle.isUploading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {!isAddingNew ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAddingNew(true)}
          className="w-full"
          disabled={!videoId}
        >
          <Upload className="mr-2 h-4 w-4" />
          Add Subtitle
        </Button>
      ) : (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <Label>Add New Subtitle</Label>
              <Button variant="ghost" size="sm" onClick={() => setIsAddingNew(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subtitle-language">Language</Label>
                <Select value={newLanguage} onValueChange={setNewLanguage}>
                  <SelectTrigger id="subtitle-language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map((language) => (
                      <SelectItem key={language.value} value={language.value}>
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle-label">Label</Label>
                <Input
                  id="subtitle-label"
                  placeholder="e.g. English (CC)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle-file">Subtitle File</Label>
              <Input
                id="subtitle-file"
                type="file"
                accept=".srt,.vtt,.sub,.sbv,.ttml,.dfxp"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              <p className="text-xs text-muted-foreground">Supported formats: SRT, VTT, SUB, SBV, TTML, DFXP</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddingNew(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddSubtitle}
                disabled={!newLanguage || !newLabel || !selectedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Add Subtitle
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
