import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { CategoriesContent } from "../../../components/categories-content"

export const metadata: Metadata = {
	title: "Categories | Bookmarks",
	description: "Organize your bookmarks into categories",
}

export default async function CategoriesPage() {
	const supabase = await createClient()

	const { data: categories } = await supabase
		.from("categories")
		.select(
			`
			*,
			bookmarks:bookmarks(count)
		`
		)
		.order("name")

	const categoriesWithCount = categories?.map((category) => ({
		...category,
		bookmark_count: category.bookmarks?.[0]?.count || 0,
	})) || []

	return (
		<div className="container py-6">
			<CategoriesContent initialCategories={categoriesWithCount} />
		</div>
	)
}
