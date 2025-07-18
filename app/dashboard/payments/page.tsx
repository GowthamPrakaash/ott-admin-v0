import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Payment History",
    description: "Your subscription payment history",
};

export default async function PaymentsPage() {
    // TODO: Replace with your own session logic
    // For now, fetch the first user as a placeholder
    const user = await prisma.user.findFirst();
    if (!user) redirect("/login");
    const payments = await prisma.payment.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
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
                                    <tr>
                                        <th className="px-2 py-1 text-left">Date</th>
                                        <th className="px-2 py-1 text-left">Amount</th>
                                        <th className="px-2 py-1 text-left">Status</th>
                                        <th className="px-2 py-1 text-left">Payment ID</th>
                                        <th className="px-2 py-1 text-left">Order ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p) => (
                                        <tr key={p.id}>
                                            <td className="px-2 py-1">{p.createdAt.toLocaleString()}</td>
                                            <td className="px-2 py-1">₹{(p.amount / 100).toFixed(2)}</td>
                                            <td className="px-2 py-1">{p.status}</td>
                                            <td className="px-2 py-1">{p.razorpayPaymentId}</td>
                                            <td className="px-2 py-1">{p.razorpayOrderId}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
