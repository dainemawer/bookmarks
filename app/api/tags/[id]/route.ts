import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params
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
		.update({ name })
		.eq("id", id)
		.select()
		.single()

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}

	return NextResponse.json(tag)
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params
	const supabase = await createClient()

	// Check if there are any bookmarks using this tag
	const { data: bookmarks, error: bookmarksError } = await supabase
		.from("bookmark_tags")
		.select("bookmark_id")
		.eq("tag_id", id)

	if (bookmarksError) {
		return NextResponse.json(
			{ error: "Failed to check tag usage" },
			{ status: 500 }
		)
	}

	if (bookmarks && bookmarks.length > 0) {
		return NextResponse.json(
			{
				error: "Cannot delete tag that is being used by bookmarks",
			},
			{ status: 400 }
		)
	}

	const { error } = await supabase
		.from("tags")
		.delete()
		.eq("id", id)

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}

	return new NextResponse(null, { status: 204 })
}
