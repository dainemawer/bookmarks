"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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

	// Memoize the initial bookmarks map for O(1) lookups
	const initialBookmarksMap = useMemo(() => {
		return new Map(initialBookmarks.map(bookmark => [bookmark.id, bookmark]))
	}, [initialBookmarks])

	// Memoize event handlers
	const handleCategoryUpdate = useCallback((bookmark: Bookmark, isNew: boolean) => {
		if (bookmark.category_id) {
			window.dispatchEvent(new CustomEvent('updateCategoryCount', {
				detail: {
					categoryId: bookmark.category_id,
					increment: isNew
				}
			}))
		}
	}, [])

	const handleBookmarkChange = useCallback((bookmark: Bookmark, oldBookmark?: Bookmark) => {
		if (oldBookmark?.category_id !== bookmark.category_id) {
			if (oldBookmark?.category_id) {
				handleCategoryUpdate(oldBookmark, false)
			}
			handleCategoryUpdate(bookmark, true)
		}
	}, [handleCategoryUpdate])

	// Memoize bookmark handlers
	const handleEdit = useCallback((bookmark: Bookmark) => {
		setEditingBookmark(bookmark)
	}, [])

	const handleCloseEdit = useCallback(() => {
		setEditingBookmark(null)
	}, [])

	const handleBookmarkAdd = useCallback((newBookmark: Bookmark) => {
		setBookmarks(prev => [newBookmark, ...prev])
	}, [])

	const handleBookmarkDelete = useCallback((deletedBookmarkId: string) => {
		setBookmarks(prev => prev.filter(bookmark => bookmark.id !== deletedBookmarkId))
	}, [])

	const handleBookmarkUpdate = useCallback((updatedBookmark: Bookmark) => {
		setBookmarks(prev =>
			prev.map(bookmark =>
				bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark
			)
		)
	}, [])

	// Handle category count updates
	useEffect(() => {
		const handleAdd = (bookmark: Bookmark) => handleCategoryUpdate(bookmark, true)
		const handleDelete = (bookmark: Bookmark) => handleCategoryUpdate(bookmark, false)
		const handleUpdate = (bookmark: Bookmark, oldBookmark: Bookmark) => handleBookmarkChange(bookmark, oldBookmark)

		window.addEventListener('bookmarkAdded', ((e: CustomEvent) => handleAdd(e.detail)) as EventListener)
		window.addEventListener('bookmarkDeleted', ((e: CustomEvent) => handleDelete(e.detail)) as EventListener)
		window.addEventListener('bookmarkUpdated', ((e: CustomEvent) => handleUpdate(e.detail.bookmark, e.detail.oldBookmark)) as EventListener)

		return () => {
			window.removeEventListener('bookmarkAdded', ((e: CustomEvent) => handleAdd(e.detail)) as EventListener)
			window.removeEventListener('bookmarkDeleted', ((e: CustomEvent) => handleDelete(e.detail)) as EventListener)
			window.removeEventListener('bookmarkUpdated', ((e: CustomEvent) => handleUpdate(e.detail.bookmark, e.detail.oldBookmark)) as EventListener)
		}
	}, [handleCategoryUpdate, handleBookmarkChange])

	// Dispatch events when bookmarks change
	useEffect(() => {
		const currentBookmarksMap = new Map(bookmarks.map(bookmark => [bookmark.id, bookmark]))

		// Handle new and updated bookmarks
		bookmarks.forEach(bookmark => {
			const oldBookmark = initialBookmarksMap.get(bookmark.id)
			if (!oldBookmark) {
				window.dispatchEvent(new CustomEvent('bookmarkAdded', { detail: bookmark }))
			} else if (oldBookmark.category_id !== bookmark.category_id) {
				window.dispatchEvent(new CustomEvent('bookmarkUpdated', {
					detail: { bookmark, oldBookmark }
				}))
			}
		})

		// Handle deleted bookmarks
		initialBookmarks.forEach(oldBookmark => {
			if (!currentBookmarksMap.has(oldBookmark.id)) {
				window.dispatchEvent(new CustomEvent('bookmarkDeleted', { detail: oldBookmark }))
			}
		})
	}, [bookmarks, initialBookmarksMap])

	// Memoize the empty state JSX
	const emptyState = useMemo(() => (
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
	), [])

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

			{bookmarks.length === 0 ? emptyState : (
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
