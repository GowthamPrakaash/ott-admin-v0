"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { FileUploader } from "@/components/shared/file-uploader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  release_year: z.coerce
    .number()
    .min(1900, { message: "Release year must be at least 1900" })
    .max(new Date().getFullYear() + 5),
  genres: z.array(z.string().min(1)).min(1, { message: "Select at least one genre" }),
  poster_url: z.string().min(1, { message: "Poster image is required" }),
  status: z.enum(["draft", "published"]),
})

export function SeriesForm({ series }: { series?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const [genres, setGenres] = useState<any[]>([])

  useEffect(() => {
    console.log("series:", series)
    async function fetchGenres() {
      try {
        const res = await fetch("/api/genres")
        if (!res.ok) throw new Error("Failed to load genres.")
        const genres = await res.json()
        setGenres(genres)
      } catch (error) {
        toast.error("Failed to load genres. Please try again.")
      }
    }

    fetchGenres()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: series?.title || "",
      description: series?.description || "",
      meta_title: series?.meta_title || "",
      meta_description: series?.meta_description || "",
      release_year: series?.release_year || new Date().getFullYear(),
      genres: series?.genres?.map((g: any) => g.id) || [],
      poster_url: series?.poster_url || "",
      status: series?.status || "draft",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const formValues = { ...values }
      if (series) {
        const res = await fetch("/api/series", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: series.id, ...formValues }),
        })
        if (!res.ok) throw new Error("Failed to update series.")
        toast.success("Series updated. Your series has been updated successfully.")
        router.push(`/dashboard/series/${series.id}`)
      } else {
        const res = await fetch("/api/series", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues),
        })
        if (!res.ok) throw new Error("Failed to add series.")
        toast.success("Series added. Your series has been added successfully.")
        router.push("/dashboard/series")
      }
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter series title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="release_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Release Year</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="genres"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genres</FormLabel>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <label key={genre.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={field.value.includes(genre.id)}
                      onCheckedChange={(checked) => {
                        if (checked) field.onChange([...field.value, genre.id])
                        else field.onChange(field.value.filter((id: string) => id !== genre.id))
                      }}
                    />
                    <span>{genre.name}</span>
                  </label>
                ))}
              </div>
              <FormDescription>Select one or more genres for the series</FormDescription>
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
                <Textarea placeholder="Enter series description" className="min-h-32" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="seo">
            <AccordionTrigger>SEO Meta Tags</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-6 pt-2">
                <FormField
                  control={form.control}
                  name="meta_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter SEO meta title (optional)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Custom title for search engines. If left empty, the series title will be used.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meta_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter SEO meta description (optional)" className="min-h-20" {...field} />
                      </FormControl>
                      <FormDescription>
                        Custom description for search engines. Keep it under 160 characters for best results.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <FormField
          control={form.control}
          name="poster_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poster Image</FormLabel>
              <FormControl>
                <FileUploader value={field.value} onChange={field.onChange} accept="image/*" maxSize={5} />
              </FormControl>
              <FormDescription>Upload a poster image (max 5MB)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Publishing Status</FormLabel>
                <FormDescription>
                  {field.value === "published"
                    ? "This series is live and visible to users."
                    : "This series is in draft mode and not visible to users."}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value === "published"}
                  onCheckedChange={(checked) => field.onChange(checked ? "published" : "draft")}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => (series ? router.push(`/dashboard/series/${series.id}`) : router.push("/dashboard/series"))}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : series ? "Update Series" : "Add Series"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
