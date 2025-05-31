import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bookmark, Code, Search, Tags, Users, Zap, Github, Twitter, Mail } from "lucide-react"
import Link from "next/link"

export default async function LandingPage() {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()

	return (
		<div className="flex flex-col min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto flex h-14 items-center">
					<div className="mr-4 flex">
						<Link href="/" className="mr-6 flex items-center space-x-2">
							<Bookmark className="h-6 w-6" />
							<span className="font-bold">DevMarks</span>
						</Link>
						<nav className="flex items-center space-x-6 text-sm font-medium">
							<Link href="#features" className="transition-colors hover:text-foreground/80 text-foreground/60">
								Features
							</Link>
							<Link href="#pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">
								Pricing
							</Link>
							<Link href="#docs" className="transition-colors hover:text-foreground/80 text-foreground/60">
								Docs
							</Link>
						</nav>
					</div>
					<div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
						<nav className="flex items-center space-x-2">
							{user ? (
								<>
									<Link href="/dashboard">
										<Button variant="ghost" size="sm">
											Dashboard
										</Button>
									</Link>
									<form action="/auth/signout" method="post">
										<Button variant="outline" size="sm" type="submit">
											Sign Out
										</Button>
									</form>
								</>
							) : (
								<>
									<Link href="/auth/login">
										<Button variant="ghost" size="sm">
											Sign In
										</Button>
									</Link>
									<Link href="/auth/register">
										<Button size="sm">Sign Up</Button>
									</Link>
								</>
							)}
						</nav>
					</div>
				</div>
			</header>

			<main className="flex-1">
				{/* Hero Section */}
				<section className="w-full py-12 md:py-24 lg:py-32">
					<div className="container mx-auto px-4 md:px-6">
						<div className="flex flex-col items-center space-y-4 text-center">
							<div className="space-y-2">
								<Badge variant="secondary" className="mb-4">
									Built for Developers
								</Badge>
								<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
									Organize Your Code Resources
									<br />
									<span className="text-muted-foreground">Like Never Before</span>
								</h1>
								<p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
									The ultimate bookmarking tool designed specifically for developers. Save, organize, and discover code
									snippets, documentation, and resources with intelligent tagging and powerful search.
								</p>
							</div>
							<div className="space-x-4">
								<Button size="lg" className="h-12 px-8">
									Start Bookmarking Free
								</Button>
								<Button variant="outline" size="lg" className="h-12 px-8">
									View Demo
								</Button>
							</div>
							<p className="text-sm text-muted-foreground">No credit card required • 14-day free trial</p>
						</div>
					</div>
				</section>

				{/* Problem/Solution Section */}
				<section className="w-full py-12 md:py-24 lg:py-32 bg-card">
					<div className="container mx-auto px-4 md:px-6">
						<div className="grid gap-10 lg:grid-cols-2 items-center">
							<div className="space-y-4">
								<Badge variant="outline">The Problem</Badge>
								<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Drowning in Bookmarks?</h2>
								<div className="space-y-4 text-muted-foreground">
									<p>
										As developers, we constantly discover useful resources: Stack Overflow answers, GitHub repos,
										documentation, tutorials, and code snippets. But traditional bookmarking tools weren&apos;t built for our
										workflow.
									</p>
									<ul className="space-y-2">
										<li className="flex items-center space-x-2">
											<div className="w-2 h-2 bg-muted rounded-full"></div>
											<span>Browser bookmarks become cluttered and unsearchable</span>
										</li>
										<li className="flex items-center space-x-2">
											<div className="w-2 h-2 bg-muted rounded-full"></div>
											<span>No way to tag or categorize by technology stack</span>
										</li>
										<li className="flex items-center space-x-2">
											<div className="w-2 h-2 bg-muted rounded-full"></div>
											<span>Can&apos;t share resources effectively with your team</span>
										</li>
									</ul>
								</div>
							</div>
							<div className="space-y-4">
								<Badge variant="outline">The Solution</Badge>
								<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">DevMarks Changes Everything</h2>
								<div className="space-y-4 text-muted-foreground">
									<p>
										DevMarks is built from the ground up for developers. Intelligent categorization, powerful search,
										and seamless team collaboration make it easy to build your personal knowledge base.
									</p>
									<ul className="space-y-2">
										<li className="flex items-center space-x-2">
											<div className="w-2 h-2 bg-primary rounded-full"></div>
											<span>Auto-detect programming languages and frameworks</span>
										</li>
										<li className="flex items-center space-x-2">
											<div className="w-2 h-2 bg-primary rounded-full"></div>
											<span>Smart tagging with technology-specific categories</span>
										</li>
										<li className="flex items-center space-x-2">
											<div className="w-2 h-2 bg-primary rounded-full"></div>
											<span>Team workspaces for sharing and collaboration</span>
										</li>
									</ul>
								</div>
								<Button size="lg" className="mt-6">
									Try DevMarks Free
								</Button>
							</div>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
					<div className="container mx-auto px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="space-y-2">
								<Badge variant="secondary">Features</Badge>
								<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
									Everything You Need to Stay Organized
								</h2>
								<p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
									Powerful features designed specifically for developers&apos; workflow and needs.
								</p>
							</div>
						</div>
						<div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
							<Card>
								<CardHeader>
									<Code className="h-10 w-10 mb-2" />
									<CardTitle>Smart Code Detection</CardTitle>
									<CardDescription>
										Automatically detects programming languages, frameworks, and libraries from your bookmarked content.
									</CardDescription>
								</CardHeader>
							</Card>
							<Card>
								<CardHeader>
									<Tags className="h-10 w-10 mb-2" />
									<CardTitle>Intelligent Tagging</CardTitle>
									<CardDescription>
										AI-powered tagging system that understands developer context and suggests relevant tags
										automatically.
									</CardDescription>
								</CardHeader>
							</Card>
							<Card>
								<CardHeader>
									<Search className="h-10 w-10 mb-2" />
									<CardTitle>Powerful Search</CardTitle>
									<CardDescription>
										Search by technology stack, content type, or even code snippets within your bookmarked pages.
									</CardDescription>
								</CardHeader>
							</Card>
							<Card>
								<CardHeader>
									<Users className="h-10 w-10 mb-2" />
									<CardTitle>Team Workspaces</CardTitle>
									<CardDescription>
										Create shared collections with your team. Perfect for onboarding, knowledge sharing, and
										collaboration.
									</CardDescription>
								</CardHeader>
							</Card>
							<Card>
								<CardHeader>
									<Zap className="h-10 w-10 mb-2" />
									<CardTitle>Browser Extension</CardTitle>
									<CardDescription>
										One-click bookmarking with our Chrome and Firefox extensions. Save directly from GitHub, Stack
										Overflow, and more.
									</CardDescription>
								</CardHeader>
							</Card>
							<Card>
								<CardHeader>
									<Code className="h-10 w-10 mb-2" />
									<CardTitle>API Access</CardTitle>
									<CardDescription>
										Full REST API access to integrate DevMarks with your existing tools and workflow automation.
									</CardDescription>
								</CardHeader>
							</Card>
						</div>
						<div className="flex justify-center">
							<Button size="lg">Get Started Today</Button>
						</div>
					</div>
				</section>

				{/* Newsletter Section */}
				<section className="w-full py-12 md:py-24 lg:py-32 bg-background">
					<div className="container mx-auto px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="space-y-2">
								<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Stay Updated</h2>
								<p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
									Get the latest updates on new features, developer tips, and curated resource collections.
								</p>
							</div>
							<div className="w-full max-w-sm space-y-2">
								<form className="flex gap-2">
									<Input type="email" placeholder="Enter your email" className="max-w-lg flex-1" />
									<Button type="submit">Subscribe</Button>
								</form>
								<p className="text-xs text-muted-foreground">No spam. Unsubscribe at any time.</p>
							</div>
						</div>
					</div>
				</section>

				{/* Final CTA Section */}
				<section className="w-full py-12 md:py-24 lg:py-32 bg-background">
					<div className="container mx-auto px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="space-y-2">
								<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
									Ready to Organize Your Dev Resources?
								</h2>
								<p className="mx-auto max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
									Join thousands of developers who have already transformed their bookmark chaos into organized
									knowledge.
								</p>
							</div>
							<div className="space-x-4">
								<Button size="lg" variant="secondary" className="h-12 px-8">
									Start Free Trial
								</Button>
								<Button variant="outline" size="lg" className="h-12 px-8 border-primary-foreground/20 hover:bg-primary-foreground/10">
									Schedule Demo
								</Button>
							</div>
							<p className="text-sm">14-day free trial • No credit card required</p>
						</div>
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="w-full py-6 bg-card border-t">
				<div className="container mx-auto px-4 md:px-6">
					<div className="grid gap-8 lg:grid-cols-4">
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								<Bookmark className="h-6 w-6" />
								<span className="font-bold">DevMarks</span>
							</div>
							<p className="text-sm text-muted-foreground">The bookmarking tool built specifically for developers.</p>
							<div className="flex space-x-4">
								<Link href="#" className="text-muted-foreground hover:text-foreground">
									<Github className="h-5 w-5" />
								</Link>
								<Link href="#" className="text-muted-foreground hover:text-foreground">
									<Twitter className="h-5 w-5" />
								</Link>
								<Link href="#" className="text-muted-foreground hover:text-foreground">
									<Mail className="h-5 w-5" />
								</Link>
							</div>
						</div>
						<div className="space-y-4">
							<h4 className="text-sm font-semibold">Product</h4>
							<ul className="space-y-2 text-sm">
								<li>
									<Link href="#" className="text-muted-foreground hover:text-foreground">
										Features
									</Link>
								</li>
								<li>
									<Link href="#" className="text-muted-foreground hover:text-foreground">
										Pricing
									</Link>
								</li>
								<li>
									<Link href="#" className="text-muted-foreground hover:text-foreground">
										API
									</Link>
								</li>
								<li>
									<Link href="#" className="text-muted-foreground hover:text-foreground">
										Browser Extension
									</Link>
								</li>
							</ul>
						</div>
						<div className="space-y-4">
							<h4 className="text-sm font-semibold">Company</h4>
							<ul className="space-y-2 text-sm">
								<li>
									<Link href="#" className="text-muted-foreground hover:text-foreground">
										About
									</Link>
								</li>
								<li>
									<Link href="#" className="text-muted-foreground hover:text-foreground">
										Blog
									</Link>
								</li>
								<li>
									<Link href="#" className="text-muted-foreground hover:text-foreground">
										Careers
									</Link>
								</li>
								<li>
									<Link href="#" className="text-muted-foreground hover:text-foreground">
										Contact
									</Link>
								</li>
							</ul>
						</div>
						<div className="space-y-4">
							<h4 className="text-sm font-semibold">Support</h4>
							<ul className="space-y-2 text-sm">
								<li>
									<Link href="#" className="text-muted-foreground hover:text-foreground">
										Documentation
									</Link>
								</li>
								<li>
									<Link href="#" className="text-muted-foreground hover:text-foreground">
										Help Center
									</Link>
								</li>
								<li>
									<Link href="#" className="text-muted-foreground hover:text-foreground">
										Privacy Policy
									</Link>
								</li>
								<li>
									<Link href="#" className="text-muted-foreground hover:text-foreground">
										Terms of Service
									</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className="mt-8 border-t pt-8 flex flex-col sm:flex-row justify-between items-center">
						<p className="text-xs text-muted-foreground">© {new Date().getFullYear()} DevMarks. All rights reserved.</p>
						<p className="text-xs text-muted-foreground">Made with ❤️ for developers</p>
					</div>
				</div>
			</footer>
		</div>
	)
}
