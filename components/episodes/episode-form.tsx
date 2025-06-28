"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/components/ui/use-toast"
import { FileUploader } from "@/components/shared/file-uploader"
import { VideoUploader } from "@/components/shared/video-uploader"
import { SubtitleUploader } from "@/components/shared/subtitle-uploader"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  series_id: z.string().min(1, { message: "Series is required" }),
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  season_number: z.coerce.number().min(1, { message: "Season number must be at least 1" }),
  episode_number: z.coerce.number().min(1, { message: "Episode number must be at least 1" }),
  duration: z.coerce.number().min(1, { message: "Duration must be at least 1 minute" }),
  video_id: z.string().min(1, { message: "Video is required" }),
  poster_url: z.string().min(1, { message: "Poster image is required" }),
  status: z.enum(["draft", "published"]),
  release_date: z.date({
    required_error: "Release date is required",
  }),
  subtitles: z
    .array(
      z.object({
        language: z.string(),
        label: z.string(),
        src: z.string().optional(),
      }),
    )
    .default([]),
})

export function EpisodeForm({ episode }: { episode?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [seriesList, setSeriesList] = useState<any[]>([])
  const [calendarOpen, setCalendarOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      series_id: episode?.series_id || "",
      title: episode?.title || "",
      description: episode?.description || "",
      meta_title: episode?.meta_title || "",
      meta_description: episode?.meta_description || "",
      season_number: episode?.season_number || 1,
      episode_number: episode?.episode_number || 1,
      duration: episode?.duration || 0,
      video_id: episode?.video_id || "",
      poster_url: episode?.poster_url || "",
      status: episode?.status || "draft",
      release_date: episode?.release_date ? new Date(episode.release_date) : new Date(),
      subtitles: episode?.subtitles || [],
    },
  })

  useEffect(() => {
    async function fetchSeries() {
      const { data, error } = await supabase.from("series").select("id, title").order("title")

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load series list. Please try again.",
        })
        return
      }

      setSeriesList(data || [])
    }

    fetchSeries()
  }, [toast, supabase])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Format the date to ISO string for database storage
      const formattedValues = {
        ...values,
        release_date: values.release_date.toISOString().split("T")[0],
      }

      if (episode) {
        // Update existing episode
        const { error } = await supabase.from("episodes").update(formattedValues).eq("id", episode.id)

        if (error) throw error

        toast({
          title: "Episode updated",
          description: "Your episode has been updated successfully.",
        })

        // Redirect to episode detail page
        router.push(`/dashboard/episodes/${episode.id}`)
      } else {
        // Create new episode
        const { error, data } = await supabase.from("episodes").insert(formattedValues).select()

        if (error) throw error

        toast({
          title: "Episode added",
          description: "Your episode has been added successfully.",
        })

        // Redirect to series detail page with the newly created episode
        if (data && data[0]) {
          router.push(`/dashboard/series/${values.series_id}`)
        } else {
          router.push("/dashboard/episodes")
        }
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
          name="series_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Series</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a series" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {seriesList.map((series) => (
                    <SelectItem key={series.id} value={series.id}>
                      {series.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Select the series this episode belongs to</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Episode Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter episode title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="season_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Season</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="episode_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Episode</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (min)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="release_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Release Date</FormLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date)
                      setCalendarOpen(false)
                    }}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>The date when this episode was or will be released</FormDescription>
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
                <Textarea placeholder="Enter episode description" className="min-h-32" {...field} />
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
                        Custom title for search engines. If left empty, the episode title will be used.
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

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="poster_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Episode Thumbnail</FormLabel>
                <FormControl>
                  <FileUploader value={field.value} onChange={field.onChange} accept="image/*" maxSize={5} />
                </FormControl>
                <FormDescription>Upload a thumbnail image (max 5MB)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="video_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video</FormLabel>
                <FormControl>
                  <VideoUploader value={field.value} onChange={field.onChange} contentType="episode" />
                </FormControl>
                <FormDescription>Upload your episode video file</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subtitles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtitles</FormLabel>
              <FormControl>
                <SubtitleUploader
                  videoId={form.watch("video_id")}
                  value={field.value}
                  onChange={field.onChange}
                  contentType="episode"
                />
              </FormControl>
              <FormDescription>Upload subtitle files in different languages (SRT, VTT, etc.)</FormDescription>
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
                    ? "This episode is live and visible to users."
                    : "This episode is in draft mode and not visible to users."}
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
            onClick={() => {
              if (episode) {
                router.push(`/dashboard/episodes/${episode.id}`)
              } else {
                router.push("/dashboard/episodes")
              }
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : episode ? "Update Episode" : "Add Episode"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
