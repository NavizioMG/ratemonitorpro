// src/services/email.ts
import { createWelcomeEmail } from '../lib/email-templates';

export async function testResendEmail() {
  const welcomeEmail = createWelcomeEmail('Test User', 'Test Company');
  
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        to: 'noreply@ratemonitorpro.com', 
        subject: 'Welcome to Rate Monitor Pro - Test Email',
        html: welcomeEmail,
        type: 'welcome'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Test email sent successfully:', result.emailId);
      return { success: true, emailId: result.emailId };
    } else {
      console.error('Test email failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}
