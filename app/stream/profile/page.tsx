'use client';

import Image from "next/image"
import { LogOut, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WatchHistoryList } from "@/components/stream/watch-history-list"
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"

// export const metadata = {
//   title: "Profile | Apsara Streaming",
//   description: "Manage your profile on Apsara Streaming",
// }

export default function ProfilePage() {
  const { data: session } = useSession()
  const [history, setHistory] = useState<any[]>([])
  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => setHistory(data.recent || []))
  }, [])
  const user = session?.user
  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-gray-900 rounded-lg p-6 space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-800">
                <User className="absolute inset-0 m-auto h-12 w-12 text-gray-600" />
              </div>
              <h2 className="mt-4 text-xl font-bold">{user?.name || user?.email || "User"}</h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => signOut({ callbackUrl: '/stream' })}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Subscription</h2>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Premium Plan</p>
                  <p className="text-sm text-gray-400">4K + HDR</p>
                </div>
                <Button>Manage</Button>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Watch History</h2>
            <WatchHistoryList history={history} />
          </div>
        </div>
      </div>
    </div>
  )
}
