import { NextResponse } from "next/server";
import { verifyEmailConnection } from "@/lib/email";

export async function GET() {
  try {
    const isConnected = await verifyEmailConnection();

    if (isConnected) {
      return NextResponse.json({
        status: "connected",
        message: "Gmail SMTP connection verified successfully",
      });
    }

    return NextResponse.json(
      {
        status: "disconnected",
        message: "Unable to connect to Gmail. Check GMAIL_USER and GMAIL_APP_PASSWORD env vars.",
      },
      { status: 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
