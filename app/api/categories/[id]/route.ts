import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

type RouteContext = {
	params: {
		id: string
	}
}

export async function PUT(
	request: NextRequest,
	context: RouteContext
) {
	const { id } = context.params
	const supabase = await createClient()
	const { name } = await request.json()

	if (!name) {
		return NextResponse.json(
			{ error: "Name is required" },
			{ status: 400 }
		)
	}

	const { data: category, error } = await supabase
		.from("categories")
		.update({ name })
		.eq("id", id)
		.select()
		.single()

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}

	return NextResponse.json(category)
}

export async function DELETE(
	request: NextRequest,
	context: RouteContext
) {
	const { id } = context.params
	const supabase = await createClient()

	// Check if there are any bookmarks using this category
	const { data: bookmarks, error: bookmarksError } = await supabase
		.from("bookmarks")
		.select("id")
		.eq("category_id", id)

	if (bookmarksError) {
		return NextResponse.json(
			{ error: "Failed to check category usage" },
			{ status: 500 }
		)
	}

	if (bookmarks && bookmarks.length > 0) {
		return NextResponse.json(
			{
				error: "Cannot delete category that is being used by bookmarks",
			},
			{ status: 400 }
		)
	}

	const { error } = await supabase
		.from("categories")
		.delete()
		.eq("id", id)

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}

	return new NextResponse(null, { status: 204 })
}
