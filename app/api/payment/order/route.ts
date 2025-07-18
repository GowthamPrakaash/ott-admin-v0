import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import Razorpay from 'razorpay';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { amount = 99 } = await req.json();
    const email = session.user.email;

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
            receipt: `order_${email}_${Date.now()}`,
            payment_capture: 1,
            notes: { email },
        });
        return NextResponse.json(order);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
