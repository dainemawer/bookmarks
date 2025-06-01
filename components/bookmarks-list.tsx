"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { BookmarkCard } from "./bookmark-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Grid, List } from "lucide-react"
import { BookmarkFormDialog } from "@/components/bookmark-form-dialog"

interface Tag {
	id: string
	name: string
}

interface BookmarkTag {
	tags: Tag
}

interface Bookmark {
	id: string
	url: string
	title: string | null
	description: string | null
	favicon_url: string | null
	og_image_url: string | null
	category_id: string | null
	user_id: string | null
	created_at: string | null
	updated_at: string | null
	categories: {
		id: string
		name: string
	} | null
	bookmark_tags: BookmarkTag[]
}

export function BookmarksList() {
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
	const [sortBy, setSortBy] = useState("newest")
	const [searchQuery, setSearchQuery] = useState("")
	const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)

	useEffect(() => {
		async function fetchBookmarks() {
			const supabase = createClient()
			const { data, error } = await supabase
				.from("bookmarks")
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
				.order("created_at", { ascending: false })

			if (error) {
				console.error("Error fetching bookmarks:", error)
				return
			}

			setBookmarks(data || [])
			setIsLoading(false)
		}

		fetchBookmarks()
	}, [])

	const handleBookmarkDelete = (deletedBookmarkId: string) => {
		setBookmarks(prev => {
			const deletedBookmark = prev.find(bookmark => bookmark.id === deletedBookmarkId)
			if (deletedBookmark?.category_id) {
				// Dispatch event to update category count
				const event = new CustomEvent('updateCategoryCount', {
					detail: {
						categoryId: deletedBookmark.category_id,
						increment: false
					}
				})
				window.dispatchEvent(event)
			}
			return prev.filter(bookmark => bookmark.id !== deletedBookmarkId)
		})
	}

	const handleBookmarkSuccess = (bookmark: Bookmark) => {
		// Update the bookmarks list
		setBookmarks((prev) => {
			// If the bookmark already exists, update it
			if (prev.some((b) => b.id === bookmark.id)) {
				const oldBookmark = prev.find(b => b.id === bookmark.id)
				// If the category changed, update both old and new category counts
				if (oldBookmark?.category_id !== bookmark.category_id) {
					if (oldBookmark?.category_id) {
						const event = new CustomEvent('updateCategoryCount', {
							detail: {
								categoryId: oldBookmark.category_id,
								increment: false
							}
						})
						window.dispatchEvent(event)
					}
					if (bookmark.category_id) {
						const event = new CustomEvent('updateCategoryCount', {
							detail: {
								categoryId: bookmark.category_id,
								increment: true
							}
						})
						window.dispatchEvent(event)
					}
				}
				return prev.map((b) => (b.id === bookmark.id ? bookmark : b))
			}
			// Otherwise, add it to the list and update category count
			if (bookmark.category_id) {
				const event = new CustomEvent('updateCategoryCount', {
					detail: {
						categoryId: bookmark.category_id,
						increment: true
					}
				})
				window.dispatchEvent(event)
			}
			return [bookmark, ...prev]
		})
	}

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

	// Filter bookmarks based on search query
	const filteredBookmarks = bookmarks.filter((bookmark) =>
		(bookmark.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
		(bookmark.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
		bookmark.url.toLowerCase().includes(searchQuery.toLowerCase())
	)

	// Sort bookmarks based on selected sort option
	const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
		switch (sortBy) {
			case "newest":
				return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
			case "oldest":
				return new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime()
			case "a-z":
				return (a.title || "").localeCompare(b.title || "")
			default:
				return 0
		}
	})

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">All Bookmarks</h1>
					<p className="text-muted-foreground">
						View and manage all your bookmarks
					</p>
				</div>
				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="icon">
								{viewMode === "grid" ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setViewMode("grid")}>
								<Grid className="mr-2 h-4 w-4" />
								Grid View
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setViewMode("list")}>
								<List className="mr-2 h-4 w-4" />
								List View
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
				<div className="flex-1">
					<Input
						placeholder="Search bookmarks..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="max-w-sm"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Select value={sortBy} onValueChange={setSortBy}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="newest">Newest</SelectItem>
							<SelectItem value="oldest">Oldest</SelectItem>
							<SelectItem value="a-z">A-Z</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-8">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				</div>
			) : sortedBookmarks.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<p className="text-lg font-medium">No bookmarks found</p>
					<p className="text-sm text-muted-foreground">
						{searchQuery
							? "Try adjusting your search query"
							: "Add your first bookmark to get started"}
					</p>
				</div>
			) : (
				<div
					className={`grid gap-4 ${
						viewMode === "grid"
							? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
							: "grid-cols-1"
					}`}
				>
					{sortedBookmarks.map((bookmark) => (
						<BookmarkCard
							id={bookmark.id}
							key={bookmark.id}
							title={bookmark.title || ""}
							url={bookmark.url}
							description={bookmark.description || undefined}
							tags={bookmark.bookmark_tags.map((bt) => bt.tags.name)}
							createdAt={new Date(bookmark.created_at || "")}
							faviconUrl={bookmark.favicon_url || undefined}
							ogImageUrl={bookmark.og_image_url || undefined}
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
				onSuccess={handleBookmarkSuccess}
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
