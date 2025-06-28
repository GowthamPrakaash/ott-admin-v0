import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SignUpForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
}

interface SignUpPageProps {
  searchParams: { token?: string }
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const supabase = createClient()
  const token = searchParams.token

  // If no token is provided, check if we should allow direct signup
  if (!token) {
    // Check if there are any users in the system
    const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true })

    // If there are users, redirect to login (we require invite tokens)
    // If there are no users, allow direct signup for the first admin
    if (count && count > 0) {
      redirect("/login?error=Invalid+or+missing+invite+token")
    }
  } else {
    // Validate the token
    const { data, error } = await supabase
      .from("invite_tokens")
      .select("*")
      .eq("token", token)
      .is("used_by", null)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !data) {
      redirect("/login?error=Invalid+or+expired+invite+token")
    }
  }

  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          OTT Admin
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Create an account to manage your OTT platform content with ease. Add movies, series, and episodes all in
              one place.
            </p>
            <footer className="text-sm">Admin Dashboard</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">Enter your details to create an admin account</p>
          </div>
          <SignUpForm token={searchParams.token} />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
