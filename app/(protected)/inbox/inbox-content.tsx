"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { BookmarkCard } from "@/components/bookmark-card"
import { BookmarkFormDialog } from "@/components/bookmark-form-dialog"
import { Database } from "@/database.types"

type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"] & {
	categories: {
		id: string
		name: string
	} | null
}

interface InboxContentProps {
	initialBookmarks: Bookmark[]
}

export function InboxContent({ initialBookmarks }: InboxContentProps) {
	const [bookmarks, setBookmarks] = useState(initialBookmarks)
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)

	const handleEdit = (bookmark: Bookmark) => {
		setEditingBookmark(bookmark)
	}

	const handleCloseEdit = () => {
		setEditingBookmark(null)
	}

	const handleBookmarkAdd = (newBookmark: Bookmark) => {
		setBookmarks(prev => [newBookmark, ...prev])
	}

	const handleBookmarkDelete = (deletedBookmarkId: string) => {
		setBookmarks(prev => prev.filter(bookmark => bookmark.id !== deletedBookmarkId))
	}

	const handleBookmarkUpdate = (updatedBookmark: Bookmark) => {
		setBookmarks(prev =>
			prev.map(bookmark =>
				bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark
			)
		)
	}

	// Handle category count updates
	useEffect(() => {
		const handleCategoryUpdate = (bookmark: Bookmark, isNew: boolean) => {
			if (bookmark.category_id) {
				const event = new CustomEvent('updateCategoryCount', {
					detail: {
						categoryId: bookmark.category_id,
						increment: isNew
					}
				})
				window.dispatchEvent(event)
			}
		}

		// Listen for bookmark changes
		const handleBookmarkChange = (bookmark: Bookmark, oldBookmark?: Bookmark) => {
			if (oldBookmark?.category_id !== bookmark.category_id) {
				// If category changed, decrement old category
				if (oldBookmark?.category_id) {
					const event = new CustomEvent('updateCategoryCount', {
						detail: {
							categoryId: oldBookmark.category_id,
							increment: false
						}
					})
					window.dispatchEvent(event)
				}
				// Increment new category
				handleCategoryUpdate(bookmark, true)
			}
		}

		// Set up event listeners for bookmark changes
		const handleAdd = (bookmark: Bookmark) => handleCategoryUpdate(bookmark, true)
		const handleDelete = (bookmark: Bookmark) => handleCategoryUpdate(bookmark, false)
		const handleUpdate = (bookmark: Bookmark, oldBookmark: Bookmark) => handleBookmarkChange(bookmark, oldBookmark)

		// Add event listeners
		window.addEventListener('bookmarkAdded', ((e: CustomEvent) => handleAdd(e.detail)) as EventListener)
		window.addEventListener('bookmarkDeleted', ((e: CustomEvent) => handleDelete(e.detail)) as EventListener)
		window.addEventListener('bookmarkUpdated', ((e: CustomEvent) => handleUpdate(e.detail.bookmark, e.detail.oldBookmark)) as EventListener)

		return () => {
			window.removeEventListener('bookmarkAdded', ((e: CustomEvent) => handleAdd(e.detail)) as EventListener)
			window.removeEventListener('bookmarkDeleted', ((e: CustomEvent) => handleDelete(e.detail)) as EventListener)
			window.removeEventListener('bookmarkUpdated', ((e: CustomEvent) => handleUpdate(e.detail.bookmark, e.detail.oldBookmark)) as EventListener)
		}
	}, [])

	// Dispatch events when bookmarks change
	useEffect(() => {
		bookmarks.forEach(bookmark => {
			const oldBookmark = initialBookmarks.find(b => b.id === bookmark.id)
			if (!oldBookmark) {
				// New bookmark
				window.dispatchEvent(new CustomEvent('bookmarkAdded', { detail: bookmark }))
			} else if (oldBookmark.category_id !== bookmark.category_id) {
				// Updated bookmark with category change
				window.dispatchEvent(new CustomEvent('bookmarkUpdated', {
					detail: { bookmark, oldBookmark }
				}))
			}
		})

		// Check for deleted bookmarks
		initialBookmarks.forEach(oldBookmark => {
			if (!bookmarks.find(b => b.id === oldBookmark.id)) {
				window.dispatchEvent(new CustomEvent('bookmarkDeleted', { detail: oldBookmark }))
			}
		})
	}, [bookmarks, initialBookmarks])

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
					<p className="text-muted-foreground">
						View your recently added bookmarks
					</p>
				</div>
				<Button onClick={() => setIsAddDialogOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Bookmark
				</Button>
			</div>

			{bookmarks.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
					<Plus className="mb-4 h-12 w-12 text-muted-foreground" />
					<h3 className="mb-2 text-lg font-medium">No bookmarks in inbox</h3>
					<p className="mb-4 text-sm text-muted-foreground">
						Add a new bookmark or check back later
					</p>
					<Button onClick={() => setIsAddDialogOpen(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Add Bookmark
					</Button>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{bookmarks.map((bookmark) => (
						<BookmarkCard
							key={bookmark.id}
							id={bookmark.id}
							title={bookmark.title || ""}
							url={bookmark.url}
							description={bookmark.description || undefined}
							createdAt={new Date(bookmark.created_at || "")}
							faviconUrl={bookmark.favicon_url}
							ogImageUrl={bookmark.og_image_url}
							category={bookmark.categories}
							onEdit={() => handleEdit(bookmark)}
							onDelete={() => handleBookmarkDelete(bookmark.id)}
						/>
					))}
				</div>
			)}

			<BookmarkFormDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				onSuccess={handleBookmarkAdd}
			/>

			{editingBookmark && (
				<BookmarkFormDialog
					open={!!editingBookmark}
					onOpenChange={handleCloseEdit}
					bookmark={{
						id: editingBookmark.id,
						title: editingBookmark.title || "",
						url: editingBookmark.url,
						description: editingBookmark.description,
						category_id: editingBookmark.category_id
					}}
					onSuccess={handleBookmarkUpdate}
				/>
			)}
		</div>
	)
}
