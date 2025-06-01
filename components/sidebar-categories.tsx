"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { ChevronDown, Plus, FolderTree, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CategoryDialog } from "./category-dialog"
import { Database } from "@/database.types"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type Category = Database["public"]["Tables"]["categories"]["Row"] & {
	bookmark_count: number
}

interface SidebarCategoriesProps {
	categories: Category[]
}

export function SidebarCategories({ categories: initialCategories }: SidebarCategoriesProps) {
	const [isOpen, setIsOpen] = useState(true)
	const [categories, setCategories] = useState(initialCategories)
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const pathname = usePathname()

	// Memoize category handlers
	const handleCategorySuccess = useCallback((category: Category) => {
		setCategories(prev => {
			const newCategory = { ...category, bookmark_count: 0 }
			return [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name))
		})
		setIsAddDialogOpen(false)
		setIsOpen(true)
	}, [])

	const handleToggleOpen = useCallback(() => {
		setIsOpen(prev => !prev)
	}, [])

	const handleAddCategory = useCallback(() => {
		setIsAddDialogOpen(true)
	}, [])

	// Memoize category count update handler
	const handleCategoryCountUpdate = useCallback((e: CustomEvent) => {
		const { categoryId, increment } = e.detail
		setCategories(prev =>
			prev.map(category =>
				category.id === categoryId
					? {
							...category,
							bookmark_count: category.bookmark_count + (increment ? 1 : -1),
					  }
					: category
			)
		)
	}, [])

	// Listen for category count updates
	useEffect(() => {
		window.addEventListener(
			"updateCategoryCount",
			handleCategoryCountUpdate as EventListener
		)

		return () => {
			window.removeEventListener(
				"updateCategoryCount",
				handleCategoryCountUpdate as EventListener
			)
		}
	}, [handleCategoryCountUpdate])

	// Memoize category list
	const categoryList = useMemo(() => (
		<div className="ml-4 space-y-1">
			{categories.map((category) => (
				<Link
					key={category.id}
					href={`/categories/${category.id}`}
					className={cn(
						"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
						pathname === `/categories/${category.id}`
							? "bg-accent text-accent-foreground"
							: "text-muted-foreground"
					)}
				>
					<Folder className="h-4 w-4 shrink-0" />
					<span className="truncate">{category.name}</span>
					<span className="ml-auto text-xs text-muted-foreground">
						{category.bookmark_count}
					</span>
				</Link>
			))}
		</div>
	), [categories, pathname])

	return (
		<div className="space-y-1">
			<div className="flex items-center gap-1">
				<Button
					variant="ghost"
					className="flex-1 justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
					onClick={handleToggleOpen}
				>
					<div className="flex items-center gap-3">
						<FolderTree className="h-4 w-4" />
						<span>Categories</span>
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
					onClick={handleAddCategory}
				>
					<Plus className="h-4 w-4" />
					<span className="sr-only">Add category</span>
				</Button>
			</div>
			{isOpen && categoryList}
			<CategoryDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				onSuccess={handleCategorySuccess}
			/>
		</div>
	)
}
