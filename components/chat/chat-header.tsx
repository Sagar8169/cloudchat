"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Hash, Menu, Moon, Sun, CreditCard, LogOut, Users, Link2, MessageSquare } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface ChatHeaderProps {
  channelId: string | null
  onToggleSidebar: () => void
  onShowMembers?: () => void
  onShowInvite?: () => void
}

export function ChatHeader({ channelId, onToggleSidebar, onShowMembers, onShowInvite }: ChatHeaderProps) {
  const [channelName, setChannelName] = useState("")
  const [channelType, setChannelType] = useState<string>("")
  const { theme, toggleTheme } = useTheme()
  const { signOut, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!channelId) return

    const fetchChannel = async () => {
      const channelDoc = await getDoc(doc(db, "channels", channelId))
      if (channelDoc.exists()) {
        const data = channelDoc.data()
        setChannelName(data.name)
        setChannelType(data.type || "public")
      }
    }

    fetchChannel()
  }, [channelId])

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth")
  }

  const isDM = channelType === "dm"

  return (
    <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" onClick={onToggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        {isDM ? (
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Hash className="h-5 w-5 text-muted-foreground" />
        )}
        <h1 className="font-semibold">{channelName || "Select a channel"}</h1>
      </div>

      <div className="flex items-center gap-2">
        {channelId && (
          <>
            <Button size="icon" variant="ghost" onClick={onShowMembers} title="Members">
              <Users className="h-5 w-5" />
            </Button>
            {!isDM && (
              <Button size="icon" variant="ghost" onClick={onShowInvite} title="Invite Link">
                <Link2 className="h-5 w-5" />
              </Button>
            )}
          </>
        )}

        <Button size="icon" variant="ghost" onClick={toggleTheme}>
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 px-3">
              {user?.email?.split("@")[0]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push("/pricing")}>
              <CreditCard className="h-4 w-4 mr-2" />
              Upgrade Plan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
