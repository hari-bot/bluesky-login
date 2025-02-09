import { useState } from "react";

const BlueskyLogin = () => {
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      const response = await fetch(
        "https://bsky.social/xrpc/com.atproto.server.createSession",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: handle, password }),
        }
      );

      if (!response.ok) throw new Error("Invalid credentials");
      const data = await response.json();

      const profileRes = await fetch(
        `https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=${data.did}`,
        {
          headers: { Authorization: `Bearer ${data.accessJwt}` },
        }
      );

      if (!profileRes.ok) throw new Error("Failed to fetch profile");
      const profileData = await profileRes.json();
      setProfile(profileData);
      setError(null);
    } catch (err) {
      setError(err.message);
      setProfile(null);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg text-white space-y-6">
      <h2 className="text-2xl font-bold text-center">Bluesky Login</h2>
      <input
        type="text"
        placeholder="Bluesky Handle"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        className="border p-3 w-full rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <input
        type="password"
        placeholder="App Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-3 w-full rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <button
        onClick={handleLogin}
        className="bg-white text-blue-600 p-3 rounded-lg w-full font-semibold transition hover:bg-blue-100"
      >
        Login
      </button>
      {error && <p className="text-red-300 text-center">{error}</p>}
      {profile && (
        <div className="mt-6 p-6 bg-white text-black rounded-lg shadow-md text-center">
          <h3 className="text-xl font-bold">{profile.displayName}</h3>
          <p className="text-gray-600">@{profile.handle}</p>
          <img
            src={profile.avatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full mx-auto mt-3 border-4 border-blue-500"
          />
        </div>
      )}
    </div>
  );
};

export default BlueskyLogin;
