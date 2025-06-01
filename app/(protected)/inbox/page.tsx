import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { InboxContent } from "./inbox-content"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
	title: "Inbox | Bookmarks",
	description: "View your recently added bookmarks",
}

export default async function InboxPage() {
	const supabase = await createClient()

	// Get the current user
	const { data: { user } } = await supabase.auth.getUser()

	if (!user) {
		redirect("/login")
	}

	// Get the timestamp for 12 hours ago
	const twelveHoursAgo = new Date()
	twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12)

	// Fetch bookmarks that are less than 12 hours old
	const { data: bookmarks } = await supabase
		.from("bookmarks")
		.select(`
			*,
			categories!inner (
				id,
				name
			)
		`)
		.eq("user_id", user.id)
		.gte("created_at", twelveHoursAgo.toISOString())
		.order("created_at", { ascending: false })

	return (
		<div className="container py-6">
			<InboxContent initialBookmarks={bookmarks || []} />
		</div>
	)
}
