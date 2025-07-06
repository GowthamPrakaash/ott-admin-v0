import { redirect } from "next/navigation"

export default function StreamLoginRedirect() {
    redirect("/login")
}
