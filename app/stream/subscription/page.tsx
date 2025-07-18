"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_KZI452IozzmT6r";

export default function SubscriptionPage() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (status === "loading") {
        return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>;
    }

    if (!session) {
        redirect("/stream/login");
    }

    // Load Razorpay script
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (document.getElementById("razorpay-script")) return resolve(true);
            const script = document.createElement("script");
            script.id = "razorpay-script";
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubscribe = async () => {
        setLoading(true);
        setError(null);

        const res = await loadRazorpayScript();
        if (!res) {
            setError("Failed to load Razorpay. Please try again.");
            setLoading(false);
            return;
        }

        try {
            // Create order on backend
            const orderRes = await fetch("/api/payment/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok) {
                setError(orderData.error || "Failed to create order. Please try again.");
                setLoading(false);
                return;
            }

            if (!orderData.id) {
                setError("Failed to create order. Please try again.");
                setLoading(false);
                return;
            }

            // Open Razorpay checkout
            const options = {
                key: RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "OTT Subscription",
                description: "Monthly Plan",
                order_id: orderData.id,
                handler: function (response: any) {
                    alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
                    // Redirect to profile to see updated subscription
                    window.location.href = "/stream/profile";
                },
                prefill: {
                    email: session.user?.email || ""
                },
                theme: { color: "#dc2626" },
            };
            // @ts-ignore
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container px-4 py-8">
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 max-w-md mx-auto">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold">Subscribe to Apsara</h1>
                    <p className="text-lg text-gray-300">Get unlimited access to movies, series, and exclusive content</p>

                    <div className="bg-gray-900 rounded-lg p-6 space-y-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-600">₹99</div>
                            <div className="text-sm text-gray-400">per month</div>
                        </div>

                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>✓ Unlimited movies and series</li>
                            <li>✓ 4K + HDR streaming</li>
                            <li>✓ Multiple device support</li>
                            <li>✓ Offline downloads</li>
                            <li>✓ Ad-free experience</li>
                        </ul>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <Button
                    onClick={handleSubscribe}
                    disabled={loading}
                    size="lg"
                    className="w-full bg-red-600 hover:bg-red-700"
                >
                    {loading ? "Processing..." : "Subscribe for ₹99/month"}
                </Button>

                <p className="text-xs text-gray-400 text-center">
                    You can cancel your subscription anytime from your profile.
                </p>
            </div>
        </div>
    );
}