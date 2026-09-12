const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  createReview,
  getTicketReview
} = require("../controllers/reviewController");

const router = express.Router();

router.use(protect);
router.use(allowRoles("customer"));

router.post(
  "/tickets/:id/review",
  createReview
);

router.get(
  "/tickets/:id/review",
  getTicketReview
);

module.exports = router;