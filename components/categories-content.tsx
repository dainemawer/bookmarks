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
import { CategoryDialog } from "./category-dialog"

type Category = Database["public"]["Tables"]["categories"]["Row"] & {
	bookmark_count: number
}

interface CategoriesContentProps {
	initialCategories: Category[]
}

export function CategoriesContent({ initialCategories }: CategoriesContentProps) {
	const [categories, setCategories] = useState(initialCategories)
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [editingCategory, setEditingCategory] = useState<Category | null>(null)

	const handleEdit = (category: Category) => {
		setEditingCategory(category)
	}

	const handleDelete = async (category: Category) => {
		if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
			return
		}

		const response = await fetch(`/api/categories/${category.id}`, {
			method: "DELETE",
		})

		if (response.ok) {
			setCategories(categories.filter((c) => c.id !== category.id))
		}
	}

	const handleCloseEdit = () => {
		setEditingCategory(null)
	}

	const handleCategorySuccess = (category: Category) => {
		if (editingCategory) {
			// Update existing category
			setCategories(categories.map((c) =>
				c.id === category.id ? category : c
			))
			setEditingCategory(null)
		} else {
			// Add new category
			setCategories([...categories, category])
			setIsAddDialogOpen(false)
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Categories</h1>
					<p className="text-muted-foreground">
						Organize your bookmarks into categories
					</p>
				</div>
				<Button onClick={() => setIsAddDialogOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Category
				</Button>
			</div>

			<div className="rounded-md border">
				<div className="divide-y">
					{categories.map((category) => (
						<div
							key={category.id}
							className="flex items-center justify-between p-4"
						>
							<div>
								<h3 className="font-medium">{category.name}</h3>
								<p className="text-sm text-muted-foreground">
									{category.bookmark_count} bookmark
									{category.bookmark_count !== 1 ? "s" : ""}
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
										onClick={() => handleEdit(category)}
									>
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleDelete(category)}
										className="text-destructive"
									>
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					))}
					{categories.length === 0 && (
						<div className="p-4 text-center text-muted-foreground">
							No categories yet. Create one to get started.
						</div>
					)}
				</div>
			</div>

			<CategoryDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				onSuccess={handleCategorySuccess}
			/>

			{editingCategory && (
				<CategoryDialog
					open={!!editingCategory}
					onOpenChange={handleCloseEdit}
					category={editingCategory}
					onSuccess={handleCategorySuccess}
				/>
			)}
		</div>
	)
}
