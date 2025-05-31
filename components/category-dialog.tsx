"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/database.types"

type Category = Database["public"]["Tables"]["categories"]["Row"] & {
	bookmark_count: number
}

interface CategoryDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	category?: {
		id: string
		name: string
	}
	onSuccess?: (category: Category) => void
}

export function CategoryDialog({
	open,
	onOpenChange,
	category,
	onSuccess,
}: CategoryDialogProps) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [name, setName] = useState(category?.name || "")

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError(null)

		try {
			const supabase = createClient()

			// Get the current user
			const { data: { user }, error: userError } = await supabase.auth.getUser()

			if (userError || !user) {
				throw new Error("You must be logged in to manage categories")
			}

			if (category) {
				// Update existing category
				const { data: updatedCategory, error: updateError } = await supabase
					.from("categories")
					.update({ name })
					.eq("id", category.id)
					.eq("user_id", user.id)
					.select()
					.single()

				if (updateError) throw updateError

				if (updatedCategory && onSuccess) {
					onSuccess(updatedCategory as Category)
				}
			} else {
				// Create new category
				const { data: newCategory, error: insertError } = await supabase
					.from("categories")
					.insert([{ name, user_id: user.id }])
					.select()
					.single()

				if (insertError) throw insertError

				if (newCategory && onSuccess) {
					onSuccess(newCategory as Category)
				}
			}

			router.refresh()
			onOpenChange(false)
		} catch (err) {
			console.error("Error saving category:", err)
			setError(err instanceof Error ? err.message : "Failed to save category")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{category ? "Edit Category" : "Add New Category"}
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
							placeholder="Category name"
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
							{isLoading ? "Saving..." : category ? "Save Changes" : "Add Category"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
