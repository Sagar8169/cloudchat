"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, Link2 } from "lucide-react"

interface InviteLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channelId: string | null
}

export function InviteLinkDialog({ open, onOpenChange, channelId }: InviteLinkDialogProps) {
  const [inviteCode, setInviteCode] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open && channelId) {
      loadOrGenerateInviteCode()
    }
  }, [open, channelId])

  const loadOrGenerateInviteCode = async () => {
    if (!channelId) return

    try {
      const channelDoc = await getDoc(doc(db, "channels", channelId))
      const data = channelDoc.data()

      if (data?.inviteCode) {
        setInviteCode(data.inviteCode)
      } else {
        // Generate new invite code
        const newCode = generateInviteCode()
        await updateDoc(doc(db, "channels", channelId), {
          inviteCode: newCode,
        })
        setInviteCode(newCode)
      }
    } catch (error) {
      console.error("Error loading invite code:", error)
    }
  }

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  const regenerateCode = async () => {
    if (!channelId) return

    try {
      const newCode = generateInviteCode()
      await updateDoc(doc(db, "channels", channelId), {
        inviteCode: newCode,
      })
      setInviteCode(newCode)
    } catch (error) {
      console.error("Error regenerating code:", error)
    }
  }

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/invite/${inviteCode}`
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inviteLink = inviteCode ? `${window.location.origin}/invite/${inviteCode}` : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Invite Link
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Invite Code</Label>
            <div className="flex gap-2">
              <Input value={inviteCode} readOnly className="font-mono" />
              <Button variant="outline" onClick={regenerateCode}>
                Regenerate
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Invite Link</Label>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly />
              <Button onClick={copyInviteLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Share this link with others to invite them to this channel. Anyone with this link can join.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
