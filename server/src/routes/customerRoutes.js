const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  createTicket,
  getMyTickets,
  getTicketDetails,
  addMessage
} = require("../controllers/ticketController");

const router = express.Router();

router.use(protect);
router.use(allowRoles("customer"));

router.post("/tickets", createTicket);
router.get("/tickets", getMyTickets);
router.get("/tickets/:id", getTicketDetails);
router.post("/tickets/:id/messages", addMessage);

module.exports = router;