import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface Tag {
	id: string
	name: string
}

interface BookmarkTag {
	tags: Tag
}

interface Bookmark {
	id: string
	url: string
	title: string
	description: string | null
	favicon_url: string | null
	og_image_url: string | null
	category_id: string | null
	user_id: string
	created_at: string
	updated_at: string
	categories: {
		id: string
		name: string
	} | null
	bookmark_tags: BookmarkTag[]
}

export async function GET() {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()

	if (!user?.id) {
		return NextResponse.json(
			{ error: "User not found" },
			{ status: 404 }
		)
	}

	// Fetch all user's bookmarks with their categories and tags
	const { data: bookmarks, error } = await supabase
		.from("bookmarks")
		.select(`
			*,
			categories (
				id,
				name
			),
			bookmark_tags (
				tags (
					id,
					name
				)
			)
		`)
		.eq("user_id", user.id)
		.order("created_at", { ascending: false })

	if (error) {
		return NextResponse.json(
			{ error: "Failed to fetch bookmarks" },
			{ status: 500 }
		)
	}

	// Transform the data to a more export-friendly format
	const exportData = (bookmarks as Bookmark[]).map(bookmark => {
		const { categories, bookmark_tags, ...rest } = bookmark
		return {
			...rest,
			category: categories,
			tags: bookmark_tags.map(bt => bt.tags)
		}
	})

	return NextResponse.json(exportData)
}
