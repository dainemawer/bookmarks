"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, MoreVertical } from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Database } from "@/database.types"
import { TagDialog } from "./tag-dialog"

type Tag = Database["public"]["Tables"]["tags"]["Row"] & {
	bookmark_count: number
}

interface TagsContentProps {
	initialTags: Tag[]
}

export function TagsContent({ initialTags }: TagsContentProps) {
	const [tags, setTags] = useState(initialTags)
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [editingTag, setEditingTag] = useState<Tag | null>(null)

	const handleEdit = (tag: Tag) => {
		setEditingTag(tag)
	}

	const handleDelete = async (tag: Tag) => {
		if (!confirm(`Are you sure you want to delete "${tag.name}"?`)) {
			return
		}

		const response = await fetch(`/api/tags/${tag.id}`, {
			method: "DELETE",
		})

		if (response.ok) {
			setTags(tags.filter((t) => t.id !== tag.id))
		}
	}

	const handleCloseEdit = () => {
		setEditingTag(null)
	}

	const handleTagSuccess = (tag: Tag) => {
		if (editingTag) {
			// Update existing tag
			setTags(tags.map((t) =>
				t.id === tag.id ? tag : t
			))
			setEditingTag(null)
		} else {
			// Add new tag
			setTags([...tags, tag])
			setIsAddDialogOpen(false)
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Tags</h1>
					<p className="text-muted-foreground">
						Organize your bookmarks with tags
					</p>
				</div>
				<Button onClick={() => setIsAddDialogOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Tag
				</Button>
			</div>

			<div className="rounded-md border">
				<div className="divide-y">
					{tags.map((tag) => (
						<div
							key={tag.id}
							className="flex items-center justify-between p-4"
						>
							<div>
								<h3 className="font-medium">{tag.name}</h3>
								<p className="text-sm text-muted-foreground">
									{tag.bookmark_count} bookmark
									{tag.bookmark_count !== 1 ? "s" : ""}
								</p>
							</div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="h-8 w-8 p-0"
									>
										<span className="sr-only">Open menu</span>
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onClick={() => handleEdit(tag)}
									>
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleDelete(tag)}
										className="text-destructive"
									>
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					))}
					{tags.length === 0 && (
						<div className="p-4 text-center text-muted-foreground">
							No tags yet. Create one to get started.
						</div>
					)}
				</div>
			</div>

			<TagDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				onSuccess={handleTagSuccess}
			/>

			{editingTag && (
				<TagDialog
					open={!!editingTag}
					onOpenChange={handleCloseEdit}
					tag={editingTag}
					onSuccess={handleTagSuccess}
				/>
			)}
		</div>
	)
}
