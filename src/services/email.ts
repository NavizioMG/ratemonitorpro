// src/services/email.ts
import { createWelcomeEmail } from '../lib/email-templates';

export async function sendWelcomeEmail(userEmail: string, fullName: string, companyName?: string) {
  const welcomeEmail = createWelcomeEmail(fullName, companyName);
  
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        to: userEmail, // Dynamic user email
        subject: 'Welcome to Rate Monitor Pro!',
        html: welcomeEmail,
        type: 'welcome'
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}