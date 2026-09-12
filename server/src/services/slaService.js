const pool = require("../config/db");

const calculateSla = async (priority) => {
  const result = await pool.query(
    `SELECT response_minutes, resolution_minutes
     FROM sla_policies
     WHERE priority = $1`,
    [priority]
  );

  if (result.rows.length === 0) {
    throw new Error("SLA policy not found");
  }

  const policy = result.rows[0];

  const responseDueAt = new Date(
    Date.now() + policy.response_minutes * 60 * 1000
  );

  const resolutionDueAt = new Date(
    Date.now() + policy.resolution_minutes * 60 * 1000
  );

  return {
    responseDueAt,
    resolutionDueAt
  };
};

module.exports = {
  calculateSla
};