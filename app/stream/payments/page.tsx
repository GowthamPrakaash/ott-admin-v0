import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const metadata = {
    title: "Payment History",
    description: "Your subscription payment history",
};

export default async function PaymentsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/login");
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) redirect("/login");
    const payments = await prisma.payment.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });
    return (
        <div className="px-4 py-6 sm:py-8 max-w-7xl mx-auto">
            <div className="space-y-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Payment History</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {payments.length === 0 ? (
                            <p className="text-muted-foreground">No payments found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="px-4 py-3 text-left font-medium">Date</th>
                                            <th className="px-4 py-3 text-left font-medium">Amount</th>
                                            <th className="px-4 py-3 text-left font-medium">Status</th>
                                            <th className="px-4 py-3 text-left font-medium">Payment ID</th>
                                            <th className="px-4 py-3 text-left font-medium">Order ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((p) => (
                                            <tr key={p.id} className="border-b border-gray-800">
                                                <td className="px-4 py-3">{p.createdAt.toLocaleString()}</td>
                                                <td className="px-4 py-3 font-medium">₹{(p.amount / 100).toFixed(2)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'succeeded' ? 'bg-green-900/20 text-green-400' :
                                                            p.status === 'failed' ? 'bg-red-900/20 text-red-400' :
                                                                'bg-yellow-900/20 text-yellow-400'
                                                        }`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.razorpayPaymentId}</td>
                                                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.razorpayOrderId}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
