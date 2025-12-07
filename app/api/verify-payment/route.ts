import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "bO4RxqhdizMlf1EPkRNHgvyH"

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex")

    const isValid = expectedSignature === razorpay_signature

    return NextResponse.json({
      success: isValid,
      message: isValid ? "Payment verified successfully" : "Invalid signature",
    })
  } catch (error: any) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
