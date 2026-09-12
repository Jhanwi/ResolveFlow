const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getDashboard,
  getAllTickets,
  getAgents,
  getCustomers,
  getSlaBreaches
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect);
router.use(allowRoles("admin"));

router.get("/dashboard", getDashboard);

router.get("/tickets", getAllTickets);

router.get("/agents", getAgents);

router.get("/customers", getCustomers);

router.get("/breaches", getSlaBreaches);

module.exports = router;