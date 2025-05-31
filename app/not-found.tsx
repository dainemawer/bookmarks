import Link from "next/link"

export default function NotFound() {
	return (
		<div className="container flex h-screen w-screen flex-col items-center justify-center">
			<div className="mx-auto flex max-w-[350px] flex-col justify-center text-center">
				<h1 className="text-4xl font-bold">404</h1>
				<h2 className="mt-4 text-lg font-semibold">Page not found</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					Sorry, we couldn&apos;t find the page you&apos;re looking for.
				</p>
				<Link
					href="/"
					className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
				>
					Go back home
				</Link>
			</div>
		</div>
	)
}
