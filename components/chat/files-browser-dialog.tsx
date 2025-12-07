"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { File, Download, Search, FileText, ImageIcon, Video, Music } from "lucide-react"
import { format } from "date-fns"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FilesBrowserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channelId?: string | null
}

export function FilesBrowserDialog({ open, onOpenChange, channelId }: FilesBrowserDialogProps) {
  const [files, setFiles] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [fileType, setFileType] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    if (!user || !open) return

    const q = channelId
      ? query(collection(db, "messages"), where("channelId", "==", channelId))
      : query(collection(db, "messages"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fileMessages = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((msg) => msg.fileUrl)
        .sort((a, b) => (b.createdAt || 0).localeCompare(a.createdAt || 0))

      setFiles(fileMessages)
    })

    return () => unsubscribe()
  }, [user, open, channelId])

  const getFileIcon = (fileName: string) => {
    const ext = fileName?.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || ""))
      return <ImageIcon className="h-5 w-5 text-blue-500" />
    if (["mp4", "mov", "avi", "webm"].includes(ext || "")) return <Video className="h-5 w-5 text-purple-500" />
    if (["mp3", "wav", "ogg"].includes(ext || "")) return <Music className="h-5 w-5 text-green-500" />
    if (["pdf", "doc", "docx", "txt"].includes(ext || "")) return <FileText className="h-5 w-5 text-red-500" />
    return <File className="h-5 w-5 text-gray-500" />
  }

  const getFileType = (fileName: string) => {
    const ext = fileName?.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return "image"
    if (["mp4", "mov", "avi", "webm"].includes(ext || "")) return "video"
    if (["mp3", "wav", "ogg"].includes(ext || "")) return "audio"
    if (["pdf", "doc", "docx", "txt"].includes(ext || "")) return "document"
    return "other"
  }

  const filteredFiles = files
    .filter((file) => file.fileName?.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((file) => fileType === "all" || getFileType(file.fileName) === fileType)

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "Unknown size"
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB"
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB"
  }

  const fileCounts = {
    all: files.length,
    image: files.filter((f) => getFileType(f.fileName) === "image").length,
    video: files.filter((f) => getFileType(f.fileName) === "video").length,
    document: files.filter((f) => getFileType(f.fileName) === "document").length,
    audio: files.filter((f) => getFileType(f.fileName) === "audio").length,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            {channelId ? "Channel Files" : "All Files"}
          </DialogTitle>
        </DialogHeader>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={fileType} onValueChange={setFileType} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({fileCounts.all})</TabsTrigger>
            <TabsTrigger value="image">Images ({fileCounts.image})</TabsTrigger>
            <TabsTrigger value="document">Docs ({fileCounts.document})</TabsTrigger>
            <TabsTrigger value="video">Videos ({fileCounts.video})</TabsTrigger>
            <TabsTrigger value="audio">Audio ({fileCounts.audio})</TabsTrigger>
          </TabsList>
        </Tabs>
        <ScrollArea className="h-[450px] pr-4">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <File className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No files found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredFiles.map((file) => (
                <div key={file.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-0.5 shrink-0">{getFileIcon(file.fileName)}</div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="font-medium text-sm break-all line-clamp-2" title={file.fileName}>
                          {file.fileName}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1.5">
                          <span className="truncate max-w-[150px]">{file.userName || file.userEmail}</span>
                          <span>•</span>
                          <span>{formatFileSize(file.fileSize)}</span>
                          <span>•</span>
                          <span>{file.createdAt && format(new Date(file.createdAt), "MMM d, yyyy h:mm a")}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => window.open(file.fileUrl, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
