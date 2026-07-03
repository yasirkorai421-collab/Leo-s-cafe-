import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO: implement order status update logic
  return NextResponse.json({ message: `Order ${id} status updated` });
}
