// Razorpay configuration
export const RAZORPAY_KEY_ID = "rzp_test_RoR3OCkJF6aJL6"
export const RAZORPAY_KEY_SECRET = "bO4RxqhdizMlf1EPkRNHgvyH"

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id?: string
  prefill?: {
    name?: string
    email?: string
  }
  theme?: {
    color?: string
  }
  handler: (response: RazorpayResponse) => void
}

export interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id?: string
  razorpay_signature?: string
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}
