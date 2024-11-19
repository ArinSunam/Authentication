import nodemailer from "nodemailer"
import bcryptjs from 'bcryptjs'
import User from "@/models/userModel"

export const sendEmail = async ({ email, emailType, userId }: any) => {
  try {

    const hashedToken = await bcryptjs.hash(userId.toString(), 10)

    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(userId, {
        verifyToken: hashedToken,
        verifyTokenExpiry: Date.now() + 3600000
      })
    } else if (emailType === "RESET") {
      await User.findByIdAndUpdate(userId, {
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: Date.now() + 3600000
      })
    }

    const transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "c941a9bae5ac08", //todo: put in env
        pass: "587d2c162c71bf" //todo: put in env
      }

    });

    const mailOptions = {
      from: 'arinsunam05@gmail.com', //sender address
      to: email,//list of receivers
      subject: emailType === 'VERIFY' ? 'Verify your email' : 'Reset your password',//Subject line
      html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}"> Here </a> to ${emailType === "VERIFY" ? "Verify your  email" : "Reset your password"}
      or copy and paste the link below in your browser. 
      <br> ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
      </p>`
    }

    const mailResponse = await transport.sendMail(mailOptions)
    return mailResponse
  } catch (error: any) {
    throw new Error(error.message)
  }
}