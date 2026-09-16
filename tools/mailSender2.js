const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function mailSender(email, username, token) {
    try {
        const { data, error } = await resend.emails.send({
            from: `Tennistix <onboarding@resend.dev>`,
            to: email,
            subject: "Password reset - forgotten password",
            text: `Hello ${username},
            We received a reset password request for your Tennistix account.
            Click on this link to reset your password : ${process.env.URL_WEBSITE}/reset-password/${token} !
            This link will work only for the next 10 minutes !`,
        });
        if (error) throw new Error('Failed : email did not sent');
        return data;

    } catch (error) {
        console.log(error);
        console.log('MAIL ERROR DETAILS:', JSON.stringify(error, null, 2));
        console.log('MAIL ERROR MESSAGE:', error.message);
        console.log('MAIL ERROR CODE:', error.code);
        throw new Error("Failed : email did not sent");
    }
}

module.exports = mailSender;