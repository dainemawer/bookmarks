import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { InboxContent } from "./inbox-content"

export const metadata: Metadata = {
	title: "Inbox | Bookmarks",
	description: "View your recently added bookmarks",
}

export default async function InboxPage() {
	const supabase = await createClient()

	const { data: recentBookmarks } = await supabase
		.from("bookmarks")
		.select("*")
		.order("created_at", { ascending: false })
		.limit(10)

	return (
		<div className="container py-6">
			<InboxContent initialBookmarks={recentBookmarks || []} />
		</div>
	)
}
