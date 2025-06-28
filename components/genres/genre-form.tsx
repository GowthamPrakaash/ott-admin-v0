"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
})

export function GenreForm({ genre }: { genre?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: genre?.name || "",
      description: genre?.description || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      if (genre) {
        // Update existing genre
        const { error } = await supabase.from("genres").update(values).eq("id", genre.id)

        if (error) throw error

        toast({
          title: "Genre updated",
          description: "Your genre has been updated successfully.",
        })

        // Redirect to genre detail page
        router.push(`/dashboard/genres/${genre.id}`)
      } else {
        // Create new genre
        const { error, data } = await supabase.from("genres").insert(values).select()

        if (error) throw error

        toast({
          title: "Genre added",
          description: "Your genre has been added successfully.",
        })

        // Redirect to genres list
        router.push("/dashboard/genres")
      }

      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter genre name" {...field} />
              </FormControl>
              <FormDescription>The name of the genre (e.g., Action, Comedy, Drama)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter genre description (optional)" className="min-h-32" {...field} />
              </FormControl>
              <FormDescription>A brief description of the genre</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => (genre ? router.push(`/dashboard/genres/${genre.id}`) : router.push("/dashboard/genres"))}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : genre ? "Update Genre" : "Add Genre"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
