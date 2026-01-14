import express from 'express';
const router = express.Router();

// Payment methods
const PAYMENT_METHODS = {
  CARD: 'card',
  PAYPAL: 'paypal',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  BANK_TRANSFER: 'bank_transfer',
  CASH_ON_DELIVERY: 'cash_on_delivery'
};

// Payment storage
let payments = new Map();
let paymentMethods = new Map();

// Get supported payment methods
router.get('/methods', (req, res) => {
  const methods = [
    {
      id: PAYMENT_METHODS.CARD,
      name: 'Credit/Debit Card',
      icon: '💳',
      enabled: true,
      fees: '2.9% + $0.30'
    },
    {
      id: PAYMENT_METHODS.PAYPAL,
      name: 'PayPal',
      icon: '🅿️',
      enabled: true,
      fees: '3.4% + $0.30'
    },
    {
      id: PAYMENT_METHODS.APPLE_PAY,
      name: 'Apple Pay',
      icon: '🍎',
      enabled: true,
      fees: '2.9% + $0.30'
    },
    {
      id: PAYMENT_METHODS.GOOGLE_PAY,
      name: 'Google Pay',
      icon: '🔵',
      enabled: true,
      fees: '2.9% + $0.30'
    },
    {
      id: PAYMENT_METHODS.CASH_ON_DELIVERY,
      name: 'Cash on Delivery',
      icon: '💵',
      enabled: true,
      fees: '$5.00 flat fee'
    }
  ];
  
  res.json({
    methods,
    total: methods.length,
    timestamp: new Date().toISOString()
  });
});

// Process payment
router.post('/process', (req, res) => {
  const { 
    orderId, 
    amount, 
    currency = 'USD', 
    paymentMethod, 
    cardDetails,
    billingAddress 
  } = req.body;
  
  if (!orderId || !amount || !paymentMethod) {
    return res.status(400).json({
      error: 'Order ID, amount, and payment method are required'
    });
  }
  
  // Simulate payment processing
  const paymentId = 'PAY_' + Date.now();
  const isSuccessful = Math.random() > 0.1; // 90% success rate
  
  const payment = {
    id: paymentId,
    orderId,
    amount: parseFloat(amount),
    currency,
    paymentMethod,
    status: isSuccessful ? 'completed' : 'failed',
    transactionId: isSuccessful ? 'TXN_' + Date.now() : null,
    failureReason: isSuccessful ? null : 'Insufficient funds',
    billingAddress,
    createdAt: new Date().toISOString(),
    completedAt: isSuccessful ? new Date().toISOString() : null
  };
  
  payments.set(paymentId, payment);
  
  const statusCode = isSuccessful ? 200 : 400;
  
  res.status(statusCode).json({
    payment,
    success: isSuccessful,
    message: isSuccessful ? 'Payment processed successfully' : 'Payment failed'
  });
});

// Get payment details
router.get('/:paymentId', (req, res) => {
  const { paymentId } = req.params;
  
  const payment = payments.get(paymentId);
  
  if (!payment) {
    return res.status(404).json({
      error: 'Payment not found',
      paymentId
    });
  }
  
  res.json({
    payment,
    timestamp: new Date().toISOString()
  });
});

// Refund payment
router.post('/:paymentId/refund', (req, res) => {
  const { paymentId } = req.params;
  const { amount, reason } = req.body;
  
  const payment = payments.get(paymentId);
  
  if (!payment) {
    return res.status(404).json({
      error: 'Payment not found',
      paymentId
    });
  }
  
  if (payment.status !== 'completed') {
    return res.status(400).json({
      error: 'Can only refund completed payments'
    });
  }
  
  const refundAmount = amount || payment.amount;
  
  if (refundAmount > payment.amount) {
    return res.status(400).json({
      error: 'Refund amount cannot exceed original payment amount'
    });
  }
  
  const refund = {
    id: 'REF_' + Date.now(),
    paymentId,
    amount: refundAmount,
    reason: reason || 'Customer request',
    status: 'completed',
    createdAt: new Date().toISOString()
  };
  
  // Update payment
  payment.refunds = payment.refunds || [];
  payment.refunds.push(refund);
  payment.refundedAmount = (payment.refundedAmount || 0) + refundAmount;
  
  payments.set(paymentId, payment);
  
  res.json({
    refund,
    payment,
    message: 'Refund processed successfully'
  });
});

// Get payment statistics
router.get('/stats/overview', (req, res) => {
  const allPayments = Array.from(payments.values());
  
  const stats = {
    totalPayments: allPayments.length,
    completedPayments: allPayments.filter(p => p.status === 'completed').length,
    failedPayments: allPayments.filter(p => p.status === 'failed').length,
    totalRevenue: allPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0),
    averageOrderValue: allPayments.length > 0 
      ? allPayments.reduce((sum, p) => sum + p.amount, 0) / allPayments.length 
      : 0,
    paymentMethodBreakdown: {
      card: allPayments.filter(p => p.paymentMethod === PAYMENT_METHODS.CARD).length,
      paypal: allPayments.filter(p => p.paymentMethod === PAYMENT_METHODS.PAYPAL).length,
      applePay: allPayments.filter(p => p.paymentMethod === PAYMENT_METHODS.APPLE_PAY).length,
      googlePay: allPayments.filter(p => p.paymentMethod === PAYMENT_METHODS.GOOGLE_PAY).length,
      cod: allPayments.filter(p => p.paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY).length
    }
  };
  
  res.json({
    stats,
    timestamp: new Date().toISOString()
  });
});

// Update payment status
router.put('/:paymentId/status', (req, res) => {
  const { paymentId } = req.params;
  const { status, reason } = req.body;
  
  const payment = payments.get(paymentId);
  
  if (!payment) {
    return res.status(404).json({
      error: 'Payment not found',
      paymentId
    });
  }
  
  const validStatuses = ['pending', 'completed', 'failed', 'cancelled', 'refunded'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: 'Invalid status',
      validStatuses
    });
  }
  
  payment.status = status;
  payment.statusReason = reason || '';
  payment.updatedAt = new Date().toISOString();
  
  if (status === 'completed') {
    payment.completedAt = new Date().toISOString();
  }
  
  payments.set(paymentId, payment);
  
  res.json({
    message: 'Payment status updated successfully',
    payment,
    timestamp: new Date().toISOString()
  });
});

// Update payment method
router.put('/methods/:methodId', (req, res) => {
  const { methodId } = req.params;
  const { name, enabled, fees, icon } = req.body;
  
  const updatedMethod = {
    id: methodId,
    name: name || 'Updated Payment Method',
    enabled: enabled !== undefined ? Boolean(enabled) : true,
    fees: fees || '2.9% + $0.30',
    icon: icon || '💳',
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    message: 'Payment method updated successfully',
    method: updatedMethod,
    timestamp: new Date().toISOString()
  });
});

// Update billing address
router.put('/:paymentId/billing', (req, res) => {
  const { paymentId } = req.params;
  const { billingAddress } = req.body;
  
  const payment = payments.get(paymentId);
  
  if (!payment) {
    return res.status(404).json({
      error: 'Payment not found',
      paymentId
    });
  }
  
  if (!billingAddress) {
    return res.status(400).json({
      error: 'Billing address is required'
    });
  }
  
  payment.billingAddress = billingAddress;
  payment.updatedAt = new Date().toISOString();
  
  payments.set(paymentId, payment);
  
  res.json({
    message: 'Billing address updated successfully',
    payment,
    timestamp: new Date().toISOString()
  });
});

// Update refund status
router.put('/:paymentId/refunds/:refundId', (req, res) => {
  const { paymentId, refundId } = req.params;
  const { status, reason } = req.body;
  
  const payment = payments.get(paymentId);
  
  if (!payment) {
    return res.status(404).json({
      error: 'Payment not found',
      paymentId
    });
  }
  
  if (!payment.refunds) {
    return res.status(404).json({
      error: 'No refunds found for this payment'
    });
  }
  
  const refundIndex = payment.refunds.findIndex(r => r.id === refundId);
  
  if (refundIndex === -1) {
    return res.status(404).json({
      error: 'Refund not found',
      refundId
    });
  }
  
  const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
  
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      error: 'Invalid refund status',
      validStatuses
    });
  }
  
  if (status) payment.refunds[refundIndex].status = status;
  if (reason) payment.refunds[refundIndex].reason = reason;
  payment.refunds[refundIndex].updatedAt = new Date().toISOString();
  
  payments.set(paymentId, payment);
  
  res.json({
    message: 'Refund updated successfully',
    refund: payment.refunds[refundIndex],
    payment,
    timestamp: new Date().toISOString()
  });
});

// Cancel/Delete payment
router.delete('/:paymentId', (req, res) => {
  const { paymentId } = req.params;
  const { reason } = req.body;
  
  const payment = payments.get(paymentId);
  
  if (!payment) {
    return res.status(404).json({
      error: 'Payment not found',
      paymentId
    });
  }
  
  if (payment.status === 'completed') {
    return res.status(400).json({
      error: 'Cannot delete completed payment. Use refund instead.'
    });
  }
  
  // Mark payment as cancelled
  payment.status = 'cancelled';
  payment.cancelledAt = new Date().toISOString();
  payment.cancellationReason = reason || 'Payment cancelled';
  
  payments.set(paymentId, payment);
  
  res.json({
    message: 'Payment cancelled successfully',
    payment,
    timestamp: new Date().toISOString()
  });
});

// Delete payment method
router.delete('/methods/:methodId', (req, res) => {
  const { methodId } = req.params;
  
  const deletedMethod = {
    id: methodId,
    deletedAt: new Date().toISOString(),
    status: 'removed'
  };
  
  res.json({
    message: 'Payment method removed successfully',
    method: deletedMethod,
    timestamp: new Date().toISOString()
  });
});

// Delete refund record
router.delete('/:paymentId/refunds/:refundId', (req, res) => {
  const { paymentId, refundId } = req.params;
  
  const payment = payments.get(paymentId);
  
  if (!payment) {
    return res.status(404).json({
      error: 'Payment not found',
      paymentId
    });
  }
  
  if (!payment.refunds) {
    return res.status(404).json({
      error: 'No refunds found for this payment'
    });
  }
  
  const refundIndex = payment.refunds.findIndex(r => r.id === refundId);
  
  if (refundIndex === -1) {
    return res.status(404).json({
      error: 'Refund not found',
      refundId
    });
  }
  
  const deletedRefund = payment.refunds.splice(refundIndex, 1)[0];
  
  // Update refunded amount
  payment.refundedAmount = (payment.refundedAmount || 0) - deletedRefund.amount;
  
  payments.set(paymentId, payment);
  
  res.json({
    message: 'Refund record deleted successfully',
    deletedRefund,
    payment,
    timestamp: new Date().toISOString()
  });
});

export default router;