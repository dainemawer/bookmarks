import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function DELETE() {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()

	if (!user?.id) {
		return NextResponse.json(
			{ error: "User not found" },
			{ status: 404 }
		)
	}

	// First, delete all user's data
	const { error: deleteDataError } = await supabase
		.from("bookmarks")
		.delete()
		.eq("user_id", user.id)

	if (deleteDataError) {
		return NextResponse.json(
			{ error: "Failed to delete user data" },
			{ status: 500 }
		)
	}

	// Then delete the user account
	const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id)

	if (deleteUserError) {
		return NextResponse.json(
			{ error: "Failed to delete user account" },
			{ status: 500 }
		)
	}

	return new NextResponse(null, { status: 200 })
}
