import { type NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_RoR3OCkJF6aJL6",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "bO4RxqhdizMlf1EPkRNHgvyH",
})

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "INR", plan } = await request.json()

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan,
      },
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
