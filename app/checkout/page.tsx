"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CreditCard, Check, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { loadRazorpayScript, RAZORPAY_KEY_ID } from "@/lib/razorpay"

const plans = {
  pro: {
    name: "Pro",
    price: 19,
    features: ["5 GB file uploads", "Priority support", "Custom emoji reactions", "Message search"],
  },
  team: {
    name: "Team",
    price: 39,
    features: [
      "10 GB file uploads",
      "24/7 priority support",
      "Advanced message search",
      "Team analytics",
      "Admin controls",
    ],
  },
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const planId = searchParams.get("plan") as "pro" | "team"
  const router = useRouter()
  const { user, updateUserPlan } = useAuth()
  const { toast } = useToast()
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!planId || !plans[planId]) {
      router.push("/pricing")
    }
  }, [planId, router])

  const plan = planId ? plans[planId] : null

  const handlePayment = async () => {
    if (!plan || !user) return

    setProcessing(true)

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK")
      }

      // Create order on backend
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          currency: "USD",
          plan: planId,
        }),
      })

      const orderData = await orderResponse.json()
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create order")
      }

      // Initialize Razorpay payment
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "ChatSlack",
        description: `${plan.name} Plan Subscription`,
        order_id: orderData.order.id,
        prefill: {
          email: user.email || "",
        },
        theme: {
          color: "#6366f1",
        },
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            })

            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              // Update user plan
              await updateUserPlan(planId)

              toast({
                title: "Payment successful!",
                description: `You're now on the ${plan.name} plan.`,
              })

              router.push("/chat")
            } else {
              throw new Error("Payment verification failed")
            }
          } catch (error: any) {
            toast({
              title: "Payment verification failed",
              description: error.message,
              variant: "destructive",
            })
          } finally {
            setProcessing(false)
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error: any) {
      console.error("Payment error:", error)
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      })
      setProcessing(false)
    }
  }

  if (!plan) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push("/pricing")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Pricing
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Purchase</h1>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name} Plan</CardTitle>
              <CardDescription>Unlock premium features with {plan.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">What's included:</h3>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-3xl font-bold">${plan.price}/month</span>
                </div>

                <Button onClick={handlePayment} disabled={processing} className="w-full gap-2" size="lg">
                  {processing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Pay with Razorpay
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Secure payment powered by Razorpay. Your payment information is encrypted and secure.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
