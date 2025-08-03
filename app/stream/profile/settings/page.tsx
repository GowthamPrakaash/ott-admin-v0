import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Account Settings",
    description: "Manage your account settings",
};

async function updateUsername(formData: FormData) {
    "use server";

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return;

    const username = formData.get("username") as string;
    if (!username || username.trim().length === 0) return;

    await prisma.user.update({
        where: { email: session.user.email },
        data: { username: username.trim() },
    });

    redirect("/stream/profile/settings?updated=true");
}

export default async function AccountSettingsPage({
    searchParams,
}: {
    searchParams: { updated?: string };
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });
    if (!user) redirect("/login");

    return (
        <div className="px-4 py-6 sm:py-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6 sm:mb-8">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/stream/profile">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Profile
                    </Link>
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold">Account Settings</h1>
            </div>

            {searchParams.updated && (
                <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">Settings updated successfully!</p>
                </div>
            )}

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={user.email}
                                disabled
                                className="bg-gray-800 text-gray-400"
                            />
                            <p className="text-xs text-gray-500">Email cannot be changed</p>
                        </div>

                        <form action={updateUsername} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    defaultValue={user.username || ""}
                                    placeholder="Enter your username"
                                    className="bg-gray-900 border-gray-700"
                                    maxLength={50}
                                />
                                <p className="text-xs text-gray-500">
                                    This is how your name will be displayed
                                </p>
                            </div>
                            <Button type="submit">Update Username</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-400">Account Created</Label>
                                <p className="text-sm">{user.createdAt.toLocaleDateString()}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-400">User ID</Label>
                                <p className="text-xs font-mono">{user.id}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-400">Subscription Status</Label>
                                <p className={`text-sm ${user.subscriptionStatus === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                                    {user.subscriptionStatus}
                                </p>
                            </div>
                            {user.subscriptionExpiry && user.subscriptionStatus === 'active' && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-400">Subscription Expires</Label>
                                    <p className="text-sm">{user.subscriptionExpiry.toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-red-400">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium mb-2">Delete Account</h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                                <Button variant="destructive" disabled>
                                    Delete Account (Coming Soon)
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}