"use client"

import { useState } from "react"
import { collection, query, where, getDocs, addDoc, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, MessageSquare, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface User {
  id: string
  email: string
  displayName: string
  plan: string
}

interface UserSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectUser?: (userId: string) => void
}

export function UserSearchDialog({ open, onOpenChange, onSelectUser }: UserSearchDialogProps) {
  const [searchEmail, setSearchEmail] = useState("")
  const [foundUser, setFoundUser] = useState<User | null>(null)
  const [searching, setSearching] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const { user } = useAuth()

  const searchUserByEmail = async () => {
    if (!searchEmail.trim()) return

    try {
      setSearching(true)
      setNotFound(false)
      setFoundUser(null)

      const usersQuery = query(collection(db, "users"), where("email", "==", searchEmail.trim().toLowerCase()))
      const usersSnapshot = await getDocs(usersQuery)

      if (usersSnapshot.empty || usersSnapshot.docs[0].id === user?.uid) {
        setNotFound(true)
      } else {
        const userData = usersSnapshot.docs[0]
        setFoundUser({
          id: userData.id,
          ...userData.data(),
        } as User)
      }
    } catch (error) {
      console.error("Error searching user:", error)
      setNotFound(true)
    } finally {
      setSearching(false)
    }
  }

  const startDirectMessage = async (targetUserId: string) => {
    if (!user) return

    try {
      // Check if DM channel already exists
      const channelsSnapshot = await getDocs(collection(db, "channels"))
      const existingDM = channelsSnapshot.docs.find((doc) => {
        const data = doc.data()
        return (
          data.type === "dm" && data.members && data.members.includes(user.uid) && data.members.includes(targetUserId)
        )
      })

      if (existingDM) {
        onSelectUser?.(existingDM.id)
        onOpenChange(false)
        return
      }

      // Create new DM channel
      const targetUserDoc = await getDoc(doc(db, "users", targetUserId))
      const targetUserData = targetUserDoc.data()

      const dmChannel = await addDoc(collection(db, "channels"), {
        name: `${user.email} & ${targetUserData?.email}`,
        type: "dm",
        members: [user.uid, targetUserId],
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
      })

      onSelectUser?.(dmChannel.id)
      onOpenChange(false)
      setSearchEmail("")
      setFoundUser(null)
    } catch (error) {
      console.error("Error creating DM:", error)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setSearchEmail("")
    setFoundUser(null)
    setNotFound(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a Direct Message</DialogTitle>
          <DialogDescription>Enter the exact email address of the person you want to message</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="user@example.com"
                type="email"
                value={searchEmail}
                onChange={(e) => {
                  setSearchEmail(e.target.value)
                  setNotFound(false)
                }}
                onKeyDown={(e) => e.key === "Enter" && searchUserByEmail()}
                className="pl-9"
              />
            </div>
            <Button onClick={searchUserByEmail} disabled={searching || !searchEmail.trim()}>
              {searching ? "Searching..." : "Search"}
            </Button>
          </div>

          {notFound && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No user found with this email address. Make sure they have an account.
              </AlertDescription>
            </Alert>
          )}

          {foundUser && (
            <div className="border rounded-lg p-4 bg-accent/50">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">{foundUser.email.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{foundUser.displayName || foundUser.email}</p>
                  <p className="text-sm text-muted-foreground truncate">{foundUser.email}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-1">{foundUser.plan || "free"} plan</p>
                </div>
              </div>
              <Button onClick={() => startDirectMessage(foundUser.id)} className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Conversation
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
            <p className="font-medium mb-1">Privacy Notice</p>
            <p>
              For security, you can only find users by their exact email address. Users won't see you until you message
              them.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
