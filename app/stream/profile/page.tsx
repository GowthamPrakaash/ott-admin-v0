import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { User as UserIcon, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { WatchHistoryList } from "@/components/stream/watch-history-list";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  // Fetch recent watch history (unique by movie/series/episode, most recent 10)
  const recentRaw = await prisma.watchHistory.findMany({
    where: { userId: user.id },
    orderBy: { watchedAt: "desc" },
    include: {
      movie: true,
      series: true,
      episode: true,
    },
  });
  const seen = new Set<string>();
  const history = recentRaw.filter(entry => {
    const key = entry.movieId?.toString() || entry.seriesId?.toString() || entry.episodeId?.toString();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 10);

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-gray-900 rounded-lg p-6 space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-800">
                <UserIcon className="absolute inset-0 m-auto h-12 w-12 text-gray-600" />
              </div>
              <h2 className="mt-4 text-xl font-bold">{user.username || user.email || "User"}</h2>
              <p className="text-gray-400">{user.email}</p>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/stream/profile/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
              </Button>
              <form action="/api/auth/signout" method="post">
                <Button variant="outline" className="w-full justify-start" type="submit">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 space-y-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Subscription</h2>
            <div className="bg-gray-800 rounded-lg p-4 mb-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Premium Plan</p>
                  <p className="text-sm text-gray-400">4K + HDR</p>
                  <p className="text-sm mt-2">
                    Status: <span className={user.subscriptionStatus === 'active' ? 'text-green-400' : 'text-red-400'}>{user.subscriptionStatus}</span>
                    {user.subscriptionExpiry && user.subscriptionStatus === 'active' && (
                      <span> (expires {user.subscriptionExpiry.toLocaleDateString()})</span>
                    )}
                  </p>
                </div>
                {user.subscriptionStatus !== 'active' && (
                  <Button asChild>
                    <Link href="/stream/subscription">Subscribe</Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="text-right">
              <Link href="/stream/payments" className="text-blue-400 hover:underline text-sm">View Payment History</Link>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Watch History</h2>
            <WatchHistoryList history={history} />
          </div>
        </div>
      </div>
    </div>
  );
}
