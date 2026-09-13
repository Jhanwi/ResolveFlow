const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getAgentTickets,
  getAgentTicketDetails,
  replyToTicket,
  addInternalNote,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  escalateTicket
} = require("../controllers/agentController");

const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

router.use(protect);
router.use(allowRoles("agent", "admin"));

router.get("/tickets", getAgentTickets);

router.get(
  "/tickets/:id",
  getAgentTicketDetails
);

router.post(
  "/tickets/:id/reply",
  upload.single("attachment"),
  replyToTicket
);

router.post(
  "/tickets/:id/note",
  addInternalNote
);

router.patch(
  "/tickets/:id/status",
  updateTicketStatus
);

router.patch(
  "/tickets/:id/priority",
  updateTicketPriority
);

router.patch(
  "/tickets/:id/assign",
  assignTicket
);

router.post(
  "/tickets/:id/escalate",
  escalateTicket
);

module.exports = router;