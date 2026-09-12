const pool = require("../config/db");

const createReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({
        message: "Rating is required"
      });
    }

    const ratingNumber = Number(rating);

    if (
      ratingNumber < 1 ||
      ratingNumber > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    const ticketResult = await pool.query(
      `SELECT id, status
       FROM tickets
       WHERE id = $1
       AND customer_id = $2`,
      [id, req.user.id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    const ticket = ticketResult.rows[0];

    if (ticket.status !== "resolved") {
      return res.status(400).json({
        message:
          "You can review a ticket only after it is resolved"
      });
    }

    const existingReview = await pool.query(
      `SELECT id
       FROM reviews
       WHERE ticket_id = $1`,
      [id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(409).json({
        message: "This ticket has already been reviewed"
      });
    }

    const result = await pool.query(
      `INSERT INTO reviews
       (ticket_id, customer_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        id,
        req.user.id,
        ratingNumber,
        comment?.trim() || null
      ]
    );

    res.status(201).json({
      message: "Review submitted successfully",
      review: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to submit review"
    });
  }
};

const getTicketReview = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        id,
        ticket_id,
        rating,
        comment,
        created_at
       FROM reviews
       WHERE ticket_id = $1
       AND customer_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({
        review: null
      });
    }

    res.json({
      review: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to fetch review"
    });
  }
};

module.exports = {
  createReview,
  getTicketReview
};