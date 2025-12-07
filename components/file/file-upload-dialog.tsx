"use client"

import type React from "react"

import { useState, useRef } from "react"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { addDoc, collection } from "firebase/firestore"
import { storage, db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channelId: string | null
}

export function FileUploadDialog({ open, onOpenChange, channelId }: FileUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB"
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB"
  }

  const getPlanLimits = () => {
    const limits = {
      free: { size: 50 * 1024 * 1024, label: "50 MB" },
      pro: { size: 5 * 1024 * 1024 * 1024, label: "5 GB" },
      team: { size: 10 * 1024 * 1024 * 1024, label: "10 GB" },
    }
    return limits[user?.plan || "free"]
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const limit = getPlanLimits()
    if (file.size > limit.size) {
      setError(
        `File size exceeds your plan limit of ${limit.label}. ${
          user?.plan === "free" ? "Upgrade to Pro for 5GB or Team for 10GB uploads." : ""
        }`,
      )
      setSelectedFile(null)
      return
    }

    setError(null)
    setSelectedFile(file)
  }

  const uploadFile = async () => {
    if (!selectedFile || !channelId || !user) return

    setUploading(true)
    setProgress(0)

    try {
      // Create storage reference
      const storageRef = ref(storage, `files/${user.uid}/${Date.now()}_${selectedFile.name}`)

      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, selectedFile)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setProgress(Math.round(percent))
        },
        (error) => {
          console.error("Upload error:", error)
          toast({
            title: "Upload failed",
            description: error.message,
            variant: "destructive",
          })
          setUploading(false)
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

          // Save message with file
          await addDoc(collection(db, "messages"), {
            text: `Uploaded ${selectedFile.name}`,
            userId: user.uid,
            userEmail: user.email,
            channelId,
            createdAt: new Date().toISOString(),
            fileUrl: downloadURL,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
          })

          toast({
            title: "File uploaded",
            description: `${selectedFile.name} has been shared`,
          })

          // Reset and close
          setSelectedFile(null)
          setUploading(false)
          setProgress(0)
          onOpenChange(false)
        },
      )
    } catch (error: any) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      })
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null)
      setError(null)
      setProgress(0)
      onOpenChange(false)
    }
  }

  const limit = getPlanLimits()

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Share files with your team. Your plan allows up to {limit.label} per file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          >
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} disabled={uploading} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to select a file or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-2">Maximum file size: {limit.label}</p>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <FileText className="h-8 w-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">Uploading... {progress}%</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleClose} variant="outline" className="flex-1 bg-transparent" disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={uploadFile} className="flex-1" disabled={!selectedFile || uploading || !!error}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
