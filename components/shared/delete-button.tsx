"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { prisma } from "@/lib/prisma"

interface DeleteButtonProps {
  id: string
  name: string
  type: "movie" | "series" | "episode" | "genre"
  redirectTo?: string
}

export function DeleteButton({ id, name, type, redirectTo }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      let table = ''
      switch (type) {
        case 'movie':
          table = 'movie'
          break
        case 'series':
          table = 'series'
          break
        case 'episode':
          table = 'episode'
          break
        case 'genre':
          table = 'genre'
          break
      }
      await prisma[table].delete({ where: { id } })
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted: ${name} has been deleted successfully.`)
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.back()
      }
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.')
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" onClick={() => setIsOpen(true)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete {type.charAt(0).toUpperCase() + type.slice(1)}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {type.charAt(0).toUpperCase() + type.slice(1)}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
