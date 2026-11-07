import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { isUserAdmin } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userEmail = session?.user?.email;

  // Unauthenticated visitors are served 404 (do not redirect to /signin, which leaks endpoint existence)
  if (!userEmail) {
    notFound();
  }

  const isAdmin = await isUserAdmin(userEmail);

  // Non-admin authenticated users are served 404
  if (!isAdmin) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col">
      {/* Sleek top navigation bar for authorized administrators */}
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/wardrobe"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Wardrobe</span>
          </Link>
          <span className="text-stone-300 dark:text-stone-700">|</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Admin Console
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className="truncate max-w-48 font-mono text-[11px]">{userEmail}</span>
        </div>
      </header>

      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
