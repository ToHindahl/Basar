import nodemailer from "nodemailer";
import path from "path";

/**
 * sendEmail
 * @param {String} from - Email address of the sender
 * @param {Array} to - Array of receipents email address
 * @param {String} subject - Subject of the email
 * @param {String} text - Email body
 */
export async function sendEmail(from: string, to: string, subject: string, html: string) {
  try {
    // Create a transporter
    let transporter = nodemailer.createTransport({
      //@ts-ignore
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      //secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: from, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      html: html, // plain text body
      attachments: [{
        path: "Praktische Hinweise für Basar Feb 2024.pdf"
      }, {
        path: "Abgabezettel für Basar Feb 2024.pdf"
      }]
    });
    return `Message sent: ${info.messageId}`;
  } catch (error) {
    console.error(error);
  }
};
