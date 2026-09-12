const pool = require("../config/db");

const allowedPriorities = [
  "low",
  "medium",
  "high",
  "critical"
];

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
      responseMinutes === undefined ||
      resolutionMinutes === undefined
    ) {
      return res.status(400).json({
        message:
          "Priority, response time and resolution time are required"
      });
    }

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority"
      });
    }

    if (
      Number(responseMinutes) <= 0 ||
      Number(resolutionMinutes) <= 0
    ) {
      return res.status(400).json({
        message: "SLA times must be greater than zero"
      });
    }

    const result = await pool.query(
      `INSERT INTO sla_policies
       (priority, response_minutes, resolution_minutes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        priority,
        Number(responseMinutes),
        Number(resolutionMinutes)
      ]
    );

    res.status(201).json({
      message: "SLA policy created",
      policy: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        message:
          "An SLA policy already exists for this priority"
      });
    }

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
      responseMinutes === undefined ||
      resolutionMinutes === undefined
    ) {
      return res.status(400).json({
        message:
          "Priority, response time and resolution time are required"
      });
    }

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority"
      });
    }

    if (
      Number(responseMinutes) <= 0 ||
      Number(resolutionMinutes) <= 0
    ) {
      return res.status(400).json({
        message: "SLA times must be greater than zero"
      });
    }

    const result = await pool.query(
      `UPDATE sla_policies
       SET priority = $1,
           response_minutes = $2,
           resolution_minutes = $3
       WHERE id = $4
       RETURNING *`,
      [
        priority,
        Number(responseMinutes),
        Number(resolutionMinutes),
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

    if (error.code === "23505") {
      return res.status(409).json({
        message:
          "An SLA policy already exists for this priority"
      });
    }

    res.status(500).json({
      message: "Unable to update SLA policy"
    });
  }
};

module.exports = {
  getSlaPolicies,
  createSlaPolicy,
  updateSlaPolicy
};