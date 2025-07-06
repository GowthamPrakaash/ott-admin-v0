"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Check, Trash2 } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface InviteToken {
  id: string
  token: string
  created_at: string
  expires_at: string
  used_at: string | null
  used_by: string | null
  role: string
}

export function InviteList() {
  const [invites, setInvites] = useState<InviteToken[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchInvites()
  }, [])

  async function fetchInvites() {
    setIsLoading(true)
    try {
      const data = await prisma.invite_tokens.findMany({
        orderBy: { created_at: "desc" },
      })
      setInvites(data || [])
    } catch (error: any) {
      toast.error(error.message || "Failed to load invite tokens")
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteInvite(id: string) {
    try {
      await prisma.invite_tokens.delete({ where: { id } })
      setInvites(invites.filter((invite) => invite.id !== id))
      toast.success("The invite has been deleted successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete invite")
    }
  }

  function getRoleLabel(role: string) {
    switch (role) {
      case "admin":
        return <span className="font-medium text-destructive">Admin</span>
      case "editor":
        return <span className="font-medium text-warning">Editor</span>
      case "viewer":
        return <span className="font-medium text-primary">Viewer</span>
      default:
        return role
    }
  }

  function getStatusLabel(invite: InviteToken) {
    const now = new Date()
    const expiresAt = new Date(invite.expires_at)

    if (invite.used_at) {
      return (
        <span className="inline-flex items-center text-success">
          <Check className="mr-1 h-3 w-3" /> Used
        </span>
      )
    }

    if (now > expiresAt) {
      return <span className="text-destructive">Expired</span>
    }

    return <span className="text-primary">Active</span>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Links</CardTitle>
        <CardDescription>Manage your active and expired invite links</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : invites.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No invite links found. Generate one above.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell>{format(new Date(invite.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>{getRoleLabel(invite.role)}</TableCell>
                  <TableCell>{format(new Date(invite.expires_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>{getStatusLabel(invite)}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Invite</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this invite link? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteInvite(invite.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
