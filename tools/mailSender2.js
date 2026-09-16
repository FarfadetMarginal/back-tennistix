const { BrevoClient } = require('@getbrevo/brevo');

const client = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});

async function mailSender(email, username, token) {
    if (process.env.NODE_ENV === 'test') return;

    try {
        await client.transactionalEmails.sendTransacEmail({
        to: [{ email }],
        sender: { email: 'bapt935@gmail.com', name: 'Tennistix' },
        subject: 'Password reset - forgotten password',
        textContent: `Hello ${username},

        We received a reset password request for your Tennistix account.

        Click on this link to reset your password : ${process.env.URL_WEBSITE}/reset-password/${token} !

        This link will work only for the next 10 minutes !`
        });
    } catch (error) {
        console.log('BREVO ERROR:', error.message);
        throw new Error('Failed : email did not sent');
    }
}

module.exports = mailSender;