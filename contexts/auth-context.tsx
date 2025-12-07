"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface UserProfile extends User {
  plan?: "free" | "pro" | "team"
  uploadLimit?: number
}

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signOut: () => Promise<void>
  updateUserPlan: (plan: "free" | "pro" | "team") => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
        const userData = userDoc.data()

        setUser({
          ...firebaseUser,
          plan: userData?.plan || "free",
          uploadLimit: userData?.uploadLimit || 50 * 1024 * 1024, // 50MB default
        } as UserProfile)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)

    // Create user profile in Firestore
    await setDoc(doc(db, "users", newUser.uid), {
      email: newUser.email,
      displayName: displayName || email.split("@")[0],
      plan: "free",
      uploadLimit: 50 * 1024 * 1024, // 50MB
      createdAt: new Date().toISOString(),
    })
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const updateUserPlan = async (plan: "free" | "pro" | "team") => {
    if (!user) return

    const uploadLimits = {
      free: 50 * 1024 * 1024, // 50MB
      pro: 5 * 1024 * 1024 * 1024, // 5GB
      team: 10 * 1024 * 1024 * 1024, // 10GB
    }

    await setDoc(
      doc(db, "users", user.uid),
      {
        plan,
        uploadLimit: uploadLimits[plan],
      },
      { merge: true },
    )

    setUser({
      ...user,
      plan,
      uploadLimit: uploadLimits[plan],
    })
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUserPlan }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
