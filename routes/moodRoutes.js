const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Save mood entry
router.post("/save", (req, res) => {
  const { mood, note } = req.body;
  const userId = req.user.id;

  db.query(
    "INSERT INTO mood_journal (user_id, mood, note) VALUES (?, ?, ?)",
    [userId, mood, note],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error saving entry" });
      res.json({ message: "Mood entry saved successfully!" });
    }
  );
});

// Get all mood entries
router.get("/get", (req, res) => {
  const userId = req.user.id;
  db.query(
    "SELECT mood, note, entry_date FROM mood_journal WHERE user_id = ? ORDER BY entry_date DESC",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Error fetching entries" });
      res.json(results);
    }
  );
});
// Get mood statistics
router.get("/stats", (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT mood, COUNT(*) as count FROM mood_journal WHERE user_id = ? GROUP BY mood",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Error fetching mood stats" });

      const stats = {};
      results.forEach(r => {
        stats[r.mood] = r.count;
      });

      res.json(stats);
    }
  );
});


module.exports = router;
