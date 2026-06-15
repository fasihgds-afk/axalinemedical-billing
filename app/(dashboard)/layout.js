import { redirect } from "next/navigation";
import { getSession, clearSession } from "@/lib/auth";
import { isAuthWithoutDb, userFromSession } from "@/lib/devAuth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function DashboardLayout({ children }) {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  const useSessionOnly =
    isAuthWithoutDb() || !process.env.MONGODB_URI?.trim();

  if (useSessionOnly) {
    const sessionUser = userFromSession(session);

    return <DashboardShell user={sessionUser}>{children}</DashboardShell>;
  }

  try {
    await connectDB();
    const user = await User.findById(session.userId).lean();

    if (!user || !user.active) {
      await clearSession();
      redirect("/login");
    }

    const sessionUser = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return <DashboardShell user={sessionUser}>{children}</DashboardShell>;
  } catch {
    redirect("/login");
  }
}
