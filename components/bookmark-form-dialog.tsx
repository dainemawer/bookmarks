"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { fetchAndStoreBookmarkMetadata } from "@/app/actions/bookmark-metadata"
import { PostgrestError } from "@supabase/supabase-js"
import { Database } from "@/database.types"

type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"]

interface BookmarkFormDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	bookmark?: {
		id: string
		title: string
		url: string
		description?: string | null
	}
	onSuccess?: (bookmark: Bookmark) => void
}

export function BookmarkFormDialog({
	open,
	onOpenChange,
	bookmark,
	onSuccess,
}: BookmarkFormDialogProps) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [formData, setFormData] = useState({
		title: bookmark?.title || "",
		url: bookmark?.url || "",
		description: bookmark?.description || "",
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError(null)

		try {
			const supabase = createClient()

			// Get the current user
			const { data: { user }, error: userError } = await supabase.auth.getUser()

			if (userError || !user) {
				throw new Error("You must be logged in to add bookmarks")
			}

			if (bookmark) {
				// Update existing bookmark
				const { data: updatedBookmark, error: updateError } = await supabase
					.from("bookmarks")
					.update({
						title: formData.title,
						url: formData.url,
						description: formData.description,
					})
					.eq("id", bookmark.id)
					.eq("user_id", user.id) // Ensure user owns the bookmark
					.select()
					.single()

				if (updateError) throw updateError

				// Update metadata
				await fetchAndStoreBookmarkMetadata(bookmark.id, formData.url)

				// Call onSuccess with updated bookmark
				if (updatedBookmark && onSuccess) {
					onSuccess(updatedBookmark)
				}
			} else {
				// Create new bookmark
				const { data: newBookmark, error: insertError } = await supabase
					.from("bookmarks")
					.insert({
						title: formData.title,
						url: formData.url,
						description: formData.description,
						user_id: user.id, // Add the user_id
					})
					.select()
					.single()

				if (insertError) throw insertError

				// Fetch and store metadata
				if (newBookmark) {
					await fetchAndStoreBookmarkMetadata(newBookmark.id, formData.url)

					// Call onSuccess with new bookmark
					if (onSuccess) {
						onSuccess(newBookmark)
					}
				}
			}

			router.refresh()
			onOpenChange(false)
		} catch (err) {
			console.error("Error saving bookmark:", err)
			const error = err as PostgrestError
			setError(error.message || "Failed to save bookmark. Please try again.")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{bookmark ? "Edit Bookmark" : "Add New Bookmark"}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
							{error}
						</div>
					)}
					<div className="space-y-2">
						<Label htmlFor="url">URL</Label>
						<Input
							id="url"
							value={formData.url}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, url: e.target.value }))
							}
							placeholder="https://example.com"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="title">Title</Label>
						<Input
							id="title"
							value={formData.title}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, title: e.target.value }))
							}
							placeholder="Bookmark title"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							placeholder="Add a description..."
							rows={3}
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
							{isLoading ? "Saving..." : bookmark ? "Save Changes" : "Add Bookmark"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
