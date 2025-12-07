"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, addDoc, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Hash, Plus, MessageSquare, Star, File, Bell, Settings, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserSearchDialog } from "./user-search-dialog"
import { StarredMessagesDialog } from "./starred-messages-dialog"
import { FilesBrowserDialog } from "./files-browser-dialog"
import { NotificationsDialog } from "./notifications-dialog"
import { UserProfileDialog } from "./user-profile-dialog"
import type { Channel } from "@/types/channel"

interface ChatSidebarProps {
  selectedChannel: string | null
  onSelectChannel: (channelId: string) => void
  className?: string
}

export function ChatSidebar({ selectedChannel, onSelectChannel, className }: ChatSidebarProps) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [directMessages, setDirectMessages] = useState<Channel[]>([])
  const [newChannelName, setNewChannelName] = useState("")
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [showStarred, setShowStarred] = useState(false)
  const [showFiles, setShowFiles] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const channelsQuery = query(collection(db, "channels"), orderBy("createdAt", "desc"))

    const unsubscribeChannels = onSnapshot(channelsQuery, (snapshot) => {
      const channelData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Channel[]
      // Filter for public channels (including ones without type field from old data)
      const filteredChannels = channelData.filter(
        (channel) => !channel.type || channel.type === "public" || channel.type === "",
      )
      setChannels(filteredChannels)

      if (!selectedChannel && filteredChannels.length > 0) {
        onSelectChannel(filteredChannels[0].id)
      }
    })

    const dmQuery = query(
      collection(db, "channels"),
      where("type", "==", "dm"),
      where("members", "array-contains", user.uid),
    )

    const unsubscribeDMs = onSnapshot(dmQuery, (snapshot) => {
      const dmData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Channel[]
      setDirectMessages(dmData)
    })

    const notifQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false),
    )

    const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
      setNotificationCount(snapshot.size)
    })

    return () => {
      unsubscribeChannels()
      unsubscribeDMs()
      unsubscribe()
    }
  }, [user])

  const createChannel = async () => {
    if (!newChannelName.trim() || !user) return

    try {
      const docRef = await addDoc(collection(db, "channels"), {
        name: newChannelName.trim(),
        type: "public",
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
        members: [user.uid],
      })
      setNewChannelName("")
      setShowNewChannel(false)
      onSelectChannel(docRef.id)
    } catch (error) {
      console.error("Error creating channel:", error)
    }
  }

  return (
    <>
      <div className={cn("flex flex-col h-full bg-card border-r border-border", className)}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">ChatSlack</h2>
            <Button size="icon" variant="ghost" onClick={() => setShowNewChannel(!showNewChannel)} className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {showNewChannel && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Channel name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createChannel()}
                className="h-8"
              />
              <Button size="sm" onClick={createChannel} className="h-8">
                Add
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* Quick Actions */}
            <div className="mb-4 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {notificationCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {notificationCount}
                  </span>
                )}
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => setShowStarred(true)}>
                <Star className="h-4 w-4 mr-2" />
                Starred Messages
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => setShowFiles(true)}>
                <File className="h-4 w-4 mr-2" />
                All Files
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => (window.location.href = "/pricing")}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Browse Plans
              </Button>
            </div>

            <div className="border-t border-border my-2" />

            {/* Direct Messages */}
            <div className="mb-4">
              <div className="flex items-center justify-between px-2 py-1 mb-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase">Direct Messages</div>
                <Button size="icon" variant="ghost" onClick={() => setShowUserSearch(true)} className="h-6 w-6">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {directMessages.map((dm) => (
                <button
                  key={dm.id}
                  onClick={() => onSelectChannel(dm.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors",
                    selectedChannel === dm.id && "bg-accent text-accent-foreground",
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {dm.name
                      .replace(user?.email || "", "")
                      .replace(" & ", "")
                      .replace("&", "")
                      .trim()}
                  </span>
                </button>
              ))}
            </div>

            {/* Channels */}
            <div className="mb-4">
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">Channels</div>
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onSelectChannel(channel.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors",
                    selectedChannel === channel.id && "bg-accent text-accent-foreground",
                  )}
                >
                  <Hash className="h-4 w-4 shrink-0" />
                  <span className="truncate">{channel.name}</span>
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* User Profile Footer */}
        <div className="border-t border-border">
          <Button variant="ghost" className="w-full justify-start h-auto p-4" onClick={() => setShowProfile(true)}>
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">{user?.displayName || user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.plan || "free"} plan</p>
            </div>
            <Settings className="h-4 w-4 ml-2 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <UserSearchDialog
        open={showUserSearch}
        onOpenChange={setShowUserSearch}
        onSelectUser={(channelId) => {
          onSelectChannel(channelId)
          setShowUserSearch(false)
        }}
      />
      <StarredMessagesDialog open={showStarred} onOpenChange={setShowStarred} />
      <FilesBrowserDialog open={showFiles} onOpenChange={setShowFiles} />
      <NotificationsDialog open={showNotifications} onOpenChange={setShowNotifications} />
      <UserProfileDialog open={showProfile} onOpenChange={setShowProfile} />
    </>
  )
}
