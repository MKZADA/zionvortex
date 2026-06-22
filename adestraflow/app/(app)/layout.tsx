import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import { SignOutButton } from "@/components/SignOutButton";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Reforço de defesa em profundidade: o middleware já barra isso,
  // mas Server Components não confiam só no middleware.
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-bg/95 px-4 py-3 backdrop-blur">
        <span className="font-display text-lg font-semibold text-primary">
          AdestraFlow
        </span>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-md px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
