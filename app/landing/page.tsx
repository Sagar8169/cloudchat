"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Upload,
  Shield,
  Users,
  Check,
  Star,
  Clock,
  Search,
  Heart,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from "lucide-react"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background animate-gradient-shift" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="container relative mx-auto px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in-up border border-primary/20">
            <Sparkles className="h-4 w-4 animate-pulse" />
            Real-time collaboration made simple
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance animate-fade-in-up animation-delay-100">
            Chat, Share, Collaborate
            <br />
            <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              All in One Place
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 text-balance leading-relaxed animate-fade-in-up animation-delay-200">
            ChatSlack brings teams together with real-time messaging, large file sharing up to 10GB, and seamless
            collaboration. Join thousands of teams who trust us to stay connected, productive, and organized. Start
            free, upgrade anytime.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-12 animate-fade-in-up animation-delay-300">
            <Button
              size="lg"
              onClick={() => router.push("/auth")}
              className="gap-2 shadow-lg hover:shadow-xl transition-shadow group"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/pricing")}
              className="gap-2 bg-background/50 backdrop-blur-sm"
            >
              View Pricing
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in-up animation-delay-400">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>10,000+ Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10GB</div>
              <div className="text-sm text-muted-foreground">Max File Size</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">∞</div>
              <div className="text-sm text-muted-foreground">Channels</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Everything you need to collaborate</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-balance">
            Powerful features designed for modern teams who need to move fast without compromising on quality, security,
            or user experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: MessageSquare,
              title: "Real-time Messaging",
              description:
                "Instant messaging with live updates. Stay connected with your team in real-time across unlimited channels. See typing indicators, message reactions, and get instant notifications.",
              features: ["Live typing indicators", "Emoji reactions", "Message editing & deletion"],
            },
            {
              icon: Upload,
              title: "Large File Sharing",
              description:
                "Share files up to 10GB with Team plan. From documents to videos, share anything with your team securely. Organize files by type with our smart file browser.",
              features: ["Up to 10GB per file", "Smart file browser", "Secure cloud storage"],
            },
            {
              icon: Shield,
              title: "Secure & Private",
              description:
                "Enterprise-grade security with encrypted file storage. Your data is safe and private with Firebase backend. Email-only user discovery protects your privacy.",
              features: ["End-to-end encryption", "Private by default", "GDPR compliant"],
            },
            {
              icon: Users,
              title: "Team Collaboration",
              description:
                "Create unlimited channels for different projects and teams. Invite members via shareable links, manage permissions, and organize your workspace efficiently.",
              features: ["Unlimited channels", "Shareable invite links", "Member management"],
            },
            {
              icon: Search,
              title: "Smart Search",
              description:
                "Find messages, files, and channels instantly with powerful search. Filter by date, user, or file type. Starred messages for quick access to important information.",
              features: ["Full-text search", "Advanced filters", "Starred messages"],
            },
            {
              icon: Clock,
              title: "Message Scheduling",
              description:
                "Schedule messages to be sent later. Perfect for different time zones or planning announcements. Set it and forget it with our smart scheduling system.",
              features: ["Schedule for later", "Timezone support", "Edit before sending"],
            },
          ].map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow hover:border-primary/50">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{feature.description}</p>
                <ul className="space-y-2 text-sm">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">
              How It Works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Get started in minutes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple setup process to get your team collaborating quickly
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: 1,
                title: "Sign Up Free",
                description:
                  "Create your account in seconds. No credit card required. Start with our generous free plan.",
              },
              {
                step: 2,
                title: "Create Channels",
                description:
                  "Set up channels for your projects and teams. Invite members via email or shareable links.",
              },
              {
                step: 3,
                title: "Start Collaborating",
                description: "Chat in real-time, share files, and collaborate seamlessly with your team from anywhere.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-xl mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">
              Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Choose the plan that works for you. All plans include unlimited messaging and channels.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                description: "Perfect for getting started",
                features: [
                  "50 MB file uploads",
                  "Unlimited channels & messages",
                  "Real-time collaboration",
                  "Basic search",
                  "Email support",
                ],
                cta: "Get Started",
                variant: "outline" as const,
              },
              {
                name: "Pro",
                price: "$19",
                description: "For growing teams",
                features: [
                  "5 GB file uploads",
                  "Everything in Free",
                  "Advanced search",
                  "Message scheduling",
                  "Priority support",
                ],
                popular: true,
                cta: "Start Free Trial",
                variant: "default" as const,
              },
              {
                name: "Team",
                price: "$39",
                description: "For larger organizations",
                features: [
                  "10 GB file uploads",
                  "Everything in Pro",
                  "Advanced analytics",
                  "Custom integrations",
                  "24/7 dedicated support",
                ],
                cta: "Start Free Trial",
                variant: "outline" as const,
              },
            ].map((plan, index) => (
              <Card key={index} className={plan.popular ? "border-primary shadow-xl relative" : ""}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-2xl mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                  <ul className="space-y-3 text-sm mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.variant}
                    className="w-full"
                    size="lg"
                    onClick={() => router.push(plan.name === "Free" ? "/auth" : "/pricing")}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="link" onClick={() => router.push("/pricing")} className="gap-2">
              View detailed pricing comparison
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by teams worldwide</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our customers have to say about ChatSlack
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Chen",
                role: "Product Manager",
                company: "TechCorp",
                text: "ChatSlack transformed how our team communicates. The file sharing is incredible!",
              },
              {
                name: "Michael Rodriguez",
                role: "CTO",
                company: "StartupXYZ",
                text: "Best collaboration tool we've used. The real-time features are game-changing.",
              },
              {
                name: "Emily Watson",
                role: "Team Lead",
                company: "DesignCo",
                text: "Simple, powerful, and affordable. Everything we needed in one place.",
              },
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed">"{testimonial.text}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
            <CardContent className="py-16 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Join thousands of teams already using ChatSlack. Start free, no credit card required.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" onClick={() => router.push("/auth")} className="gap-2 shadow-lg">
                  Start Free Today
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push("/pricing")}>
                  Compare Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">ChatSlack</h3>
              <p className="text-sm text-muted-foreground">
                Real-time collaboration made simple for teams of all sizes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => router.push("/pricing")} className="hover:text-foreground">
                    Pricing
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push("/auth")} className="hover:text-foreground">
                    Sign Up
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button className="hover:text-foreground">About</button>
                </li>
                <li>
                  <button className="hover:text-foreground">Contact</button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button className="hover:text-foreground">Privacy</button>
                </li>
                <li>
                  <button className="hover:text-foreground">Terms</button>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2025 ChatSlack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
