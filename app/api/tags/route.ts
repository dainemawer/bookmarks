import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
	const supabase = await createClient()

	const { data: tags, error } = await supabase
		.from("tags")
		.select(
			`
			*,
			bookmarks:bookmark_tags(count)
		`
		)
		.order("name")

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}

	const tagsWithCount = tags.map((tag) => ({
		...tag,
		bookmark_count: tag.bookmarks?.[0]?.count || 0,
	}))

	return NextResponse.json(tagsWithCount)
}

export async function POST(request: Request) {
	const supabase = await createClient()
	const { name } = await request.json()

	if (!name) {
		return NextResponse.json(
			{ error: "Name is required" },
			{ status: 400 }
		)
	}

	const { data: tag, error } = await supabase
		.from("tags")
		.insert([{ name }])
		.select()
		.single()

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}

	return NextResponse.json(tag)
}
