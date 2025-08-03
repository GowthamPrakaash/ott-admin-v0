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
    <div className="px-4 py-6 sm:py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Profile</h1>
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        <div className="lg:w-1/3 lg:flex-shrink-0">
          <div className="bg-gray-900 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-800">
                <UserIcon className="absolute inset-0 m-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-600" />
              </div>
              <h2 className="mt-3 sm:mt-4 text-lg sm:text-xl font-bold text-center">{user.username || user.email || "User"}</h2>
              <p className="text-gray-400 text-sm sm:text-base text-center break-all px-2">{user.email}</p>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-sm sm:text-base" asChild>
                <Link href="/stream/profile/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
              </Button>
              <form action="/api/auth/signout" method="post">
                <Button variant="outline" className="w-full justify-start text-sm sm:text-base" type="submit">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
        <div className="lg:flex-1 space-y-6 sm:space-y-8">
          <div className="bg-gray-900 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Subscription</h2>
            <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base">Premium Plan</p>
                  <p className="text-xs sm:text-sm text-gray-400">4K + HDR</p>
                  <p className="text-xs sm:text-sm mt-2">
                    Status: <span className={user.subscriptionStatus === 'active' ? 'text-green-400' : 'text-red-400'}>{user.subscriptionStatus}</span>
                    {user.subscriptionExpiry && user.subscriptionStatus === 'active' && (
                      <span className="block sm:inline"> (expires {user.subscriptionExpiry.toLocaleDateString()})</span>
                    )}
                  </p>
                </div>
                {user.subscriptionStatus !== 'active' && (
                  <Button asChild className="w-full sm:w-auto">
                    <Link href="/stream/subscription">Subscribe</Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="text-right">
              <Link href="/stream/payments" className="text-blue-400 hover:underline text-xs sm:text-sm">View Payment History</Link>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Watch History</h2>
            <WatchHistoryList history={history} />
          </div>
        </div>
      </div>
    </div>
  );
}
