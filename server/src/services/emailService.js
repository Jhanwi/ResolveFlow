const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async (
  to,
  subject,
  text
) => {
  if (!to) {
    return;
  }

  try {
    await transporter.sendMail({
      from: `"ResolveFlow" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(
      "Email sending failed:",
      error.message
    );
  }
};

const sendNewTicketEmail = async (
  to,
  ticket
) => {
  await sendEmail(
    to,
    `New Ticket #${ticket.id} Created`,
    `A new support ticket has been created.

Ticket: #${ticket.id}
Subject: ${ticket.subject}
Priority: ${ticket.priority}
Category: ${ticket.category || "Not specified"}

Please check ResolveFlow for more details.`
  );
};

const sendAgentReplyEmail = async (
  to,
  ticket
) => {
  await sendEmail(
    to,
    `New Reply on Ticket #${ticket.id}`,
    `The support team has replied to your ticket.

Ticket: #${ticket.id}
Subject: ${ticket.subject}

Please log in to ResolveFlow to view the reply.`
  );
};

const sendTicketResolvedEmail = async (
  to,
  ticket
) => {
  await sendEmail(
    to,
    `Ticket #${ticket.id} Resolved`,
    `Your support ticket has been resolved.

Ticket: #${ticket.id}
Subject: ${ticket.subject}

If you are satisfied with the support, you can leave a review from your ResolveFlow account.`
  );
};

const sendTicketEscalatedEmail = async (
  to,
  ticket
) => {
  await sendEmail(
    to,
    `Ticket #${ticket.id} Escalated`,
    `A support ticket has been escalated.

Ticket: #${ticket.id}
Subject: ${ticket.subject}
Priority: Critical

Please check ResolveFlow for more details.`
  );
};

module.exports = {
  sendEmail,
  sendNewTicketEmail,
  sendAgentReplyEmail,
  sendTicketResolvedEmail,
  sendTicketEscalatedEmail
};