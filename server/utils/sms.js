// SMS Service utility
// Supports Twilio for production SMS sending

let twilioClient = null;

// Initialize Twilio client
const initTwilio = async () => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = await import('twilio');
      const { default: Twilio } = twilio;
      twilioClient = Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      console.log('✅ Twilio initialized');
      return true;
    } catch (error) {
      console.error('❌ Twilio initialization error:', error);
      return false;
    }
  }
  return false;
};

// Send SMS via Twilio
export const sendSMS = async (phone, message) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Development mode: just log
  if (isDevelopment) {
    console.log(`📱 [DEV] SMS to ${phone}: ${message}`);
    return { success: true, mode: 'development' };
  }
  
  // Production mode: send real SMS
  if (!twilioClient) {
    if (!(await initTwilio())) {
      console.error('❌ Twilio not configured');
      return { success: false, error: 'SMS service not configured' };
    }
  }
  
  if (!process.env.TWILIO_PHONE_NUMBER) {
    console.error('❌ TWILIO_PHONE_NUMBER not set');
    return { success: false, error: 'SMS phone number not configured' };
  }
  
  try {
    const messageResult = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    
    console.log(`✅ SMS sent via Twilio: ${messageResult.sid}`);
    return { 
      success: true, 
      messageId: messageResult.sid, 
      mode: 'production' 
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP code
export const sendOTPCode = async (phone, code) => {
  const message = `Your verification code is: ${code}. Valid for 5 minutes.`;
  return await sendSMS(phone, message);
};
