import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Razorpay from 'razorpay';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { tr } from 'date-fns/locale';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const amount = 99; // Default amount for subscription
    const email = session.user.email;

    // Check if user is already subscribed
    const user = await prisma.user.findUnique({
        where: { email },
        select: { subscriptionStatus: true, subscriptionExpiry: true }
    });

    if (user?.subscriptionStatus === 'active' && user.subscriptionExpiry && user.subscriptionExpiry > new Date()) {
        return NextResponse.json({
            error: 'You already have an active subscription. Please wait until it expires before renewing.'
        }, { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        return NextResponse.json({ error: 'Razorpay keys not set' }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    try {
        const order = await razorpay.orders.create({
            amount: amount * 100, // amount in paise
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            // receipt: `order_${email}_${Date.now()}`,
            payment_capture: true,
            notes: { email },
        });
        return NextResponse.json(order);
    } catch (error: any) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
