"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/database.types"

type Tag = Database["public"]["Tables"]["tags"]["Row"] & {
	bookmark_count: number
}

interface TagDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	tag?: {
		id: string
		name: string
	}
	onSuccess?: (tag: Tag) => void
}

export function TagDialog({
	open,
	onOpenChange,
	tag,
	onSuccess,
}: TagDialogProps) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [name, setName] = useState(tag?.name || "")

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError(null)

		try {
			const supabase = createClient()

			// Get the current user
			const { data: { user }, error: userError } = await supabase.auth.getUser()

			if (userError || !user) {
				throw new Error("You must be logged in to manage tags")
			}

			if (tag) {
				// Update existing tag
				const { data: updatedTag, error: updateError } = await supabase
					.from("tags")
					.update({ name })
					.eq("id", tag.id)
					.eq("user_id", user.id)
					.select()
					.single()

				if (updateError) throw updateError

				if (updatedTag && onSuccess) {
					onSuccess(updatedTag as Tag)
				}
			} else {
				// Create new tag
				const { data: newTag, error: insertError } = await supabase
					.from("tags")
					.insert([{ name, user_id: user.id }])
					.select()
					.single()

				if (insertError) throw insertError

				if (newTag && onSuccess) {
					onSuccess(newTag as Tag)
				}
			}

			router.refresh()
			onOpenChange(false)
		} catch (err) {
			console.error("Error saving tag:", err)
			setError(err instanceof Error ? err.message : "Failed to save tag")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{tag ? "Edit Tag" : "Add New Tag"}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
							{error}
						</div>
					)}
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Tag name"
							required
						/>
					</div>
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Saving..." : tag ? "Save Changes" : "Add Tag"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
