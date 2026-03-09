import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { UserModel } from "@/lib/models";
import { createSessionToken, sessionCookieConfig, verifyPassword } from "@/lib/auth";
import { ensureSuperAdmin } from "@/lib/bootstrap";

export async function POST(req: NextRequest) {
  try {
    await ensureSuperAdmin();
    await connectDB();

    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    const user = await UserModel.findOne({ email }).lean();
    if (!user || !user.passwordHash || !user.isActive) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const token = createSessionToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        userId: String(user._id),
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });

    response.cookies.set(sessionCookieConfig(token));
    return response;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
  }
}
