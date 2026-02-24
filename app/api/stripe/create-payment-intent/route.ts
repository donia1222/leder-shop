import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20'
  })
  try {
    const { amount, currency, orderData } = await req.json()

    // Validar que el monto sea válido
    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Validar que orderData tenga la información necesaria
    if (!orderData || !orderData.customerInfo || !orderData.customerInfo.email) {
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      )
    }

    // Crear el Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Ya viene en centavos desde el frontend
      currency: currency || 'chf',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: orderData.orderId || 'unknown',
        customerEmail: orderData.customerInfo.email,
        customerName: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
        items: JSON.stringify(orderData.cart?.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })) || [])
      },
      description: `FEUER KÖNIGREICH Order - ${orderData.customerInfo.email}`,
      receipt_email: orderData.customerInfo.email,
      shipping: {
        address: {
          line1: orderData.customerInfo.address,
          city: orderData.customerInfo.city,
          postal_code: orderData.customerInfo.postalCode,
          country: 'CH',
        },
        name: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
      },
    })

    console.log('🔷 Stripe Payment Intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customer: orderData.customerInfo.email
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret
    })
  } catch (error: any) {
    console.error('❌ Stripe Payment Intent creation failed:', error)
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}