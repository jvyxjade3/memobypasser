import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// In-memory status storage so buttons work instantly
let siteStatus = "online"

export async function GET() {
  return NextResponse.json({ status: siteStatus })
}

export async function POST(request: Request) {
  try {
    const { status } = await request.json()

    if (!["online", "offline", "updating"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      )
    }

    siteStatus = status

    return NextResponse.json({
      success: true,
      status: siteStatus
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update status" },
      { status: 500 }
    )
  }
}
