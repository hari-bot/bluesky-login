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

      console.log(response);

      if (!response.ok) throw new Error("Invalid credentials");
      const data = await response.json();

      const profileRes = await fetch(
        `https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=${data.did}`,
        {
          headers: { Authorization: `Bearer ${data.accessJwt}` },
        }
      );

      console.log(profileRes);

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
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Bluesky Login</h2>
      <input
        type="text"
        placeholder="Bluesky Handle"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="password"
        placeholder="App Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white p-2 rounded w-full"
      >
        Login
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {profile && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="text-lg font-bold">{profile.displayName}</h3>
          <p>@{profile.handle}</p>
          <img
            src={profile.avatar}
            alt="Avatar"
            className="w-16 h-16 rounded-full mt-2"
          />
        </div>
      )}
    </div>
  );
};

export default BlueskyLogin;
