"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, arrayRemove } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Star, X } from "lucide-react"
import { format } from "date-fns"

interface StarredMessagesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StarredMessagesDialog({ open, onOpenChange }: StarredMessagesDialogProps) {
  const [starredMessages, setStarredMessages] = useState<any[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user || !open) return

    const q = query(
      collection(db, "messages"),
      where("starredBy", "array-contains", user.uid),
      orderBy("createdAt", "desc"),
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setStarredMessages(messages)
    })

    return () => unsubscribe()
  }, [user, open])

  const unstarMessage = async (messageId: string) => {
    if (!user) return
    await updateDoc(doc(db, "messages", messageId), {
      starredBy: arrayRemove(user.uid),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Starred Messages
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          {starredMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No starred messages yet</div>
          ) : (
            <div className="space-y-4">
              {starredMessages.map((message) => (
                <div key={message.id} className="border rounded-lg p-4 relative">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{message.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {message.createdAt && format(new Date(message.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => unstarMessage(message.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm">{message.text}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
