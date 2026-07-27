import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {

})

export class PaymentService {
  static async createPaymentIntent(amount: number, currency: string = 'pkr', metadata: Record<string, string> = {}) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents/paisa
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

  static async confirmPayment(paymentIntentId: string) {
    return stripe.paymentIntents.confirm(paymentIntentId)
  }

  static async cancelPaymentIntent(paymentIntentId: string) {
    return stripe.paymentIntents.cancel(paymentIntentId)
  }
}