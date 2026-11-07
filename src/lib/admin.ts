import { connectDB } from "@/lib/db";
import User from "@/models/User";

/**
 * Checks whether an email address belongs to an authorized admin.
 * Matches either the ADMIN_EMAIL environment variable or the user's role in MongoDB.
 */
export async function isUserAdmin(email?: string | null): Promise<boolean> {
  if (!email) return false;

  const normalizedEmail = email.toLowerCase().trim();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();

  // If email strictly matches environment ADMIN_EMAIL, instantly authorize
  if (adminEmail && normalizedEmail === adminEmail) {
    return true;
  }

  // Otherwise check user document in database
  try {
    await connectDB();
    const dbUser = await User.findOne({ email: normalizedEmail })
      .select("role")
      .lean();
    return dbUser?.role === "admin";
  } catch (error) {
    console.error("Error verifying admin role:", error);
    return false;
  }
}

