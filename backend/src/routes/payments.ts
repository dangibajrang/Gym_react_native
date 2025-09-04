import express from 'express';
import Stripe from 'stripe';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';
import Subscription from '../models/Subscription';
import User from '../models/User';
import Notification from '../models/Notification';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const router = express.Router();

// Create payment intent for subscription
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { subscriptionId, amount, currency = 'usd' } = req.body;

    // Verify subscription exists and belongs to user
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        subscriptionId: subscription._id.toString(),
        userId: req.user._id.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      message: 'Payment intent created successfully',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Confirm payment and update subscription
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    const { subscriptionId, userId } = paymentIntent.metadata;

    // Verify the payment belongs to the current user
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized payment confirmation'
      });
    }

    // Update subscription status
    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      {
        status: 'active',
        stripePaymentIntentId: paymentIntentId,
        startDate: new Date()
      },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Create success notification
    await Notification.createNotification(
      userId,
      'Payment Successful',
      'Your subscription payment has been processed successfully!',
      'payment'
    );

    res.json({
      success: true,
      message: 'Payment confirmed and subscription activated',
      data: subscription
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create Stripe customer
router.post('/create-customer', authenticateToken, async (req, res) => {
  try {
    const { email, name } = req.body;

    const customer = await stripe.customers.create({
      email: email || req.user.email,
      name: name || `${req.user.firstName} ${req.user.lastName}`,
      metadata: {
        userId: req.user._id.toString()
      }
    });

    // Update user with Stripe customer ID
    await User.findByIdAndUpdate(req.user._id, {
      stripeCustomerId: customer.id
    });

    res.json({
      success: true,
      message: 'Stripe customer created successfully',
      data: { customerId: customer.id }
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create subscription with Stripe
router.post('/create-subscription', authenticateToken, async (req, res) => {
  try {
    const { priceId, paymentMethodId } = req.body;

    // Get or create Stripe customer
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        metadata: {
          userId: req.user._id.toString()
        }
      });
      customerId = customer.id;

      // Update user with customer ID
      await User.findByIdAndUpdate(req.user._id, {
        stripeCustomerId: customerId
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    // Cancel subscription in Stripe
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    // Update local subscription
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId },
      {
        status: 'cancelled',
        cancellationReason: 'User requested cancellation',
        cancelledAt: new Date()
      }
    );

    // Create notification
    await Notification.createNotification(
      req.user._id.toString(),
      'Subscription Cancelled',
      'Your subscription has been cancelled and will end at the current period.',
      'subscription'
    );

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get payment methods
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.stripeCustomerId;
    
    if (!customerId) {
      return res.json({
        success: true,
        message: 'No payment methods found',
        data: []
      });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    res.json({
      success: true,
      message: 'Payment methods retrieved successfully',
      data: paymentMethods.data
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add payment method
router.post('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const { paymentMethodId } = req.body;

    // Get or create Stripe customer
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        metadata: {
          userId: req.user._id.toString()
        }
      });
      customerId = customer.id;

      await User.findByIdAndUpdate(req.user._id, {
        stripeCustomerId: customerId
      });
    }

    // Attach payment method
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    res.json({
      success: true,
      message: 'Payment method added successfully',
      data: paymentMethod
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Remove payment method
router.delete('/payment-methods/:paymentMethodId', authenticateToken, async (req, res) => {
  try {
    const { paymentMethodId } = req.params;

    await stripe.paymentMethods.detach(paymentMethodId);

    res.json({
      success: true,
      message: 'Payment method removed successfully'
    });
  } catch (error) {
    console.error('Remove payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const customerId = req.user.stripeCustomerId;

    if (!customerId) {
      return res.json({
        success: true,
        message: 'No payment history found',
        data: []
      });
    }

    const charges = await stripe.charges.list({
      customer: customerId,
      limit: Number(limit),
      starting_after: page > 1 ? 'ch_' + (page - 1) * Number(limit) : undefined
    });

    res.json({
      success: true,
      message: 'Payment history retrieved successfully',
      data: charges.data
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Webhook signature verification failed');
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSuccess(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(failedInvoice);
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(deletedSubscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Webhook handlers
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { subscriptionId, userId } = paymentIntent.metadata;
  
  if (subscriptionId) {
    await Subscription.findByIdAndUpdate(subscriptionId, {
      status: 'active',
      stripePaymentIntentId: paymentIntent.id
    });

    await Notification.createNotification(
      userId,
      'Payment Successful',
      'Your payment has been processed successfully!',
      'payment'
    );
  }
}

async function handleInvoicePaymentSuccess(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: invoice.subscription },
      { status: 'active' }
    );
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: invoice.subscription },
      { status: 'past_due' }
    );

    // Notify user about failed payment
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription
    });

    if (subscription) {
      await Notification.createNotification(
        subscription.userId.toString(),
        'Payment Failed',
        'Your subscription payment failed. Please update your payment method.',
        'payment'
      );
    }
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: subscription.id },
    {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    }
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: subscription.id },
    {
      status: 'cancelled',
      cancelledAt: new Date()
    }
  );
}

export default router;
