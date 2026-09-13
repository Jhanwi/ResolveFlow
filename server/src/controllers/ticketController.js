const pool = require("../config/db");

const {
  calculateSla
} = require("../services/slaService");

const {
  createNotification
} = require("../services/notificationService");

const {
  sendNewTicketEmail,
  sendAgentReplyEmail
} = require("../services/emailService");

const createTicket = async (req, res) => {
  try {
    const {
      subject,
      description,
      category,
      priority = "medium"
    } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        message:
          "Subject and description are required"
      });
    }

    const allowedPriorities = [
      "low",
      "medium",
      "high",
      "critical"
    ];

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority"
      });
    }

    const {
      responseDueAt,
      resolutionDueAt
    } = await calculateSla(priority);

    const result = await pool.query(
      `INSERT INTO tickets
       (
         customer_id,
         subject,
         description,
         category,
         priority,
         response_due_at,
         resolution_due_at
       )
       VALUES
       ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.id,
        subject.trim(),
        description.trim(),
        category || null,
        priority,
        responseDueAt,
        resolutionDueAt
      ]
    );

    const ticket = result.rows[0];

    if (req.file) {
      const attachmentUrl =
        `/uploads/${req.file.filename}`;

      await pool.query(
        `INSERT INTO ticket_messages
         (ticket_id, sender_id, message, attachment_url)
         VALUES ($1, $2, $3, $4)`,
        [
          ticket.id,
          req.user.id,
          "Attachment added with ticket",
          attachmentUrl
        ]
      );
    }

    const agentsResult = await pool.query(
      `SELECT
        id,
        email
       FROM users
       WHERE role IN ('agent', 'admin')`
    );

    for (const user of agentsResult.rows) {
      await createNotification(
        user.id,
        `New ticket #${ticket.id} was created: ${ticket.subject}`,
        ticket.id
      );

      await sendNewTicketEmail(
        user.email,
        ticket
      );
    }

    res.status(201).json({
      message: "Ticket created successfully",
      ticket
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to create ticket"
    });
  }
};

const getMyTickets = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        subject,
        category,
        priority,
        status,
        response_due_at,
        resolution_due_at,
        created_at,
        updated_at
       FROM tickets
       WHERE customer_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      tickets: result.rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to fetch tickets"
    });
  }
};

const getTicketDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const ticketResult = await pool.query(
      `SELECT
        t.*,
        u.name AS customer_name,
        u.email AS customer_email
       FROM tickets t
       JOIN users u
         ON t.customer_id = u.id
       WHERE t.id = $1
       AND t.customer_id = $2`,
      [id, req.user.id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    const messageResult = await pool.query(
      `SELECT
        tm.id,
        tm.message,
        tm.attachment_url,
        tm.created_at,
        u.name AS sender_name,
        u.role AS sender_role
       FROM ticket_messages tm
       JOIN users u
         ON tm.sender_id = u.id
       WHERE tm.ticket_id = $1
       ORDER BY tm.created_at ASC`,
      [id]
    );

    res.json({
      ticket: ticketResult.rows[0],
      messages: messageResult.rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Unable to fetch ticket details"
    });
  }
};

const addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (
      (!message || !message.trim()) &&
      !req.file
    ) {
      return res.status(400).json({
        message:
          "Message or attachment is required"
      });
    }

    const ticketResult = await pool.query(
      `SELECT
        id,
        status,
        assigned_agent_id,
        subject
       FROM tickets
       WHERE id = $1
       AND customer_id = $2`,
      [id, req.user.id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    const ticket = ticketResult.rows[0];

    if (ticket.status === "resolved") {
      return res.status(400).json({
        message:
          "You cannot reply to a resolved ticket"
      });
    }

    let attachmentUrl = null;

    if (req.file) {
      attachmentUrl =
        `/uploads/${req.file.filename}`;
    }

    const messageText =
      message?.trim() ||
      "Attachment added";

    const result = await pool.query(
      `INSERT INTO ticket_messages
       (
         ticket_id,
         sender_id,
         message,
         attachment_url
       )
       VALUES ($1, $2, $3, $4)
       RETURNING
         id,
         message,
         attachment_url,
         created_at`,
      [
        id,
        req.user.id,
        messageText,
        attachmentUrl
      ]
    );

    if (ticket.assigned_agent_id) {
      await createNotification(
        ticket.assigned_agent_id,
        `Customer replied to ticket #${id}: ${ticket.subject}`,
        Number(id)
      );

      const agentResult = await pool.query(
        `SELECT email
         FROM users
         WHERE id = $1`,
        [ticket.assigned_agent_id]
      );

      if (agentResult.rows.length > 0) {
        await sendAgentReplyEmail(
          agentResult.rows[0].email,
          ticket
        );
      }
    }

    await pool.query(
      `UPDATE tickets
       SET status = 'waiting_for_customer',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    res.status(201).json({
      message: "Message added successfully",
      ticketMessage: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to add message"
    });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getTicketDetails,
  addMessage
};