import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { SettingsContent } from "../../../components/settings-content"

export const metadata: Metadata = {
	title: "Settings | Bookmarks",
	description: "Manage your account settings and export your bookmarks",
}

export default async function SettingsPage() {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	return (
		<div className="container py-6">
			<SettingsContent user={user} />
		</div>
	)
}
