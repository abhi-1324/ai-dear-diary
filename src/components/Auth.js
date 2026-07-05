import React, { useState } from 'react';

function Auth({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!username || !password) return;
    
    const endpoint = isSignup ? "/signup" : "/login";
    
    const response = await fetch(`http://localhost:3001${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    
    if (data.error) {
      setError(data.error);
      return;
    }
    
    onLogin(data.token);
  }

  return (
    <div className="auth">
      <h1>📔 Dear Diary</h1>
      <p className="subtitle">Your private AI journal</p>

      <div className="auth-form">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        {error && <p className="error">{error}</p>}
        <button onClick={handleSubmit}>
          {isSignup ? "Create Account" : "Login"}
        </button>
        <p className="switch" onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? "Already have an account? Login" : "No account? Sign up"}
        </p>
      </div>

      <div className="footer">
        Built by <span>Goldenbuoy</span> 🖤
      </div>
    </div>
  );
}

export default Auth;