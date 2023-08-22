import nodemailer from "nodemailer";

export default async (to, subject, html) => {
  // 테스트 메일(내거)임. 추후 변경 필요
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PW,
    },
    secure: true,
  });

  const option = {
    from: `[메디플랫폼] ${process.env.MAIL_ID}`,
    to: to,
    // bcc, // 숨은참조
    subject: subject,
    html: html,
  };

  const info = await transporter.sendMail(option);
  return info;
};
