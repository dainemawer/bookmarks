import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Logo } from "@/components/auth/logo"
import { Button } from "@/components/ui/button"
import { Bookmark, Inbox, Tag, FolderTree, Settings, Menu, LogOut } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

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
	{
		name: "Categories",
		href: "/categories",
		icon: FolderTree,
	},
	{
		name: "Tags",
		href: "/tags",
		icon: Tag,
	},
	{
		name: "Settings",
		href: "/settings",
		icon: Settings,
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
					</div>
					<nav className="grid gap-1 p-2">
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
						<div className="mt-auto pt-4">
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
					</nav>
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
