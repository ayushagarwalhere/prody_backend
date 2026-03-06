import nodemailer from "nodemailer"

export async function sendVerificationEmail(email, token){

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    const verifyLink = `http://prody.com/verify?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your email",
        html: `<p>Click <a href="${verifyLink}">here</a> to verify your email. Link will expire in 24 hours</p>`
    };

    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending verification email:", error);
        } else {
            console.log("Verification email sent:", info.response);
        }
    });
}