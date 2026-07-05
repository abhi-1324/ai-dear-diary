import React, { useState, useEffect } from 'react';

function Diary({ token, onLogout }) {
  const [entries, setEntries] = useState([]);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("😊");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const moods = ["😊", "😔", "😤", "😴", "🔥", "😰", "🥹"];

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    const response = await fetch("http://localhost:3001/entries", {
      headers: { "Authorization": "Bearer " + token }
    });
    const data = await response.json();
    setEntries(data);
  }

  async function saveEntry() {
    if (!content) return;
    await fetch("http://localhost:3001/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ content, mood })
    });
    setContent("");
    fetchEntries();
  }

  async function deleteEntry(id) {
    await fetch(`http://localhost:3001/entries/${id}`, {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + token }
    });
    fetchEntries();
  }

  async function analyzeEntries() {
    if (entries.length === 0) return;
    setLoading(true);
    const response = await fetch("http://localhost:3001/analyze", {
      method: "POST",
      headers: { "Authorization": "Bearer " + token }
    });
    const data = await response.json();
    setAnalysis(data.result);
    setLoading(false);
  }

  return (
    <div className="diary">
      <div className="diary-header">
        <h1>📔 Dear Diary</h1>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>

      <div className="mood-selector">
        {moods.map((m) => (
          <span
            key={m}
            className={`mood ${mood === m ? "active-mood" : ""}`}
            onClick={() => setMood(m)}
          >
            {m}
          </span>
        ))}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Dear diary..."
      />

      <button className="save-btn" onClick={saveEntry}>Save Entry ✨</button>

      <button className="analyze-btn" onClick={analyzeEntries}>
        {loading ? "Analyzing..." : "🧠 Analyze My Entries"}
      </button>

      {analysis && (
        <div className="analysis">
          <p>{analysis}</p>
        </div>
      )}

      <div className="entries">
        {entries.map((entry) => (
          <div key={entry._id} className="entry">
            <div className="entry-header">
              <span className="entry-mood">{entry.mood}</span>
              <span className="entry-date">
                {new Date(entry.createdAt).toLocaleDateString()}
              </span>
              <button onClick={() => deleteEntry(entry._id)}>✕</button>
            </div>
            <p>{entry.content}</p>
          </div>
        ))}
      </div>

      <div className="footer">
        Built by <span>Goldenbuoy</span> 🖤
      </div>
    </div>
  );
}

export default Diary;