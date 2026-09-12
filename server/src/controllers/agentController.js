const pool = require("../config/db");
const {
  createNotification
} = require("../services/notificationService");

const getAgentTickets = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        t.id,
        t.subject,
        t.category,
        t.priority,
        t.status,
        t.response_due_at,
        t.resolution_due_at,
        t.created_at,
        t.updated_at,
        u.name AS customer_name,
        u.email AS customer_email
       FROM tickets t
       JOIN users u ON t.customer_id = u.id
       WHERE t.assigned_agent_id = $1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    res.json({
      tickets: result.rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to fetch assigned tickets"
    });
  }
};

const getAgentTicketDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const ticketResult = await pool.query(
      `SELECT
        t.*,
        customer.name AS customer_name,
        customer.email AS customer_email,
        agent.name AS agent_name
       FROM tickets t
       JOIN users customer
         ON t.customer_id = customer.id
       LEFT JOIN users agent
         ON t.assigned_agent_id = agent.id
       WHERE t.id = $1`,
      [id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    const ticket = ticketResult.rows[0];

    if (
      ticket.assigned_agent_id !== req.user.id
    ) {
      return res.status(403).json({
        message: "This ticket is not assigned to you"
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
      ticket,
      messages: messageResult.rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to fetch ticket details"
    });
  }
};

const replyToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required"
      });
    }

    const ticketResult = await pool.query(
     `SELECT
      id,
      status,
      customer_id,
      subject
      FROM tickets
      WHERE id = $1
      AND assigned_agent_id = $3`,
      [id, req.user.id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        message: "Ticket not found or not assigned to you"
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
       SET status = 'in_progress',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    await createNotification(
     ticketResult.rows[0].customer_id,
     `Agent replied to ticket #${id}: ${ticketResult.rows[0].subject}`,
     Number(id)
    );

    res.status(201).json({
      message: "Reply added successfully",
      reply: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to send reply"
    });
  }
};

const addInternalNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Note is required"
      });
    }

    const ticketResult = await pool.query(
      `SELECT id
       FROM tickets
       WHERE id = $1
       AND assigned_agent_id = $2`,
      [id, req.user.id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        message: "Ticket not found or not assigned to you"
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
        `[Internal Note] ${message.trim()}`
      ]
    );

    res.status(201).json({
      message: "Internal note added",
      note: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to add internal note"
    });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "open",
      "assigned",
      "in_progress",
      "waiting_for_customer",
      "resolved"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    const result = await pool.query(
      `UPDATE tickets
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       AND assigned_agent_id = $3
       RETURNING *`,
      [
        status,
        id,
        req.user.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Ticket not found or not assigned to you"
      });
    }

    if (status === "resolved") {
      await createNotification(
        result.rows[0].customer_id,
       `Ticket #${id} has been resolved`,
       Number(id)
     );
    }

    res.json({
      message: "Ticket status updated",
      ticket: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to update ticket status"
    });
  }
};

const updateTicketPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

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

    const result = await pool.query(
      `UPDATE tickets
       SET priority = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       AND assigned_agent_id = $3
       RETURNING *`,
      [
        priority,
        id,
        req.user.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Ticket not found or not assigned to you"
      });
    }

    res.json({
      message: "Ticket priority updated",
      ticket: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to update ticket priority"
    });
  }
};

const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({
        message: "Agent ID is required"
      });
    }

    const agentResult = await pool.query(
      `SELECT id, name, email, role
       FROM users
       WHERE id = $1
       AND role = 'agent'`,
      [agentId]
    );

    if (agentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Agent not found"
      });
    }

    const result = await pool.query(
      `UPDATE tickets
       SET assigned_agent_id = $1,
           status = 'assigned',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [
        agentId,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    await createNotification(
     agentId,
     `Ticket #${id} has been assigned to you`,
     Number(id)
    );

    res.json({
      message: "Ticket assigned successfully",
      ticket: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to assign ticket"
    });
  }
};

const escalateTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE tickets
       SET priority = 'critical',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       AND assigned_agent_id = $2
       RETURNING *`,
      [
        id,
        req.user.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Ticket not found or not assigned to you"
      });
    }

    const adminsResult = await pool.query(
     `SELECT id
      FROM users
      WHERE role = 'admin'`
    );

    for (const admin of adminsResult.rows) {
     await createNotification(
       admin.id,
       `Ticket #${id} has been escalated to critical priority`,
       Number(id)
      );
    }

    res.json({
      message: "Ticket escalated successfully",
      ticket: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to escalate ticket"
    });
  }
};

module.exports = {
  getAgentTickets,
  getAgentTicketDetails,
  replyToTicket,
  addInternalNote,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  escalateTicket
};