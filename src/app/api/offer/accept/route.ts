import { NextResponse } from "next/server";

/** Portfolio demo stub — never proxies to upstream decision URLs. */
export async function POST() {
  return NextResponse.json({ success: true, status: "accepted" });
}
