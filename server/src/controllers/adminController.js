const pool = require("../config/db");

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

    const agentResult = await pool.query(
      `SELECT COUNT(*)
       FROM users
       WHERE role = 'agent'`
    );

    const customerResult = await pool.query(
      `SELECT COUNT(*)
       FROM users
       WHERE role = 'customer'`
    );

    const slaResult = await pool.query(
      `SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (
          WHERE status = 'resolved'
          AND updated_at <= resolution_due_at
        ) AS within_sla
       FROM tickets
       WHERE status = 'resolved'
       AND resolution_due_at IS NOT NULL`
    );

    const totalTickets = Number(
      totalResult.rows[0].count
    );

    const resolvedTickets = Number(
      resolvedResult.rows[0].count
    );

    const withinSla = Number(
      slaResult.rows[0].within_sla
    );

    const slaCompliance =
      resolvedTickets > 0
        ? Number(
            ((withinSla / resolvedTickets) * 100).toFixed(2)
          )
        : 0;

    res.json({
      stats: {
        totalTickets,
        openTickets: Number(openResult.rows[0].count),
        resolvedTickets,
        agents: Number(agentResult.rows[0].count),
        customers: Number(customerResult.rows[0].count),
        slaCompliance
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to fetch dashboard data"
    });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      agentId
    } = req.query;

    const values = [];
    const conditions = [];

    if (search) {
      values.push(`%${search}%`);

      conditions.push(`
        (
          t.subject ILIKE $${values.length}
          OR customer.name ILIKE $${values.length}
          OR customer.email ILIKE $${values.length}
        )
      `);
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
        t.description,
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
        agent.name AS agent_name
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
        u.id,
        u.name,
        u.email,
        u.created_at,
        COUNT(t.id) AS assigned_tickets,
        COUNT(t.id) FILTER (
          WHERE t.status = 'resolved'
        ) AS resolved_tickets
       FROM users u
       LEFT JOIN tickets t
         ON u.id = t.assigned_agent_id
       WHERE u.role = 'agent'
       GROUP BY u.id
       ORDER BY u.name`
    );

    const agents = result.rows.map((agent) => {
      const assignedTickets =
        Number(agent.assigned_tickets);

      const resolvedTickets =
        Number(agent.resolved_tickets);

      const resolutionRate =
        assignedTickets > 0
          ? Number(
              (
                (resolvedTickets / assignedTickets) *
                100
              ).toFixed(2)
            )
          : 0;

      return {
        ...agent,
        assigned_tickets: assignedTickets,
        resolved_tickets: resolvedTickets,
        resolution_rate: resolutionRate
      };
    });

    res.json({
      agents
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
        u.id,
        u.name,
        u.email,
        u.created_at,
        COUNT(t.id) AS ticket_count,
        COUNT(t.id) FILTER (
          WHERE t.status = 'resolved'
        ) AS resolved_tickets,
        COUNT(t.id) FILTER (
          WHERE t.status != 'resolved'
        ) AS open_tickets
       FROM users u
       LEFT JOIN tickets t
         ON u.id = t.customer_id
       WHERE u.role = 'customer'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );

    res.json({
      customers: result.rows.map((customer) => ({
        ...customer,
        ticket_count: Number(customer.ticket_count),
        resolved_tickets: Number(
          customer.resolved_tickets
        ),
        open_tickets: Number(
          customer.open_tickets
        )
      }))
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to fetch customers"
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
        t.created_at,
        customer.name AS customer_name,
        customer.email AS customer_email,
        agent.name AS agent_name
       FROM tickets t
       JOIN users customer
         ON t.customer_id = customer.id
       LEFT JOIN users agent
         ON t.assigned_agent_id = agent.id
       WHERE
        (
          t.status != 'resolved'
          AND t.resolution_due_at < CURRENT_TIMESTAMP
        )
        OR
        (
          t.status = 'resolved'
          AND t.updated_at > t.resolution_due_at
        )
       ORDER BY t.resolution_due_at ASC`
    );

    res.json({
      breaches: result.rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to fetch SLA breaches"
    });
  }
};

module.exports = {
  getDashboard,
  getAllTickets,
  getAgents,
  getCustomers,
  getSlaBreaches
};