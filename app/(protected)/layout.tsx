import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/auth/logo"
import { Bookmark, Inbox, Settings, Menu, LogOut } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { SidebarCategories } from "@/components/sidebar-categories"
import { SidebarTags } from "@/components/sidebar-tags"

const navigation = [
	{
		name: "Inbox",
		href: "/inbox",
		icon: Inbox,
	},
	{
		name: "All Bookmarks",
		href: "/bookmarks",
		icon: Bookmark,
	},
]

export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const supabase = await createClient()

	const { data: { user }, error } = await supabase.auth.getUser()

	if (error || !user) {
		redirect("/auth/login")
	}

	// Fetch categories with bookmark counts
	const { data: categories } = await supabase
		.from("categories")
		.select(`
			*,
			bookmarks:bookmarks(count)
		`)
		.eq("user_id", user.id)
		.order("name")

	const categoriesWithCounts = categories?.map((category) => ({
		...category,
		bookmark_count: category.bookmarks?.[0]?.count || 0,
	})) || []

	// Fetch tags with bookmark counts
	const { data: tags } = await supabase
		.from("tags")
		.select(`
			*,
			bookmarks:bookmarks(count)
		`)
		.eq("user_id", user.id)
		.order("name")

	const tagsWithCounts = tags?.map((tag) => ({
		...tag,
		bookmark_count: tag.bookmarks?.[0]?.count || 0,
	})) || []

	return (
		<div className="min-h-screen bg-background">
			{/* Mobile Header */}
			<header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
				<Button variant="ghost" size="icon" className="lg:hidden">
					<Menu className="h-6 w-6" />
					<span className="sr-only">Toggle menu</span>
				</Button>
				<Logo />
			</header>

			<div className="flex min-h-screen flex-col lg:flex-row">
				{/* Sidebar */}
				<aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
					<div className="flex h-14 items-center justify-between border-b px-4">
						<Logo />
						<Link
							href="/settings"
							className={cn(
								"flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
							)}
						>
							<Settings className="h-4 w-4" />
							<span className="sr-only">Settings</span>
						</Link>
					</div>
					<div className="flex h-[calc(100vh-3.5rem)] flex-col">
						<nav className="flex-1 space-y-1 p-2">
							{navigation.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
										"text-muted-foreground"
									)}
								>
									<item.icon className="h-4 w-4" />
									{item.name}
								</Link>
							))}
							<SidebarCategories categories={categoriesWithCounts} />
							<SidebarTags tags={tagsWithCounts} />
						</nav>
						<div className="border-t p-2">
							<form action="/auth/signout" method="post">
								<Button
									variant="ghost"
									size="sm"
									className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
									type="submit"
								>
									<LogOut className="h-4 w-4" />
									Sign Out
								</Button>
							</form>
						</div>
					</div>
				</aside>

				{/* Main Content */}
				<main className="flex-1 overflow-y-auto p-6">
					<div className="container px-6">
						{children}
					</div>
				</main>
			</div>
		</div>
	)
}
