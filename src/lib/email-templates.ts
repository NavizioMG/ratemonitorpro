// Email template function for welcome emails
export function createWelcomeEmail(fullName: string, companyName?: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Rate Monitor Pro</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #1e40af; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 20px;">
            RMP
          </div>
          <h1 style="color: #1e40af; margin: 0;">Welcome to Rate Monitor Pro!</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #334155; margin-top: 0;">Hi ${fullName},</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Your Rate Monitor Pro account is now active and ready to help you track mortgage rates and manage your client portfolio.
          </p>
          ${companyName ? `<p style="color: #64748b; line-height: 1.6;">We're excited to help ${companyName} streamline your rate monitoring process.</p>` : ''}
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1e40af;">What's Next?</h3>
          <ul style="color: #64748b; line-height: 1.8;">
            <li>Add your first client to start tracking rates</li>
            <li>Set target rates for rate alert notifications</li>
            <li>Explore the dashboard to see current market rates</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://ratemonitorpro.com/dashboard" 
             style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            Go to Dashboard
          </a>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; color: #94a3b8; font-size: 14px; text-align: center;">
          <p>Need help? Reply to this email or visit our <a href="https://ratemonitorpro.com/help" style="color: #1e40af;">help center</a>.</p>
          <p>Rate Monitor Pro - Streamlining mortgage rate tracking for professionals</p>
        </div>
      </body>
      </html>
    `;
  }