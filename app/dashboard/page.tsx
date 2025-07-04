import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import DashboardClient from "@/components/dashboard-client"

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Fetch user's loans
  const { data: loans } = await supabase
    .from("loans")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  return <DashboardClient initialLoans={loans || []} user={session.user} />
}
