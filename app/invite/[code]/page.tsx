"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Hash, Loader2 } from "lucide-react"

export default function InvitePage({ params }: { params: { code: string } }) {
  const [loading, setLoading] = useState(true)
  const [channelData, setChannelData] = useState<any>(null)
  const [error, setError] = useState("")
  const [joining, setJoining] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadChannelByInviteCode()
  }, [params.code])

  const loadChannelByInviteCode = async () => {
    try {
      const channelsRef = collection(db, "channels")
      const q = query(channelsRef, where("inviteCode", "==", params.code))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        setError("Invalid or expired invite link")
      } else {
        const channelDoc = snapshot.docs[0]
        setChannelData({ id: channelDoc.id, ...channelDoc.data() })
      }
    } catch (err) {
      setError("Failed to load invite")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const joinChannel = async () => {
    if (!user || !channelData) return

    setJoining(true)
    try {
      // Check if already a member
      if (channelData.members?.includes(user.uid)) {
        router.push("/chat")
        return
      }

      // Add user to channel members
      await updateDoc(doc(db, "channels", channelData.id), {
        members: arrayUnion(user.uid),
      })

      router.push("/chat")
    } catch (err) {
      setError("Failed to join channel")
      console.error(err)
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in Required</CardTitle>
            <CardDescription>You need to sign in to join this channel</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/auth")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/chat")} className="w-full">
              Go to Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Join Channel
          </CardTitle>
          <CardDescription>You have been invited to join a channel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-accent rounded-lg">
            <p className="font-semibold text-lg">{channelData?.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {channelData?.members?.length || 0} member{channelData?.members?.length !== 1 ? "s" : ""}
            </p>
          </div>

          <Button onClick={joinChannel} disabled={joining} className="w-full">
            {joining ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Channel"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
