import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

interface LoginPageProps {
  searchParams: { error?: string; verifyEmail?: string; email?: string; success?: string }
}

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const errorMessage = searchParams.error ? decodeURIComponent(searchParams.error) : null
  const successMessage = searchParams.success ? decodeURIComponent(searchParams.success) : null
  const showVerify = searchParams.verifyEmail === "1"
  const verifyEmail = searchParams.email ? decodeURIComponent(searchParams.email) : null

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
          Apsara Entertainment
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Movies, series, and episodes all in one place. Enjoy streaming your favorite content anytime.
            </p>
            <footer className="text-sm">Apsara OTT</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Login to Apsara Entertainment</h1>
            <p className="text-sm text-muted-foreground">Enter your email and password to continue watching.</p>
          </div>

          {errorMessage && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">{errorMessage}</div>
          )}

          {successMessage && (
            <div className="bg-green-100 text-green-800 p-3 rounded-md text-sm mb-2">{successMessage}</div>
          )}

          {showVerify && (
            <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md text-sm mb-2">
              Please check your email{verifyEmail ? ` (${verifyEmail})` : ""} for a verification link before logging in.
            </div>
          )}

          <LoginForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
