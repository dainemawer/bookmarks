"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { fetchAndStoreBookmarkMetadata } from "@/app/actions/bookmark-metadata"
import { PostgrestError } from "@supabase/supabase-js"
import { Database } from "@/database.types"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

type Category = Database["public"]["Tables"]["categories"]["Row"]

interface BookmarkFormDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	bookmark?: {
		id: string
		title: string
		url: string
		description?: string | null
		category_id?: string | null
	}
	onSuccess?: (bookmark: Database["public"]["Tables"]["bookmarks"]["Row"] & {
		categories: {
			id: string
			name: string
		} | null
		bookmark_tags: {
			tags: {
				id: string
				name: string
			}
		}[]
	}) => void
}

export function BookmarkFormDialog({
	open,
	onOpenChange,
	bookmark,
	onSuccess,
}: BookmarkFormDialogProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [categories, setCategories] = useState<Category[]>([])
	const [formData, setFormData] = useState({
		title: "",
		url: "",
		description: "",
		category_id: "",
	})

	// Reset form data when dialog opens/closes
	useEffect(() => {
		if (open) {
			if (bookmark) {
				// If editing, populate form with bookmark data
				setFormData({
					title: bookmark.title || "",
					url: bookmark.url || "",
					description: bookmark.description || "",
					category_id: bookmark.category_id || "",
				})
			} else {
				// If adding new, reset form
				setFormData({
					title: "",
					url: "",
					description: "",
					category_id: "",
				})
			}
		}
	}, [open, bookmark])

	// Fetch categories when the dialog opens
	useEffect(() => {
		const fetchCategories = async () => {
			const supabase = createClient()
			const { data: { user } } = await supabase.auth.getUser()

			if (user) {
				const { data } = await supabase
					.from("categories")
					.select("*")
					.eq("user_id", user.id)
					.order("name")

				if (data) {
					setCategories(data)
				}
			}
		}

		if (open) {
			fetchCategories()
		}
	}, [open])

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
						category_id: formData.category_id || null,
					})
					.eq("id", bookmark.id)
					.eq("user_id", user.id) // Ensure user owns the bookmark
					.select(`
						*,
						categories (
							id,
							name
						),
						bookmark_tags (
							tags (
								id,
								name
							)
						)
					`)
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
						category_id: formData.category_id || null,
						user_id: user.id,
					})
					.select(`
						*,
						categories (
							id,
							name
						),
						bookmark_tags (
							tags (
								id,
								name
							)
						)
					`)
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
					<div className="space-y-2">
						<Label htmlFor="category">Category</Label>
						<Select
							value={formData.category_id}
							onValueChange={(value) =>
								setFormData((prev) => ({
									...prev,
									category_id: value,
								}))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="null">None</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category.id} value={category.id}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
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
