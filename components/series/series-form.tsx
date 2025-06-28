"use client"

import { useState, useEffect } from "react"
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
import { FileUploader } from "@/components/shared/file-uploader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  release_year: z.coerce
    .number()
    .min(1900, { message: "Release year must be at least 1900" })
    .max(new Date().getFullYear() + 5),
  genre: z.string().min(2, { message: "Genre must be at least 2 characters" }),
  poster_url: z.string().min(1, { message: "Poster image is required" }),
  status: z.enum(["draft", "published"]),
})

export function SeriesForm({ series }: { series?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [genres, setGenres] = useState<any[]>([])

  useEffect(() => {
    async function fetchGenres() {
      const { data, error } = await supabase.from("genres").select("id, name").order("name")

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load genres. Please try again.",
        })
        return
      }

      setGenres(data || [])
    }

    fetchGenres()
  }, [toast, supabase])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: series?.title || "",
      description: series?.description || "",
      meta_title: series?.meta_title || "",
      meta_description: series?.meta_description || "",
      release_year: series?.release_year || new Date().getFullYear(),
      genre: series?.genre || "",
      poster_url: series?.poster_url || "",
      status: series?.status || "draft",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      if (series) {
        // Update existing series
        const { error } = await supabase.from("series").update(values).eq("id", series.id)

        if (error) throw error

        toast({
          title: "Series updated",
          description: "Your series has been updated successfully.",
        })

        // Redirect to series detail page
        router.push(`/dashboard/series/${series.id}`)
      } else {
        // Create new series
        const { error, data } = await supabase.from("series").insert(values).select()

        if (error) throw error

        toast({
          title: "Series added",
          description: "Your series has been added successfully.",
        })

        // Redirect to series list
        router.push("/dashboard/series")
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

            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre.id} value={genre.name}>
                          {genre.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Select the primary genre of the series</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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
