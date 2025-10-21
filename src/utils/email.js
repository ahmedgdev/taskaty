import sgMail from '@sendgrid/mail';
import '../config/loadEnv.js';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class Email {
  static async send(options) {
    const { to, subject, templateId, dynamic_template_data } = options;

    if (!to || !subject || !templateId) {
      throw new Error(
        'Missing required email parameters: to, subject, or templateId',
      );
    }

    const senderEmail = process.env.SENDGRID_SENDER_EMAIL;
    const senderName = process.env.SENDGRID_SENDER_NAME;

    if (!senderEmail) {
      throw new Error('SENDGRID_SENDER_EMAIL is not configured');
    }

    try {
      const data = {
        from: {
          email: senderEmail,
          name: senderName || 'Taskaty',
        },
        to,
        subject,
        templateId,
        dynamic_template_data: dynamic_template_data || {},
      };
      const response = await sgMail.send(data);

      console.log(
        `Email sent successfully to ${to} (Status: ${response[0].statusCode})`,
      );
      return { success: true, statusCode: response[0].statusCode };
    } catch (err) {
      console.error(
        `Failed to send email with subject: "${options.subject}" to "${to}":`,
        err.message,
      );

      // Don't throw in production - let the app continue
      // Log the error for monitoring/debugging
      if (err.response) {
        console.error('SendGrid error details:', err.response.body);
      }

      return { success: false, error: err };
    }
  }

  static async sendWelcome({ recipientName, recipientEmail }) {
    if (!recipientName || !recipientEmail) {
      throw new Error('userName and to email are required');
    }

    const options = {
      to: recipientEmail,
      subject: 'Welcome to Taskaty',
      templateId: process.env.SENDGRID_WELCOME_TEMPLATE_ID,
      dynamic_template_data: {
        userName: recipientName,
      },
    };

    return await this.send(options);
  }

  static async sendPasswordReset({ recipientName, resetUrl, recipientEmail }) {
    if (!recipientName || !resetUrl || !recipientEmail) {
      throw new Error('userName, resetUrl and to email are required');
    }

    const options = {
      to: recipientEmail,
      subject: 'Reset Your Taskaty Password',
      templateId: process.env.SENDGRID_RESET_PASSWORD_TEMPLATE_ID,
      dynamic_template_data: {
        userName: recipientName,
        resetUrl,
      },
    };
    return await this.send(options);
  }
}

export default Email;
