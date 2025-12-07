"use client"

import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, CreditCard, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface UserProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [status, setStatus] = useState(user?.status || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: displayName.trim() || user.email,
        status: status.trim(),
      })
      toast({ title: "Profile updated successfully" })
      onOpenChange(false)
    } catch (error) {
      toast({ title: "Error updating profile", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const planColors = {
    free: "bg-gray-500",
    pro: "bg-blue-500",
    team: "bg-purple-500",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Badge className={planColors[user?.plan as keyof typeof planColors] || planColors.free}>
              {user?.plan?.toUpperCase() || "FREE"} PLAN
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Display Name
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Status Message
              </Label>
              <Input
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="What's your status?"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input value={user?.email || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Subscription
              </Label>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm capitalize">{user?.plan || "free"} Plan</span>
                <Button size="sm" variant="outline" onClick={() => (window.location.href = "/pricing")}>
                  Upgrade
                </Button>
              </div>
            </div>

            {user?.planExpiresAt && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Plan Expires
                </Label>
                <Input value={new Date(user.planExpiresAt).toLocaleDateString()} disabled />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isLoading} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
