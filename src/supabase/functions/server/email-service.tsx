export interface EmailNotification {
  to: string
  subject: string
  message: string
  type: 'order_received' | 'checkout_complete' | 'order_status' | 'verification_update'
}

export async function sendEmailNotification(notification: EmailNotification) {
  try {
    // In a real implementation, this would integrate with an email service
    // For now, we'll store notifications in KV store and log them
    console.log('Email Notification:', {
      to: notification.to,
      subject: notification.subject,
      type: notification.type,
      timestamp: new Date().toISOString()
    })
    
    // Store notification for admin tracking
    const notificationId = `email_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const emailRecord = {
      id: notificationId,
      ...notification,
      status: 'sent',
      sent_at: new Date().toISOString()
    }
    
    // Import kv from the same directory
    const kvModule = await import('./kv_store.tsx')
    await kvModule.set(`email_notification:${notificationId}`, emailRecord)
    
    return { success: true, id: notificationId }
  } catch (error) {
    console.error('Error sending email notification:', error)
    return { success: false, error: error.message }
  }
}

export function generateOrderReceivedEmail(orderData: any, providerData: any): EmailNotification {
  return {
    to: providerData.email,
    subject: `New Order Request - EVENTORA`,
    message: `
Dear ${providerData.business_name},

You have received a new order request on EVENTORA!

Order Details:
- Order ID: ${orderData.id}
- Event Date: ${orderData.event_date}
- Customer Message: ${orderData.message || 'No additional message'}
- Services Requested: ${orderData.service_ids.length} service(s)

Please log into your EVENTORA dashboard to review and respond to this order within 24 hours.

Best regards,
The EVENTORA Team
`,
    type: 'order_received'
  }
}

export function generateCheckoutCompleteEmail(orderData: any, buyerData: any, totalAmount: number): EmailNotification {
  return {
    to: buyerData.email,
    subject: `Payment Confirmed - EVENTORA Order #${orderData.id}`,
    message: `
Dear ${buyerData.name},

Your payment has been successfully processed for EVENTORA Order #${orderData.id}.

Payment Details:
- Amount Paid: LKR ${totalAmount.toLocaleString()}
- Event Date: ${orderData.event_date}
- Payment Method: JustPay by LankaPay
- Transaction ID: ${orderData.transaction_id}

Your luxury event experience is now confirmed! Our concierge team will reach out within 24 hours to coordinate the final details.

Best regards,
The EVENTORA Team
`,
    type: 'checkout_complete'
  }
}

export function generateProviderCheckoutEmail(orderData: any, providerData: any, providerAmount: number): EmailNotification {
  return {
    to: providerData.email,
    subject: `Payment Received - EVENTORA Order #${orderData.id}`,
    message: `
Dear ${providerData.business_name},

Great news! Payment has been confirmed for Order #${orderData.id}.

Details:
- Your Earnings: LKR ${providerAmount.toLocaleString()}
- Event Date: ${orderData.event_date}
- Payment will be transferred to your account within 2-3 business days

Please prepare for the confirmed event and contact the customer if needed through your EVENTORA dashboard.

Best regards,
The EVENTORA Team
`,
    type: 'checkout_complete'
  }
}