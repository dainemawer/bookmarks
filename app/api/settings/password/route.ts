import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PUT(request: Request) {
	const supabase = await createClient()
	const { currentPassword, newPassword } = await request.json()

	if (!currentPassword || !newPassword) {
		return NextResponse.json(
			{ error: "Current password and new password are required" },
			{ status: 400 }
		)
	}

	const { error } = await supabase.auth.updateUser({
		password: newPassword,
	})

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}

	return new NextResponse(null, { status: 200 })
}
