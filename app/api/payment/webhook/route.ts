import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
        return NextResponse.json({ error: 'Webhook secret not set' }, { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

    if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'payment.captured') {
        const paymentEntity = event.payload.payment.entity;
        const email = paymentEntity.notes?.email || '';
        if (email) {
            // Set subscription for 1 month from now
            const expiry = new Date();
            expiry.setMonth(expiry.getMonth() + 1);
            const user = await prisma.user.findUnique({ where: { email } });
            if (user) {
                await prisma.user.update({
                    where: { email },
                    data: {
                        subscriptionStatus: 'active',
                        subscriptionExpiry: expiry,
                    },
                });
                // Log payment
                await prisma.payment.create({
                    data: {
                        userId: user.id,
                        razorpayOrderId: paymentEntity.order_id,
                        razorpayPaymentId: paymentEntity.id,
                        amount: paymentEntity.amount,
                        currency: paymentEntity.currency,
                        status: paymentEntity.status,
                    },
                });
            }
        }
    }

    return NextResponse.json({ status: 'ok' });
}
