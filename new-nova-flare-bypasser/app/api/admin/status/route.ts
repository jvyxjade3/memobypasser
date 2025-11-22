import { NextResponse } from "next/server"
import { redis } from "@/lib/history"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const status = (await redis.get("site_status")) || "online"
    return NextResponse.json({ status })
  } catch (error) {
    return NextResponse.json({ status: "online" })
  }
}

export async function POST(request: Request) {
  try {
    const { status } = await request.json()
    if (["online", "offline", "updating"].includes(status)) {
      await redis.set("site_status", status)
      return NextResponse.json({ success: true, status })
    }
    return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to update status" }, { status: 500 })
  }
}
