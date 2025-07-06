"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { FileVideo, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface VideoUploaderProps {
  value: string
  onChange: (videoId: string) => void
  contentType?: "movie" | "episode"
}

export function VideoUploader({ value, onChange, contentType = "movie" }: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileName, setFileName] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isBrowser, setIsBrowser] = useState(false)

  // Check if we're in the browser environment
  useEffect(() => {
    setIsBrowser(true)
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 95))
      }, 100)

      // Upload the video to our local API endpoint
      const response = await fetch("/api/upload/video", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload video")
      }

      const data = await response.json()

      setUploadProgress(100)
      onChange(data.url)
      toast.success("Your video has been uploaded successfully.")
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = () => {
    onChange("")
    setFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Don't render anything during SSR
  if (!isBrowser) {
    return null
  }

  return (
    <div className="space-y-4">
      {!value && !isUploading && (
        <div
          className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground mt-1">MP4, MOV, WEBM (Max 2GB)</p>
          <Input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {isUploading && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileVideo className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium truncate max-w-[200px]">{fileName}</p>
            </div>
            <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {value && !isUploading && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileVideo className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Video uploaded successfully</p>
                <p className="text-xs text-muted-foreground">Video ID: {value}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Change
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={handleRemove}>
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}
