import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export class PaymentService {
  static async createPaymentIntent(amount: number, currency: string = 'usd', metadata: Record<string, string> = {}) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  }

  static async retrievePaymentIntent(paymentIntentId: string) {
    return stripe.paymentIntents.retrieve(paymentIntentId)
  }
}