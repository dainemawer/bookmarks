import { Bookmark } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
	className?: string
}

export function Logo({ className }: LogoProps) {
	return (
		<Link href="/" className={cn("flex items-center space-x-2", className)}>
			<Bookmark className="h-6 w-6" />
			<span className="font-bold text-xl">DevMarks</span>
		</Link>
	)
}
