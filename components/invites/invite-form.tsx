"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

const formSchema = z.object({
  role: z.enum(["admin", "editor", "viewer"], {
    required_error: "Please select a role",
  }),
  expiresIn: z.enum(["1", "7", "30"], {
    required_error: "Please select an expiration period",
  }),
})

interface InviteFormProps {
  userId: string
}

export function InviteForm({ userId }: InviteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "viewer",
      expiresIn: "7",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setInviteLink(null)

    try {
      // Generate a random token
      const token = crypto.randomUUID()

      // Calculate expiration date
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + Number.parseInt(values.expiresIn))

      // TODO: Save the token to the database using Prisma
      // const { error } = await prisma.inviteToken.create({
      //   data: {
      //     token,
      //     createdBy: userId,
      //     expiresAt: expiresAt.toISOString(),
      //     role: values.role,
      //   },
      // })

      // if (error) throw error

      // Generate the invite link
      const link = `${window.location.origin}/signup?token=${token}`
      setInviteLink(link)

      toast.success("The invite link has been generated successfully.")
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      toast.success("The invite link has been copied to your clipboard.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Invite Link</CardTitle>
        <CardDescription>Create an invite link for new users to sign up with specific permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The permission level for the new user</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires In</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select expiration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 Day</SelectItem>
                        <SelectItem value="7">7 Days</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>How long the invite link will be valid</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Generating..." : "Generate Invite Link"}
            </Button>
          </form>
        </Form>

        {inviteLink && (
          <div className="mt-6 p-4 border rounded-md bg-muted">
            <p className="text-sm font-medium mb-2">Invite Link:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 p-2 text-sm bg-background border rounded-md"
              />
              <Button size="sm" onClick={copyToClipboard}>
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Share this link with the person you want to invite. The link will expire based on your selection.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
