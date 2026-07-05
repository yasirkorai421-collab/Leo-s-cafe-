import { NextResponse } from "next/server";

export async function GET() {
  console.log("GET /api/test-otp called");
  return new NextResponse(JSON.stringify({ test: "success from GET", timestamp: Date.now() }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(request: Request) {
  console.log("POST /api/test-otp called");
  try {
    const body = await request.json();
    return new NextResponse(JSON.stringify({ received: body, timestamp: Date.now() }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new NextResponse(JSON.stringify({ error: "Parse error" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
