"use client"

import { useState } from "react"
import { ChevronDown, Plus, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TagDialog } from "./tag-dialog"
import { Database } from "@/database.types"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type Tag = Database["public"]["Tables"]["tags"]["Row"] & {
	bookmark_count: number
}

interface SidebarTagsProps {
	tags: Tag[]
}

export function SidebarTags({ tags: initialTags }: SidebarTagsProps) {
	const [isOpen, setIsOpen] = useState(true)
	const [tags, setTags] = useState(initialTags)
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const pathname = usePathname()

	const handleTagSuccess = (tag: Tag) => {
		// Ensure the new tag has a bookmark_count of 0
		const newTag = { ...tag, bookmark_count: 0 }
		// Add the new tag and sort alphabetically
		const updatedTags = [...tags, newTag].sort((a, b) =>
			a.name.localeCompare(b.name)
		)
		setTags(updatedTags)
		setIsAddDialogOpen(false)
		// Automatically expand the tags section when a new tag is added
		setIsOpen(true)
	}

	return (
		<div className="space-y-1">
			<div className="flex items-center gap-1">
				<Button
					variant="ghost"
					className="flex-1 justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
					onClick={() => setIsOpen(!isOpen)}
				>
					<div className="flex items-center gap-3">
						<Tag className="h-4 w-4" />
						<span>Tags</span>
					</div>
					<ChevronDown
						className={cn(
							"h-4 w-4 transition-transform",
							isOpen && "rotate-180"
						)}
					/>
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 shrink-0"
					onClick={() => setIsAddDialogOpen(true)}
				>
					<Plus className="h-4 w-4" />
					<span className="sr-only">Add tag</span>
				</Button>
			</div>
			{isOpen && (
				<div className="ml-4 space-y-1">
					{tags.map((tag) => (
						<Link
							key={tag.id}
							href={`/tags/${tag.id}`}
							className={cn(
								"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
								pathname === `/tags/${tag.id}`
									? "bg-accent text-accent-foreground"
									: "text-muted-foreground"
							)}
						>
							<Tag className="h-4 w-4 shrink-0" />
							<span className="truncate">{tag.name}</span>
							<span className="ml-auto text-xs text-muted-foreground">
								{tag.bookmark_count}
							</span>
						</Link>
					))}
				</div>
			)}
			<TagDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				onSuccess={handleTagSuccess}
			/>
		</div>
	)
}
