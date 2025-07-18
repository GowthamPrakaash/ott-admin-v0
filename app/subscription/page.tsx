"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_KZI452IozzmT6r";

export default function SubscriptionPage() {
    const [loading, setLoading] = useState(false);

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
        const res = await loadRazorpayScript();
        if (!res) {
            alert("Failed to load Razorpay. Please try again.");
            setLoading(false);
            return;
        }
        // Create order on backend
        const orderRes = await fetch("/api/payment/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 99 }),
        });
        const order = await orderRes.json();
        if (!order.id) {
            alert("Failed to create order. Please try again.");
            setLoading(false);
            return;
        }
        // Open Razorpay checkout
        const options = {
            key: RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: "OTT Subscription",
            description: "Monthly Plan",
            order_id: order.id,
            handler: function (response: any) {
                // TODO: Verify payment on backend and update user subscription
                alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
            },
            prefill: {},
            theme: { color: "#6366f1" },
        };
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <h1 className="text-3xl font-bold">Subscribe</h1>
            <p className="text-lg">Get unlimited access for just ₹99/month.</p>
            <Button onClick={handleSubscribe} disabled={loading} size="lg">
                {loading ? "Processing..." : "Subscribe for ₹99/month"}
            </Button>
        </div>
    );
}
