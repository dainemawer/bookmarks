import { Metadata } from "next"
import { BookmarksList } from "../../../components/bookmarks-list"

export const metadata: Metadata = {
	title: "All Bookmarks | Bookmarks",
	description: "View and manage all your bookmarks",
}

export default function BookmarksPage() {
	return (
		<div className="container py-6">
			<BookmarksList />
		</div>
	)
}
