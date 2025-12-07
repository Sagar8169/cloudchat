"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Bell, X, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface NotificationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
  const [notifications, setNotifications] = useState<any[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user || !open) return

    const q = query(collection(db, "notifications"), where("userId", "==", user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      notifs.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
      setNotifications(notifs)
    })

    return () => unsubscribe()
  }, [user, open])

  const deleteNotification = async (id: string) => {
    await deleteDoc(doc(db, "notifications", id))
  }

  const clearAll = async () => {
    await Promise.all(notifications.map((notif) => deleteDoc(doc(db, "notifications", notif.id))))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </DialogTitle>
            {notifications.length > 0 && (
              <Button size="sm" variant="ghost" onClick={clearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No notifications</div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div key={notif.id} className="border rounded-lg p-4 relative hover:bg-accent transition-colors">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 absolute top-2 right-2"
                    onClick={() => deleteNotification(notif.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <p className="text-sm font-medium pr-8">{notif.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {notif.createdAt && format(new Date(notif.createdAt), "MMM d, h:mm a")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
