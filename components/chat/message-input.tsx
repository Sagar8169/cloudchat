"use client"

import { useState } from "react"
import { addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, Smile, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface MessageInputProps {
  channelId: string | null
  onFileUpload: () => void
}

const EMOJI_LIST = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "👏", "😮", "😢", "🤔", "💯", "✨"]

export function MessageInput({ channelId, onFileUpload }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [scheduleDate, setScheduleDate] = useState<Date>()
  const [scheduleTime, setScheduleTime] = useState("12:00")
  const { user } = useAuth()
  const { toast } = useToast()

  const sendMessage = async (scheduled = false) => {
    if (!message.trim() || !channelId || !user) return

    setSending(true)
    try {
      const messageData: any = {
        text: message.trim(),
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email?.split("@")[0],
        channelId,
        createdAt: new Date().toISOString(),
      }

      if (scheduled && scheduleDate) {
        const [hours, minutes] = scheduleTime.split(":")
        const scheduledDateTime = new Date(scheduleDate)
        scheduledDateTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

        messageData.isScheduled = true
        messageData.scheduledFor = scheduledDateTime.toISOString()
      }

      await addDoc(collection(db, "messages"), messageData)
      setMessage("")
      setScheduleDate(undefined)
      toast({
        title: scheduled ? "Message scheduled" : "Message sent",
        description: scheduled ? `Will be sent on ${scheduleDate?.toLocaleDateString()}` : undefined,
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const insertEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji)
  }

  return (
    <div className="p-4 border-t border-border bg-card">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-end">
          <div className="flex-1 flex flex-col gap-2">
            <Textarea
              placeholder={channelId ? "Type a message... (Shift+Enter for new line)" : "Select a channel first"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              disabled={!channelId || sending}
              className="min-h-[60px] max-h-[200px] resize-none"
              rows={2}
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={onFileUpload} disabled={!channelId} className="h-8 w-8">
                  <Paperclip className="h-4 w-4" />
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="icon" variant="ghost" disabled={!channelId} className="h-8 w-8">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <div className="grid grid-cols-6 gap-1">
                      {EMOJI_LIST.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                          className="text-xl hover:scale-125 transition-transform p-1"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="icon" variant="ghost" disabled={!channelId} className="h-8 w-8">
                      <Clock className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">Schedule message</Label>
                        <Calendar
                          mode="single"
                          selected={scheduleDate}
                          onSelect={setScheduleDate}
                          disabled={(date) => date < new Date()}
                        />
                      </div>
                      <div>
                        <Label htmlFor="time" className="mb-2 block">
                          Time
                        </Label>
                        <Input
                          id="time"
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={() => sendMessage(true)}
                        disabled={!scheduleDate || !message.trim()}
                        className="w-full"
                        size="sm"
                      >
                        Schedule Message
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-2 items-center">
                {scheduleDate && (
                  <span className="text-xs text-muted-foreground">
                    Scheduled: {scheduleDate.toLocaleDateString()} {scheduleTime}
                  </span>
                )}
                <Button
                  onClick={() => sendMessage(false)}
                  disabled={!channelId || sending || !message.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
