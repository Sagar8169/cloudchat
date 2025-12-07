"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Trash2, UserMinus } from "lucide-react"
import { UserSearchDialog } from "./user-search-dialog"

interface Member {
  id: string
  email: string
  displayName: string
}

interface ChannelMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channelId: string | null
}

export function ChannelMembersDialog({ open, onOpenChange, channelId }: ChannelMembersDialogProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [channelData, setChannelData] = useState<any>(null)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (open && channelId) {
      loadChannelMembers()
    }
  }, [open, channelId])

  const loadChannelMembers = async () => {
    if (!channelId) return

    try {
      setLoading(true)
      const channelDoc = await getDoc(doc(db, "channels", channelId))
      const data = channelDoc.data()
      setChannelData(data)

      if (data?.members && Array.isArray(data.members)) {
        // Load member details
        const memberPromises = data.members.map((memberId: string) => getDoc(doc(db, "users", memberId)))

        const memberDocs = await Promise.all(memberPromises)
        const memberData = memberDocs
          .filter((doc) => doc.exists())
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Member[]

        setMembers(memberData)
      }
    } catch (error) {
      console.error("Error loading members:", error)
    } finally {
      setLoading(false)
    }
  }

  const addMember = async (userId: string) => {
    if (!channelId || !channelData) return

    try {
      await updateDoc(doc(db, "channels", channelId), {
        members: arrayUnion(userId),
      })

      // Reload members
      await loadChannelMembers()
    } catch (error) {
      console.error("Error adding member:", error)
    }
  }

  const removeMember = async (userId: string) => {
    if (!channelId) return

    try {
      await updateDoc(doc(db, "channels", channelId), {
        members: arrayRemove(userId),
      })

      // Reload members
      await loadChannelMembers()
    } catch (error) {
      console.error("Error removing member:", error)
    }
  }

  const leaveChannel = async () => {
    if (!channelId || !user) return

    try {
      await updateDoc(doc(db, "channels", channelId), {
        members: arrayRemove(user.uid),
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error leaving channel:", error)
    }
  }

  const deleteChannel = async () => {
    if (!channelId || !user || channelData?.createdBy !== user.uid) return

    if (!confirm("Are you sure you want to delete this channel? This action cannot be undone.")) return

    try {
      await deleteDoc(doc(db, "channels", channelId))
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting channel:", error)
    }
  }

  const isOwner = user && channelData?.createdBy === user.uid
  const isDM = channelData?.type === "dm"

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {isDM ? "Direct Message" : "Channel Members"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!isDM && (
              <Button onClick={() => setShowUserSearch(true)} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            )}

            <ScrollArea className="h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No members</div>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{member.email.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{member.displayName || member.email}</p>
                            {member.id === channelData?.createdBy && <Badge variant="secondary">Owner</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      {isOwner && member.id !== user?.uid && !isDM && (
                        <Button size="sm" variant="ghost" onClick={() => removeMember(member.id)}>
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="flex gap-2 pt-4 border-t">
              {!isDM && user && channelData?.members?.includes(user.uid) && (
                <Button variant="outline" onClick={leaveChannel} className="flex-1 bg-transparent">
                  <UserMinus className="h-4 w-4 mr-2" />
                  Leave Channel
                </Button>
              )}
              {isOwner && !isDM && (
                <Button variant="destructive" onClick={deleteChannel} className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UserSearchDialog
        open={showUserSearch}
        onOpenChange={setShowUserSearch}
        onSelectUser={(userId) => {
          addMember(userId)
          setShowUserSearch(false)
        }}
      />
    </>
  )
}
