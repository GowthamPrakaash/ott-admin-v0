"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ManagedRole {
    id: string
    email: string
    role: "admin" | "editor"
    createdAt: string
}

export function RoleManager() {
    const [roles, setRoles] = useState<ManagedRole[]>([])
    const [email, setEmail] = useState("")
    const [role, setRole] = useState<"admin" | "editor">("editor")
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchRoles()
    }, [])

    async function fetchRoles() {
        setLoading(true)
        try {
            const res = await fetch("/api/roles")
            if (!res.ok) throw new Error("Unauthorized or failed to fetch roles")
            const data = await res.json()
            setRoles(data)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleAddOrUpdate(e: React.FormEvent) {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await fetch("/api/roles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, role }),
            })
            if (!res.ok) throw new Error("Failed to add/update role")
            toast.success("Role updated")
            setEmail("")
            setRole("editor")
            fetchRoles()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete(email: string) {
        if (!window.confirm("Remove this user from admin/editor roles? They will become a viewer.")) return
        setSubmitting(true)
        try {
            const res = await fetch("/api/roles", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to remove role")
            toast.success("Role removed. User is now a viewer.")
            fetchRoles()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Card className="max-w-xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>Admin/Editor Management</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddOrUpdate} className="flex flex-col gap-4 mb-6">
                    <Input
                        type="email"
                        placeholder="user@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        disabled={submitting}
                    />
                    <Select value={role} onValueChange={v => setRole(v as "admin" | "editor")}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button type="submit" disabled={submitting || !email}>
                        {submitting ? "Saving..." : "Add/Update Role"}
                    </Button>
                </form>
                <div>
                    <h3 className="font-semibold mb-2">Current Admins & Editors</h3>
                    {loading ? (
                        <div>Loading...</div>
                    ) : roles.length === 0 ? (
                        <div className="text-muted-foreground">No admin/editor users yet.</div>
                    ) : (
                        <ul className="space-y-2">
                            {roles.map(r => (
                                <li key={r.id} className="flex items-center justify-between border rounded p-2">
                                    <span>
                                        <span className="font-medium">{r.email}</span> <span className="text-xs text-muted-foreground">({r.role})</span>
                                    </span>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(r.email)}
                                        disabled={submitting}
                                    >
                                        Remove
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
