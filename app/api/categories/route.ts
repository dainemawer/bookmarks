import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
	const supabase = await createClient()

	const { data: categories, error } = await supabase
		.from("categories")
		.select(
			`
			*,
			bookmarks:bookmarks(count)
		`
		)
		.order("name")

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}

	const categoriesWithCount = categories.map((category) => ({
		...category,
		bookmark_count: category.bookmarks?.[0]?.count || 0,
	}))

	return NextResponse.json(categoriesWithCount)
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

	// Get the current user
	const { data: { user }, error: userError } = await supabase.auth.getUser()

	if (userError || !user) {
		return NextResponse.json(
			{ error: "Unauthorized" },
			{ status: 401 }
		)
	}

	const { data: category, error } = await supabase
		.from("categories")
		.insert([{
			name,
			user_id: user.id
		}])
		.select()
		.single()

	if (error) {
		console.error("Error creating category:", error)
		return NextResponse.json({ error: error.message }, { status: 500 })
	}

	return NextResponse.json(category)
}
