"use client"

import { useEffect, useState, useRef } from "react"
import { collection, query, where, orderBy, onSnapshot, limit, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { FileText, Download, MoreVertical, Edit, Trash2, Star, Copy, Check, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Message {
  id: string
  text: string
  userId: string
  userEmail: string
  userName?: string
  channelId: string
  createdAt: string
  editedAt?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  reactions?: { [emoji: string]: string[] } // emoji -> array of userIds
  isStarred?: boolean
  starredBy?: string[]
  replyTo?: string
  isScheduled?: boolean
  scheduledFor?: string
}

interface MessageListProps {
  channelId: string | null
}

const EMOJI_LIST = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🔥", "👏"]

export function MessageList({ channelId }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!channelId) return

    const q = query(
      collection(db, "messages"),
      where("channelId", "==", channelId),
      orderBy("createdAt", "desc"),
      limit(100),
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .reverse() as Message[]

      // Filter out scheduled messages that haven't been sent yet
      const currentMessages = messageData.filter(
        (msg) => !msg.isScheduled || (msg.scheduledFor && new Date(msg.scheduledFor) <= new Date()),
      )

      setMessages(currentMessages)
    })

    return unsubscribe
  }, [channelId])

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB"
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB"
  }

  const handleEdit = (message: Message) => {
    setEditingId(message.id)
    setEditText(message.text)
  }

  const saveEdit = async (messageId: string) => {
    if (!editText.trim()) return

    try {
      await updateDoc(doc(db, "messages", messageId), {
        text: editText.trim(),
        editedAt: new Date().toISOString(),
      })
      setEditingId(null)
      toast({ title: "Message updated" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update message", variant: "destructive" })
    }
  }

  const handleDelete = async (messageId: string) => {
    try {
      await deleteDoc(doc(db, "messages", messageId))
      toast({ title: "Message deleted" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete message", variant: "destructive" })
    }
  }

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) return

    const message = messages.find((m) => m.id === messageId)
    if (!message) return

    const reactions = message.reactions || {}
    const userIds = reactions[emoji] || []
    const hasReacted = userIds.includes(user.uid)

    const newUserIds = hasReacted ? userIds.filter((id) => id !== user.uid) : [...userIds, user.uid]

    const newReactions = { ...reactions, [emoji]: newUserIds }
    if (newUserIds.length === 0) delete newReactions[emoji]

    try {
      await updateDoc(doc(db, "messages", messageId), { reactions: newReactions })
    } catch (error) {
      toast({ title: "Error", description: "Failed to add reaction", variant: "destructive" })
    }
  }

  const toggleStar = async (messageId: string) => {
    if (!user) return

    const message = messages.find((m) => m.id === messageId)
    if (!message) return

    const starredBy = message.starredBy || []
    const isStarred = starredBy.includes(user.uid)

    const newStarredBy = isStarred ? starredBy.filter((id) => id !== user.uid) : [...starredBy, user.uid]

    try {
      await updateDoc(doc(db, "messages", messageId), {
        starredBy: newStarredBy,
        isStarred: newStarredBy.length > 0,
      })
      toast({ title: isStarred ? "Removed from starred" : "Added to starred" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to star message", variant: "destructive" })
    }
  }

  const copyMessage = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(messageId)
    setTimeout(() => setCopiedId(null), 2000)
    toast({ title: "Copied to clipboard" })
  }

  if (!channelId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a channel to start messaging
      </div>
    )
  }

  return (
    <ScrollArea ref={scrollRef} className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const isOwn = message.userId === user?.uid
          const isStarredByUser = message.starredBy?.includes(user?.uid || "")

          return (
            <div
              key={message.id}
              className={`flex gap-3 group hover:bg-accent/50 -mx-2 px-2 py-1 rounded-lg transition-colors ${
                isOwn ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-xs">
                  {(message.userName || message.userEmail).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={`flex-1 min-w-0 ${isOwn ? "flex flex-col items-end" : ""}`}>
                <div className={`flex items-baseline gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                  <span className="font-semibold text-sm">{message.userName || message.userEmail.split("@")[0]}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </span>
                  {message.editedAt && <span className="text-xs text-muted-foreground italic">(edited)</span>}
                  {isStarredByUser && <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />}
                </div>

                {editingId === message.id ? (
                  <div className="mt-1 flex gap-2 items-center w-full">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(message.id)
                        if (e.key === "Escape") setEditingId(null)
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <Button size="sm" onClick={() => saveEdit(message.id)}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <div
                      className={`mt-1 inline-block max-w-[85%] ${
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2"
                          : "text-foreground"
                      }`}
                    >
                      <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>
                    </div>

                    {message.fileUrl && (
                      <div className="mt-2 inline-flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border max-w-md">
                        <FileText className="h-5 w-5 shrink-0 text-primary" />
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="text-sm font-medium truncate" title={message.fileName}>
                            {message.fileName}
                          </p>
                          {message.fileSize && (
                            <p className="text-xs text-muted-foreground">{formatFileSize(message.fileSize)}</p>
                          )}
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" asChild>
                          <a href={message.fileUrl} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    )}

                    {message.reactions && Object.keys(message.reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(message.reactions).map(([emoji, userIds]) => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(message.id, emoji)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                              userIds.includes(user?.uid || "")
                                ? "bg-primary/20 border border-primary"
                                : "bg-muted hover:bg-muted/80 border border-transparent"
                            }`}
                          >
                            <span>{emoji}</span>
                            <span>{userIds.length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <div
                  className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isOwn ? "flex-row-reverse" : ""
                  }`}
                >
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-7 w-7">
                        <Smile className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <div className="flex gap-1">
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(message.id, emoji)}
                            className="text-lg hover:scale-125 transition-transform p-1"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-7 w-7">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isOwn ? "end" : "start"}>
                      <DropdownMenuItem onClick={() => toggleStar(message.id)}>
                        <Star className="mr-2 h-4 w-4" />
                        {isStarredByUser ? "Unstar" : "Star message"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyMessage(message.text, message.id)}>
                        {copiedId === message.id ? (
                          <Check className="mr-2 h-4 w-4" />
                        ) : (
                          <Copy className="mr-2 h-4 w-4" />
                        )}
                        Copy text
                      </DropdownMenuItem>
                      {isOwn && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(message)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit message
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(message.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete message
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
