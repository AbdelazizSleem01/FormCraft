import connectDB from "@/lib/mongodb";
import { hashPassword, defaultAdminPermissions } from "@/lib/auth";
import { UserModel } from "@/lib/models";

export async function ensureSuperAdmin() {
  await connectDB();

  const existing = await UserModel.findOne({ role: "super_admin" }).lean();
  if (existing) return;

  const email = (process.env.SUPER_ADMIN_EMAIL || "superadmin@formcraft.local").toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin123!";

  await UserModel.create({
    email,
    passwordHash: hashPassword(password),
    role: "super_admin",
    permissions: defaultAdminPermissions,
    isActive: true,
  });

  console.log(`Super admin seeded: ${email}`);
}
