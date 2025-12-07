"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Check, ArrowLeft, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Perfect for getting started",
    features: [
      "50 MB file uploads",
      "Unlimited channels",
      "Real-time messaging",
      "Basic file sharing",
      "Community support",
    ],
    cta: "Current Plan",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    description: "For professionals and power users",
    features: [
      "5 GB file uploads",
      "Unlimited channels",
      "Real-time messaging",
      "Advanced file sharing",
      "Priority support",
      "Custom emoji reactions",
      "Message search",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    id: "team",
    name: "Team",
    price: 39,
    description: "For teams and organizations",
    features: [
      "10 GB file uploads",
      "Unlimited channels",
      "Real-time messaging",
      "Enterprise file sharing",
      "24/7 priority support",
      "Custom emoji reactions",
      "Advanced message search",
      "Team analytics",
      "Admin controls",
    ],
    cta: "Upgrade to Team",
    popular: false,
  },
]

export default function PricingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSelectPlan = (planId: string) => {
    if (planId === "free") {
      return
    }
    setSelectedPlan(planId)
    router.push(`/checkout?plan=${planId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/chat")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Chat
          </Button>
          {user && (
            <div className="text-sm">
              <span className="text-muted-foreground">Current plan: </span>
              <span className="font-semibold capitalize">{user.plan || "free"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
          Upgrade your ChatSlack experience with larger file uploads and premium features. All plans include unlimited
          messaging and channels.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = user?.plan === plan.id
            const isFree = plan.id === "free"

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${
                  plan.popular ? "border-primary shadow-lg shadow-primary/20 scale-105" : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1 gap-1">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-6">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    {!isFree && <span className="text-muted-foreground">/month</span>}
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan || isFree}
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {isCurrentPlan ? "Current Plan" : plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Can I change my plan later?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What happens to my files if I downgrade?</h3>
              <p className="text-sm text-muted-foreground">
                Your existing files remain accessible. However, you won't be able to upload new files that exceed your
                plan's limit.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Is my payment information secure?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, we use Razorpay for secure payment processing. We never store your credit card information.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Can I cancel my subscription?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel anytime. Your plan remains active until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
