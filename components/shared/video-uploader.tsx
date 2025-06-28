"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { FileVideo, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

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
  const { toast } = useToast()
  const [isBrowser, setIsBrowser] = useState(false)

  // Check if we're in the browser environment
  useEffect(() => {
    setIsBrowser(true)
  }, [])

  // Helper function to get the access key
  const getAccessKey = async () => {
    try {
      // We need to fetch the access key from the server
      // This is a simplified approach - in production, you might want to
      // include this in the initial API response
      const response = await fetch("/api/bunny/access-key")
      if (!response.ok) {
        throw new Error("Failed to get access key")
      }
      const data = await response.json()
      return data.accessKey
    } catch (error) {
      console.error("Error getting access key:", error)
      return ""
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Get upload credentials from our API
      const response = await fetch("/api/bunny/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: file.name,
          contentType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get upload credentials")
      }

      const { videoId, tusUploadUrl, authTimestamp, expirationTimestamp, signature } = await response.json()

      // Use FormData for multipart upload which is more widely supported
      const formData = new FormData()
      formData.append("file", file)

      // Set up XMLHttpRequest for upload with progress tracking
      const xhr = new XMLHttpRequest()

      // Set up progress tracking
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percentage)
        }
      })

      // Set up completion handler
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress(100)
          onChange(videoId)
          toast({
            title: "Video uploaded",
            description: "Your video has been uploaded successfully.",
          })
        } else {
          console.error("Upload failed with status:", xhr.status, xhr.responseText)
          toast({
            variant: "destructive",
            title: "Upload failed",
            description: `Server responded with status ${xhr.status}`,
          })
        }
        setIsUploading(false)
      })

      // Set up error handler
      xhr.addEventListener("error", () => {
        console.error("Network error during upload")
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: "Network error occurred during upload",
        })
        setIsUploading(false)
      })

      // Set up abort handler
      xhr.addEventListener("abort", () => {
        toast({
          variant: "destructive",
          title: "Upload cancelled",
          description: "The upload was cancelled",
        })
        setIsUploading(false)
      })

      // Open connection
      xhr.open("PUT", tusUploadUrl, true)

      // Set authentication headers
      xhr.setRequestHeader("AccessKey", await getAccessKey())
      xhr.setRequestHeader("Content-Type", file.type)

      // Send the file directly (not as FormData for PUT requests)
      xhr.send(file)
    } catch (error: any) {
      console.error("Upload error:", error)
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Something went wrong. Please try again.",
      })
      setIsUploading(false)
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

async function getAccessKey() {
  const response = await fetch("/api/bunny/access-key", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to get access key")
  }

  const { accessKey } = await response.json()
  return accessKey
}
