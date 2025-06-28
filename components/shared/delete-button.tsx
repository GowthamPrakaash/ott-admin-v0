"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
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
  const { toast } = useToast()
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      let table = ""
      switch (type) {
        case "movie":
          table = "movies"
          break
        case "series":
          table = "series"
          break
        case "episode":
          table = "episodes"
          break
        case "genre":
          table = "genres"
          break
      }

      const { error } = await supabase.from(table).delete().eq("id", id)

      if (error) throw error

      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted`,
        description: `${name} has been deleted successfully.`,
      })

      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.back()
      }
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
      })
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
