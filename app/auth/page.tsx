"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {isLogin ? <LoginForm onToggle={() => setIsLogin(false)} /> : <SignupForm onToggle={() => setIsLogin(true)} />}
    </div>
  )
}
