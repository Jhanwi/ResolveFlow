const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getDashboard,
  getAllTickets,
  getAgents,
  getCustomers,
  assignTicket,
  getSlaBreaches,
  getSlaPolicies,
  createSlaPolicy,
  updateSlaPolicy
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect);
router.use(allowRoles("admin"));

router.get(
  "/dashboard",
  getDashboard
);

router.get(
  "/tickets",
  getAllTickets
);

router.get(
  "/agents",
  getAgents
);

router.get(
  "/customers",
  getCustomers
);

router.patch(
  "/tickets/:id/assign",
  assignTicket
);

router.get(
  "/sla/breaches",
  getSlaBreaches
);

router.get(
  "/sla",
  getSlaPolicies
);

router.post(
  "/sla",
  createSlaPolicy
);

router.patch(
  "/sla/:id",
  updateSlaPolicy
);

module.exports = router;