"use server"

import { createClient } from "@/lib/supabase/server"

interface BookmarkMetadata {
	favicon_url: string | null
	og_image_url: string | null
}

export async function fetchAndStoreBookmarkMetadata(
	bookmarkId: string,
	url: string
): Promise<BookmarkMetadata> {
	try {
		const response = await fetch(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (compatible; BookmarksBot/1.0; +https://bookmarks.example.com/bot)",
			},
		})

		if (!response.ok) {
			throw new Error(`Failed to fetch URL: ${response.statusText}`)
		}

		const html = await response.text()
		const metadata: BookmarkMetadata = {
			favicon_url: null,
			og_image_url: null,
		}

		// Extract favicon
		const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i)
		if (faviconMatch) {
			metadata.favicon_url = new URL(faviconMatch[1], url).toString()
		} else {
			// Fallback to default favicon location
			metadata.favicon_url = new URL("/favicon.ico", url).toString()
		}

		// Extract OpenGraph image
		const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
		if (ogImageMatch) {
			metadata.og_image_url = new URL(ogImageMatch[1], url).toString()
		} else {
			// Try Twitter card image as fallback
			const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
			if (twitterImageMatch) {
				metadata.og_image_url = new URL(twitterImageMatch[1], url).toString()
			}
		}

		// Store metadata in database
		const supabase = await createClient()

		const { error } = await supabase
			.from("bookmarks")
			.update({
				favicon_url: metadata.favicon_url,
				og_image_url: metadata.og_image_url,
			})
			.eq("id", bookmarkId)

		if (error) {
			console.error("Error updating bookmark metadata:", error)
		}

		return metadata
	} catch (error) {
		console.error("Error fetching bookmark metadata:", error)
		return {
			favicon_url: null,
			og_image_url: null,
		}
	}
}
