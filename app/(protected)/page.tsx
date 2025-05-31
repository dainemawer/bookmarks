import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bookmark, FolderTree, Tag, Clock } from "lucide-react"

export const metadata: Metadata = {
	title: "Dashboard | Bookmarks",
	description: "Overview of your bookmarks and activity",
}

export default async function DashboardPage() {
	const supabase = await createClient()

	// Fetch bookmark statistics
	const { count } = await supabase
		.from("bookmarks")
		.select("*", { count: "exact", head: true })

	// Fetch recent bookmarks
	const { data: recentBookmarks } = await supabase
		.from("bookmarks")
		.select("id, title, url, created_at")
		.order("created_at", { ascending: false })
		.limit(5)

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground">
					Welcome back! Here&apos;s an overview of your bookmarks.
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
						<Bookmark className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{count || 0}</div>
						<p className="text-xs text-muted-foreground">
							All your saved bookmarks
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Categories</CardTitle>
						<FolderTree className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">
							Organized collections
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tags</CardTitle>
						<Tag className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">
							Custom labels
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{recentBookmarks?.length || 0}</div>
						<p className="text-xs text-muted-foreground">
							New bookmarks today
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Recent Bookmarks */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Bookmarks</CardTitle>
					<CardDescription>
						Your most recently added bookmarks
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{recentBookmarks?.map((bookmark) => (
							<div
								key={bookmark.id}
								className="flex items-center justify-between"
							>
								<div className="space-y-1">
									<p className="text-sm font-medium leading-none">
										{bookmark.title}
									</p>
									<p className="text-sm text-muted-foreground">
										{bookmark.url}
									</p>
								</div>
								<div className="text-sm text-muted-foreground">
									{bookmark.created_at ? new Date(bookmark.created_at).toLocaleDateString() : "N/A"}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
