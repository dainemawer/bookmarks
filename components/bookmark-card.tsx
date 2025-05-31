import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import { MoreVertical } from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BookmarkCardProps {
	title: string
	url: string
	description?: string
	tags?: string[]
	createdAt: Date
	lastViewed?: Date
	faviconUrl?: string | null
	ogImageUrl?: string | null
	onEdit?: () => void
}

export function BookmarkCard({
	title,
	url,
	description,
	tags,
	createdAt,
	lastViewed,
	faviconUrl,
	ogImageUrl,
	onEdit,
}: BookmarkCardProps) {
	const domain = new URL(url).hostname

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
					{onEdit && (
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
									Edit
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
				<CardDescription className="line-clamp-2">{description}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-2">
					<div className="flex flex-wrap gap-2">
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
