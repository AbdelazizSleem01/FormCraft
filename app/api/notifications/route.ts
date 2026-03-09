import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import { NotificationModel } from "@/lib/models";

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  const forbidden = requirePermission(user, "notifications:read");
  if (forbidden) return forbidden;

  try {
    await connectDB();

    const items = await NotificationModel.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    const unreadCount = await NotificationModel.countDocuments({ userId: user.userId, isRead: false });

    return NextResponse.json({ success: true, data: { items, unreadCount } });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  const forbidden = requirePermission(user, "notifications:read");
  if (forbidden) return forbidden;

  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));

    if (body.id) {
      await NotificationModel.updateOne({ _id: body.id, userId: user.userId }, { isRead: true });
    } else {
      await NotificationModel.updateMany({ userId: user.userId, isRead: false }, { isRead: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/notifications error:", error);
    return NextResponse.json({ success: false, error: "Failed to update notifications" }, { status: 500 });
  }
}
