import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { TagsContent } from "../../../components/tags-content"

export const metadata: Metadata = {
	title: "Tags | Bookmarks",
	description: "Organize your bookmarks with tags",
}

export default async function TagsPage() {
	const supabase = await createClient()

	const { data: tags } = await supabase
		.from("tags")
		.select(
			`
			*,
			bookmarks:bookmark_tags(count)
		`
		)
		.order("name")

	const tagsWithCount = tags?.map((tag) => ({
		...tag,
		bookmark_count: tag.bookmarks?.[0]?.count || 0,
	})) || []

	return (
		<div className="container py-6">
			<TagsContent initialTags={tagsWithCount} />
		</div>
	)
}
