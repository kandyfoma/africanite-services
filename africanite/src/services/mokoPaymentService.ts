/**
 * Moko Payment Service - Web Version
 * Integrates with Africanite Payment Hub (Railway + FreshPay PayDRC API)
 */

// Payment Hub Configuration - Use Railway endpoint
const PAYMENT_API_URL = 'https://web-production-a4586.up.railway.app/initiate-payment';
const PAYMENT_STATUS_URL = 'https://web-production-a4586.up.railway.app/payment-status';

export type MobileMoneyProvider = 'mpesa' | 'airtel' | 'orange' | 'afrimoney';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface PaymentRequest {
  amount: number;
  phoneNumber: string;
  userId?: string;
  currency?: 'USD' | 'CDF';
  userInfo?: {
    firstname?: string;
    lastname?: string;
    email?: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  transaction_id: string;
  message: string;
  instructions?: string;
}

/**
 * Detect mobile money provider from phone number
 */
export const detectProvider = (phoneNumber: string): MobileMoneyProvider | null => {
  const cleaned = phoneNumber.replace(/[\s\-+]/g, '');
  const prefix = cleaned.substring(3, 5);
  
  if (['81', '82', '83'].includes(prefix)) return 'mpesa';
  if (['84', '85', '86', '89', '90', '91', '97', '99'].includes(prefix)) return 'airtel';
  if (prefix === '80') return 'orange';
  if (prefix === '98') return 'afrimoney';
  
  return null;
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phoneNumber: string): {valid: boolean; message?: string} => {
  const cleaned = phoneNumber.replace(/[\s\-+]/g, '');
  
  if (!/^243[0-9]{9}$/.test(cleaned)) {
    return {
      valid: false,
      message: 'Le numéro doit commencer par 243 et contenir 12 chiffres (ex: 243828812498)'
    };
  }
  
  const provider = detectProvider(cleaned);
  if (!provider) {
    return {
      valid: false,
      message: 'Opérateur non reconnu. Utilisez Vodacom, Airtel, Orange ou Africell.'
    };
  }
  
  return {valid: true};
};

/**
 * Get provider display name
 */
export const getProviderName = (provider: MobileMoneyProvider): string => {
  const names = {
    mpesa: 'Vodacom M-Pesa',
    airtel: 'Airtel Money',
    orange: 'Orange Money',
    afrimoney: 'Africell Money'
  };
  return names[provider] || 'Mobile Money';
};

/**
 * Initiate a payment through the Payment Hub
 */
export const initiatePayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  try {
    const validation = validatePhoneNumber(request.phoneNumber);
    if (!validation.valid) {
      throw new Error(validation.message);
    }
    
    const cleanedPhone = request.phoneNumber.replace(/[\s\-+]/g, '');
    const provider = detectProvider(cleanedPhone);
    
    if (!provider) {
      throw new Error('Impossible de détecter le fournisseur mobile money. Vérifiez votre numéro.');
    }
    
    // Format phone number for FreshPay (remove 243 prefix, starts with 0)
    const freshpayPhone = '0' + cleanedPhone.substring(3);
    
    console.log('🔄 Initiating payment:', {
      api: PAYMENT_API_URL,
      amount: request.amount,
      phone: cleanedPhone,
      freshpayPhone: freshpayPhone,
      provider: provider,
      currency: request.currency || 'USD'
    });
    
    const response = await fetch(PAYMENT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_name: 'AfricaniteServices',
        user_id: request.userId || 'guest_' + Date.now(),
        amount: request.amount,
        phone_number: freshpayPhone,
        currency: request.currency || 'USD',
        firstname: request.userInfo?.firstname || 'Africanite',
        lastname: request.userInfo?.lastname || 'Service',
        email: request.userInfo?.email || 'foma.kandy@gmail.com',
        method: provider,
        description: 'QR Code Generation - Africanite Services'
      })
    });

    const data = await response.json();
    console.log('📥 Payment API response:', data);
    
    if (!response.ok) {
      console.error('❌ Payment API error:', data);
      
      // Handle specific error cases
      if (data.error && data.error.includes('Failed to create transaction')) {
        throw new Error('Le service de paiement est temporairement indisponible. Veuillez réessayer dans quelques instants.');
      }
      
      throw new Error(data.error || data.message || 'Échec de l\'initiation du paiement');
    }

    const txId = data.transaction_id || data.reference;
    
    if (!txId) {
      console.error('❌ No transaction ID in response:', data);
      throw new Error('Transaction ID manquant dans la réponse');
    }
    
    return {
      success: true,
      transaction_id: txId,
      message: data.message || 'Payment initiated successfully',
      instructions: data.instructions || 'Vérifiez votre téléphone et entrez votre code PIN.'
    };
  } catch (error: any) {
    console.error('❌ Payment initiation failed:', error);
    
    // Network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erreur de connexion. Vérifiez votre connexion internet.');
    }
    
    throw new Error(error.message || 'Erreur lors de l\'initiation du paiement');
  }
};

/**
 * Get payment status from Railway's status endpoint
 */
export const getPaymentStatus = async (transactionId: string): Promise<{
  status: PaymentStatus;
  details: any;
} | null> => {
  try {
    const url = `${PAYMENT_STATUS_URL}/${transactionId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    return {
      status: data.status as PaymentStatus,
      details: data
    };
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return null;
  }
};

/**
 * Poll payment status until resolved
 */
export const pollPaymentStatus = (
  transactionId: string,
  onStatusChange: (status: PaymentStatus, details?: any) => void,
  onProgressUpdate?: (message: string) => void
): (() => void) => {
  let pollInterval: NodeJS.Timeout | null = null;
  let isResolved = false;
  let pollCount = 0;
  const maxPolls = 120; // 10 minutes

  const getProgressMessage = (count: number): string => {
    const seconds = count * 5;
    if (seconds < 10) return '📱 Vérifiez votre téléphone...';
    if (seconds < 20) return '🔐 Entrez votre code PIN...';
    if (seconds < 35) return '⏳ En attente de confirmation...';
    if (seconds < 50) return '🔄 Traitement en cours...';
    if (seconds < 70) return '📡 Communication avec l\'opérateur...';
    return '✅ Finalisation...';
  };

  const startPolling = () => {
    pollInterval = setInterval(async () => {
      if (isResolved) return;
      
      pollCount++;
      
      if (onProgressUpdate) {
        onProgressUpdate(getProgressMessage(pollCount));
      }
      
      if (pollCount >= maxPolls) {
        isResolved = true;
        onStatusChange('FAILED', { error: 'Timeout - paiement non confirmé' });
        if (pollInterval) clearInterval(pollInterval);
        return;
      }
      
      try {
        const result = await getPaymentStatus(transactionId);
        
        if (result && result.status !== 'PENDING') {
          isResolved = true;
          onStatusChange(result.status, result.details);
          if (pollInterval) clearInterval(pollInterval);
        }
      } catch (error) {
        // Continue polling
      }
    }, 5000);
  };
  
  setTimeout(startPolling, 2000);

  return () => {
    isResolved = true;
    if (pollInterval) clearInterval(pollInterval);
  };
};

export const mokoPaymentService = {
  initiatePayment,
  getPaymentStatus,
  pollPaymentStatus,
  detectProvider,
  validatePhoneNumber,
  getProviderName
};
