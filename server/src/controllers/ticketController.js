const pool = require("../config/db");
const { calculateSla } = require("../services/slaService");

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
        message: "Subject and description are required"
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

    const sla = await calculateSla(priority);

    const result = await pool.query(
      `INSERT INTO tickets
       (customer_id, subject, description, category, priority,
        response_due_at, resolution_due_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.id,
        subject,
        description,
        category || null,
        priority,
        sla.responseDueAt,
        sla.resolutionDueAt
      ]
    );

    const ticket = result.rows[0];

    await pool.query(
      `INSERT INTO ticket_messages
       (ticket_id, sender_id, message)
       VALUES ($1, $2, $3)`,
      [
        ticket.id,
        req.user.id,
        description
      ]
    );

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
       JOIN users u ON t.customer_id = u.id
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
       JOIN users u ON tm.sender_id = u.id
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
      message: "Unable to fetch ticket"
    });
  }
};

const addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required"
      });
    }

    const ticketResult = await pool.query(
      `SELECT id, status
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
        message: "Resolved tickets cannot receive new replies"
      });
    }

    const result = await pool.query(
      `INSERT INTO ticket_messages
       (ticket_id, sender_id, message)
       VALUES ($1, $2, $3)
       RETURNING id, message, created_at`,
      [
        id,
        req.user.id,
        message.trim()
      ]
    );

    await pool.query(
      `UPDATE tickets
       SET updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    res.status(201).json({
      message: "Reply added successfully",
      reply: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to add reply"
    });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getTicketDetails,
  addMessage
};