const pool = require("../config/db");

const {
  createNotification
} = require("../services/notificationService");

const getDashboard = async (req, res) => {
  try {
    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM tickets"
    );

    const openResult = await pool.query(
      `SELECT COUNT(*)
       FROM tickets
       WHERE status != 'resolved'`
    );

    const resolvedResult = await pool.query(
      `SELECT COUNT(*)
       FROM tickets
       WHERE status = 'resolved'`
    );

    const slaResult = await pool.query(
      `SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (
          WHERE
            (response_due_at IS NULL OR response_due_at >= CURRENT_TIMESTAMP)
            AND
            (resolution_due_at IS NULL OR resolution_due_at >= CURRENT_TIMESTAMP)
        ) AS within_sla
       FROM tickets`
    );

    const categoryResult = await pool.query(
      `SELECT
        COALESCE(category, 'Uncategorized') AS category,
        COUNT(*) AS count
       FROM tickets
       GROUP BY category
       ORDER BY count DESC`
    );

    const priorityResult = await pool.query(
      `SELECT
        priority,
        COUNT(*) AS count
       FROM tickets
       GROUP BY priority
       ORDER BY count DESC`
    );

    const volumeResult = await pool.query(
      `SELECT
        DATE(created_at) AS date,
        COUNT(*) AS count
       FROM tickets
       WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date`
    );

    const recentResult = await pool.query(
      `SELECT
        t.id,
        t.subject,
        t.priority,
        t.status,
        t.created_at,
        customer.name AS customer_name,
        agent.name AS agent_name
       FROM tickets t
       JOIN users customer
         ON t.customer_id = customer.id
       LEFT JOIN users agent
         ON t.assigned_agent_id = agent.id
       ORDER BY t.created_at DESC
       LIMIT 10`
    );

    const totalTickets =
      Number(totalResult.rows[0].count);

    const withinSla =
      Number(slaResult.rows[0].within_sla);

    const slaCompliance =
      totalTickets > 0
        ? Math.round(
            (withinSla / totalTickets) * 100
          )
        : 0;

    res.json({
      stats: {
        totalTickets,
        openTickets:
          Number(openResult.rows[0].count),
        resolvedTickets:
          Number(resolvedResult.rows[0].count),
        slaCompliance
      },

      categoryData:
        categoryResult.rows,

      priorityData:
        priorityResult.rows,

      volumeData:
        volumeResult.rows,

      recentTickets:
        recentResult.rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to load admin dashboard"
    });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      priority = "",
      agentId = ""
    } = req.query;

    const values = [];
    const conditions = [];

    if (search.trim()) {
      values.push(`%${search.trim()}%`);

      conditions.push(
        `(t.subject ILIKE $${values.length}
          OR customer.name ILIKE $${values.length}
          OR customer.email ILIKE $${values.length})`
      );
    }

    if (status) {
      values.push(status);

      conditions.push(
        `t.status = $${values.length}`
      );
    }

    if (priority) {
      values.push(priority);

      conditions.push(
        `t.priority = $${values.length}`
      );
    }

    if (agentId) {
      values.push(agentId);

      conditions.push(
        `t.assigned_agent_id = $${values.length}`
      );
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

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
        customer.id AS customer_id,
        customer.name AS customer_name,
        customer.email AS customer_email,
        agent.id AS agent_id,
        agent.name AS agent_name,
        agent.email AS agent_email
       FROM tickets t
       JOIN users customer
         ON t.customer_id = customer.id
       LEFT JOIN users agent
         ON t.assigned_agent_id = agent.id
       ${whereClause}
       ORDER BY t.created_at DESC`,
      values
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

const getAgents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        name,
        email
       FROM users
       WHERE role = 'agent'
       ORDER BY name ASC`
    );

    res.json({
      agents: result.rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to fetch agents"
    });
  }
};

const getCustomers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        name,
        email,
        created_at
       FROM users
       WHERE role = 'customer'
       ORDER BY created_at DESC`
    );

    res.json({
      customers: result.rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to fetch customers"
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
      `SELECT
        id,
        name,
        email
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

    const ticketResult = await pool.query(
      `SELECT
        id,
        subject,
        customer_id,
        assigned_agent_id,
        status
       FROM tickets
       WHERE id = $1`,
      [id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    const ticket =
      ticketResult.rows[0];

    const agent =
      agentResult.rows[0];

    const result = await pool.query(
      `UPDATE tickets
       SET
         assigned_agent_id = $1,
         status = CASE
           WHEN status = 'resolved'
           THEN status
           ELSE 'assigned'
         END,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [
        agentId,
        id
      ]
    );

    await createNotification(
      agent.id,
      `Ticket #${id} has been assigned to you: ${ticket.subject}`,
      Number(id)
    );

    res.json({
      message: "Ticket assigned successfully",
      ticket: result.rows[0],
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to assign ticket"
    });
  }
};

const getSlaBreaches = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        t.id,
        t.subject,
        t.priority,
        t.status,
        t.response_due_at,
        t.resolution_due_at,
        customer.name AS customer_name,
        agent.name AS agent_name
       FROM tickets t
       JOIN users customer
         ON t.customer_id = customer.id
       LEFT JOIN users agent
         ON t.assigned_agent_id = agent.id
       WHERE t.status != 'resolved'
       AND (
         t.response_due_at < CURRENT_TIMESTAMP
         OR t.resolution_due_at < CURRENT_TIMESTAMP
       )
       ORDER BY t.created_at ASC`
    );

    res.json({
      tickets: result.rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to fetch SLA breaches"
    });
  }
};

const getSlaPolicies = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        priority,
        response_minutes,
        resolution_minutes
       FROM sla_policies
       ORDER BY
         CASE priority
           WHEN 'critical' THEN 1
           WHEN 'high' THEN 2
           WHEN 'medium' THEN 3
           WHEN 'low' THEN 4
         END`
    );

    res.json({
      policies: result.rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to fetch SLA policies"
    });
  }
};

const createSlaPolicy = async (req, res) => {
  try {
    const {
      priority,
      responseMinutes,
      resolutionMinutes
    } = req.body;

    if (
      !priority ||
      !responseMinutes ||
      !resolutionMinutes
    ) {
      return res.status(400).json({
        message:
          "Priority, response time and resolution time are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO sla_policies
       (
         priority,
         response_minutes,
         resolution_minutes
       )
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        priority,
        responseMinutes,
        resolutionMinutes
      ]
    );

    res.status(201).json({
      message: "SLA policy created",
      policy: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to create SLA policy"
    });
  }
};

const updateSlaPolicy = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      priority,
      responseMinutes,
      resolutionMinutes
    } = req.body;

    if (
      !priority ||
      !responseMinutes ||
      !resolutionMinutes
    ) {
      return res.status(400).json({
        message:
          "Priority, response time and resolution time are required"
      });
    }

    const result = await pool.query(
      `UPDATE sla_policies
       SET
         priority = $1,
         response_minutes = $2,
         resolution_minutes = $3
       WHERE id = $4
       RETURNING *`,
      [
        priority,
        responseMinutes,
        resolutionMinutes,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "SLA policy not found"
      });
    }

    res.json({
      message: "SLA policy updated",
      policy: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to update SLA policy"
    });
  }
};

module.exports = {
  getDashboard,
  getAllTickets,
  getAgents,
  getCustomers,
  assignTicket,
  getSlaBreaches,
  getSlaPolicies,
  createSlaPolicy,
  updateSlaPolicy
};