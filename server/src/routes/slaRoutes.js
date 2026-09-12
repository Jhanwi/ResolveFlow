const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getSlaPolicies,
  createSlaPolicy,
  updateSlaPolicy
} = require("../controllers/slaController");

const router = express.Router();

router.use(protect);
router.use(allowRoles("admin"));

router.get("/", getSlaPolicies);

router.post("/", createSlaPolicy);

router.patch("/:id", updateSlaPolicy);

module.exports = router;