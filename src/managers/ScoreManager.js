export default class ScoreManager {
  constructor() {
    this.storageKey = "subzero_leaderboard";
  }

  saveScore(name, score) {
    const scores = this.getHighScores();
    scores.push({ name, score });

    // Sort descending
    scores.sort((a, b) => b.score - a.score);

    // Keep top 10
    const topScores = scores.slice(0, 10);

    localStorage.setItem(this.storageKey, JSON.stringify(topScores));
  }

  getHighScores() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }
}
