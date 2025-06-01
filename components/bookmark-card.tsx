import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"

interface BookmarkCardProps {
	id: string
	title: string
	url: string
	description?: string
	tags?: string[]
	createdAt: Date
	lastViewed?: Date
	faviconUrl?: string | null
	ogImageUrl?: string | null
	category?: {
		id: string
		name: string
	} | null
	onEdit?: () => void
	onDelete?: () => void
}

export function BookmarkCard({
	id,
	title,
	url,
	description,
	tags,
	createdAt,
	lastViewed,
	faviconUrl,
	ogImageUrl,
	category,
	onEdit,
	onDelete,
}: BookmarkCardProps) {
	const domain = new URL(url).hostname

	const handleDelete = async () => {
		try {
			const supabase = createClient()

			// Get the current user
			const { data: { user }, error: userError } = await supabase.auth.getUser()

			if (userError || !user) {
				throw new Error("You must be logged in to delete bookmarks")
			}

			// Delete the bookmark
			const { error: deleteError } = await supabase
				.from("bookmarks")
				.delete()
				.eq("id", id)
				.eq("user_id", user.id) // Ensure user owns the bookmark

			if (deleteError) {
				console.error("Supabase delete error:", deleteError)
				throw new Error(deleteError.message || "Failed to delete bookmark")
			}

			// Call onDelete callback to update the UI
			if (onDelete) {
				onDelete()
			}
		} catch (error) {
			console.error("Error deleting bookmark:", error instanceof Error ? error.message : "Unknown error")
			alert(error instanceof Error ? error.message : "Failed to delete bookmark. Please try again.")
		}
	}

	return (
		<Card className="h-full">
			{ogImageUrl && (
				<div className="relative h-48 w-full">
					<Image
						src={ogImageUrl}
						alt={title}
						fill
						className="object-cover rounded-t-lg"
					/>
				</div>
			)}
			<CardHeader>
				<div className="flex items-start justify-between gap-2">
					<div className="flex items-center gap-2 flex-1">
						{faviconUrl && (
							<Image
								src={faviconUrl}
								alt={`${domain} favicon`}
								width={16}
								height={16}
								className="rounded-sm"
							/>
						)}
						<CardTitle className="line-clamp-1">
							<a
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:underline"
							>
								{title}
							</a>
						</CardTitle>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={onEdit}>
								<Pencil className="mr-2 h-4 w-4" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={handleDelete}
								className="text-destructive focus:text-destructive"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<CardDescription className="line-clamp-2">{description}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-2">
					<div className="flex flex-wrap gap-2">
						{category && (
							<Badge variant="outline" className="bg-accent">
								{category.name}
							</Badge>
						)}
						{tags?.map((tag) => (
							<Badge key={tag} variant="secondary">
								{tag}
							</Badge>
						))}
					</div>
					<div className="text-sm text-muted-foreground">
						<p>Added {formatDistanceToNow(createdAt, { addSuffix: true })}</p>
						{lastViewed && (
							<p>
								Last viewed{" "}
								{formatDistanceToNow(lastViewed, { addSuffix: true })}
							</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
