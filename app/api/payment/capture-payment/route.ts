import { NextResponse } from 'next/server';
import RazorpayObject from '../../../../lib/razorpay';

export async function POST(request: any) {
  const { paymentId, amount } = await request.json();
  try {
    const payment = await RazorpayObject.payments.capture(
      paymentId,
      amount * 100
    );
    return NextResponse.json(payment);
  } catch (error) {
    // console.log('----here', error);
    return NextResponse.json(
      { error: 'Error capturing payment' },
      { status: 500 }
    );
  }
}
