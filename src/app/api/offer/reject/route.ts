import { NextRequest, NextResponse } from "next/server";

/** Portfolio demo stub — never proxies to upstream decision URLs. */
export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as {
      rejectionReason?: string;
      reason?: string;
    };
    const hasRejectionReason = Object.prototype.hasOwnProperty.call(
      payload,
      "rejectionReason",
    );
    const hasReason = Object.prototype.hasOwnProperty.call(payload, "reason");

    if (!hasRejectionReason && !hasReason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, status: "rejected" });
  } catch (error) {
    console.error("Reject Offer Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
