const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ Save or update high score for a game
router.post("/save-score", (req, res) => {
  const { gameName, score } = req.body;
  const userId = req.user.id;

  if (!gameName || score == null) {
    return res.status(400).json({ message: "Missing data" });
  }

  const sql = `
    INSERT INTO game_scores (user_id, game_name, score)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE score = GREATEST(score, VALUES(score));
  `;

  db.query(sql, [userId, gameName, score], (err) => {
    if (err) {
      console.error("❌ Error saving score:", err);
      return res.status(500).json({ message: "Database error saving score" });
    }
    res.json({ success: true, message: "Score saved successfully!" });
  });
});

// ✅ Fetch all scores for logged-in user
router.get("/get-scores", (req, res) => {
  const userId = req.user.id;

  const sql = "SELECT game_name, score FROM game_scores WHERE user_id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching scores:", err);
      return res.status(500).json({ message: "Database error fetching scores" });
    }

    // Return results in object form { memory: 10, bubblepop: 20, clouds: 15 }
    const scores = {};
    results.forEach(row => {
      scores[row.game_name] = row.score;
    });

    res.json(scores);
  });
});

module.exports = router;
