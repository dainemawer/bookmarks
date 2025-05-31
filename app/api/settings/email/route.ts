import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PUT(request: Request) {
	const supabase = await createClient()
	const { email } = await request.json()

	if (!email) {
		return NextResponse.json(
			{ error: "Email is required" },
			{ status: 400 }
		)
	}

	const { error } = await supabase.auth.updateUser({
		email,
	})

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}

	return new NextResponse(null, { status: 200 })
}
