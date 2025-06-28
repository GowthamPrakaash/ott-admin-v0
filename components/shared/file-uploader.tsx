"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

interface FileUploaderProps {
  value: string
  onChange: (url: string) => void
  accept?: string
  maxSize?: number // in MB
}

export function FileUploader({ value, onChange, accept = "image/*", maxSize = 5 }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `File size should not exceed ${maxSize}MB`,
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", file)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 95))
      }, 100)

      // Upload the file to our API endpoint
      const response = await fetch("/api/bunny/storage", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      const data = await response.json()
      setUploadProgress(100)

      // Update the form with the public URL
      onChange(data.publicUrl)

      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Something went wrong. Please try again.",
      })
    } finally {
      setIsUploading(false)

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = () => {
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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
          <p className="text-xs text-muted-foreground mt-1">
            {accept.replace("*", "").toUpperCase()} (Max {maxSize}MB)
          </p>
          <Input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
        </div>
      )}

      {isUploading && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Uploading...</p>
            <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {value && !isUploading && (
        <div className="relative border rounded-lg overflow-hidden">
          <div className="aspect-video relative">
            <Image src={value || "/placeholder.svg"} alt="Uploaded file" fill className="object-cover" />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemove}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute bottom-2 right-2"
            onClick={() => fileInputRef.current?.click()}
          >
            Change
          </Button>
          <Input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
        </div>
      )}
    </div>
  )
}
