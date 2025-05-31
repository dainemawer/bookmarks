"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface SettingsContentProps {
	user: User | null
}

export function SettingsContent({ user }: SettingsContentProps) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [email, setEmail] = useState(user?.email || "")
	const [currentPassword, setCurrentPassword] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")

	const handleUpdateEmail = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			const response = await fetch("/api/settings/email", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			})

			if (response.ok) {
				router.refresh()
			}
		} finally {
			setIsLoading(false)
		}
	}

	const handleUpdatePassword = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		if (newPassword !== confirmPassword) {
			alert("New passwords do not match")
			setIsLoading(false)
			return
		}

		try {
			const response = await fetch("/api/settings/password", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					currentPassword,
					newPassword,
				}),
			})

			if (response.ok) {
				setCurrentPassword("")
				setNewPassword("")
				setConfirmPassword("")
				router.refresh()
			}
		} finally {
			setIsLoading(false)
		}
	}

	const handleDeleteAccount = async () => {
		setIsLoading(true)

		try {
			const response = await fetch("/api/settings/account", {
				method: "DELETE",
			})

			if (response.ok) {
				router.push("/")
			}
		} finally {
			setIsLoading(false)
		}
	}

	const handleExport = async (format: "json" | "csv") => {
		setIsLoading(true)

		try {
			const response = await fetch(`/api/export?format=${format}`)
			const blob = await response.blob()
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = `bookmarks.${format}`
			document.body.appendChild(a)
			a.click()
			window.URL.revokeObjectURL(url)
			document.body.removeChild(a)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Settings</h1>
				<p className="text-muted-foreground">
					Manage your account settings and export your bookmarks
				</p>
			</div>

			<Separator />

			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Profile</CardTitle>
						<CardDescription>
							Update your email address and password
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<form onSubmit={handleUpdateEmail} className="space-y-4">
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>
							<Button type="submit" disabled={isLoading}>
								Update Email
							</Button>
						</form>

						<Separator />

						<form onSubmit={handleUpdatePassword} className="space-y-4">
							<div className="grid gap-2">
								<Label htmlFor="current-password">
									Current Password
								</Label>
								<Input
									id="current-password"
									type="password"
									value={currentPassword}
									onChange={(e) =>
										setCurrentPassword(e.target.value)
									}
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="new-password">New Password</Label>
								<Input
									id="new-password"
									type="password"
									value={newPassword}
									onChange={(e) =>
										setNewPassword(e.target.value)
									}
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="confirm-password">
									Confirm New Password
								</Label>
								<Input
									id="confirm-password"
									type="password"
									value={confirmPassword}
									onChange={(e) =>
										setConfirmPassword(e.target.value)
									}
									required
								/>
							</div>
							<Button type="submit" disabled={isLoading}>
								Update Password
							</Button>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Export</CardTitle>
						<CardDescription>
							Export your bookmarks in various formats
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex gap-4">
							<Button
								onClick={() => handleExport("json")}
								disabled={isLoading}
							>
								Export as JSON
							</Button>
							<Button
								onClick={() => handleExport("csv")}
								disabled={isLoading}
							>
								Export as CSV
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card className="border-destructive">
					<CardHeader>
						<CardTitle className="text-destructive">
							Danger Zone
						</CardTitle>
						<CardDescription>
							Permanently delete your account and all your data
						</CardDescription>
					</CardHeader>
					<CardContent>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive">
									Delete Account
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>
										Are you absolutely sure?
									</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will
										permanently delete your account and remove
										all your data from our servers.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDeleteAccount}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										Delete Account
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
