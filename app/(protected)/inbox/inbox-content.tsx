"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { BookmarkCard } from "@/components/bookmark-card"
import { BookmarkFormDialog } from "@/components/bookmark-form-dialog"
import { Database } from "@/database.types"

type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"]

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

	const handleBookmarkUpdate = (updatedBookmark: Bookmark) => {
		setBookmarks(prev =>
			prev.map(bookmark =>
				bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark
			)
		)
	}

	const handleBookmarkAdd = (newBookmark: Bookmark) => {
		setBookmarks(prev => [newBookmark, ...prev])
	}

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
					<h3 className="mb-2 text-lg font-medium">No bookmarks yet</h3>
					<p className="mb-4 text-sm text-muted-foreground">
						Add your first bookmark to get started
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
							title={bookmark.title || ""}
							url={bookmark.url}
							description={bookmark.description || undefined}
							createdAt={new Date(bookmark.created_at || "")}
							faviconUrl={bookmark.favicon_url}
							ogImageUrl={bookmark.og_image_url}
							onEdit={() => handleEdit(bookmark)}
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
						description: editingBookmark.description
					}}
					onSuccess={handleBookmarkUpdate}
				/>
			)}
		</div>
	)
}
