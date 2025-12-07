"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatHeader } from "@/components/chat/chat-header"
import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import { FileUploadDialog } from "@/components/file/file-upload-dialog"
import { ChannelMembersDialog } from "@/components/chat/channel-members-dialog"
import { InviteLinkDialog } from "@/components/chat/invite-link-dialog"
import { cn } from "@/lib/utils"

export default function ChatPage() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <div
        className={cn(
          "w-64 shrink-0 transition-transform duration-200 md:translate-x-0 absolute md:relative h-full z-10",
          showSidebar ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <ChatSidebar selectedChannel={selectedChannel} onSelectChannel={setSelectedChannel} />
      </div>

      {showSidebar && (
        <div className="fixed inset-0 bg-black/50 z-[9] md:hidden" onClick={() => setShowSidebar(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          channelId={selectedChannel}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          onShowMembers={() => setShowMembers(true)}
          onShowInvite={() => setShowInvite(true)}
        />
        <MessageList channelId={selectedChannel} />
        <MessageInput channelId={selectedChannel} onFileUpload={() => setShowFileUpload(true)} />
      </div>

      <FileUploadDialog open={showFileUpload} onOpenChange={setShowFileUpload} channelId={selectedChannel} />

      <ChannelMembersDialog open={showMembers} onOpenChange={setShowMembers} channelId={selectedChannel} />

      <InviteLinkDialog open={showInvite} onOpenChange={setShowInvite} channelId={selectedChannel} />
    </div>
  )
}
