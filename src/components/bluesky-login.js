import { useState } from "react";
import Post from "./post";

const BlueskyLogin = () => {
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
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

      const postsRes = await fetch(
        `https://bsky.social/xrpc/app.bsky.feed.getAuthorFeed?actor=${data.did}`,
        {
          headers: { Authorization: `Bearer ${data.accessJwt}` },
        }
      );

      if (!postsRes.ok) throw new Error("Failed to fetch posts");
      const postsData = await postsRes.json();
      setPosts(postsData.feed || []);

      setError(null);
    } catch (err) {
      setError(err.message);
      setProfile(null);
      setPosts([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
        Bluesky Login
      </h2>

      {/* Grid Layout for Better Structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Login Form */}
        <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Login</h3>
          <input
            type="text"
            placeholder="Bluesky Handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="border p-2 w-full rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
          />
          <input
            type="password"
            placeholder="App Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
          />
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white p-2 rounded-md w-full font-medium transition hover:bg-blue-600"
          >
            Login
          </button>
          {error && <p className="text-red-500 text-center mt-3">{error}</p>}
        </div>

        {/* Profile Card */}
        {profile && (
          <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
            <div className="flex items-center space-x-4">
              <img
                src={profile.avatar}
                alt="Avatar"
                className="w-16 h-16 rounded-full border-2 border-blue-500"
              />
              <div>
                <h3 className="text-lg font-semibold">{profile.displayName}</h3>
                <p className="text-gray-600">@{profile.handle}</p>
                <p className="text-sm text-gray-500">{profile.description}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-700">
              <p>
                <span className="font-semibold">Followers:</span>{" "}
                {profile.followersCount}
              </p>
              <p>
                <span className="font-semibold">Following:</span>{" "}
                {profile.followsCount}
              </p>
              <p>
                <span className="font-semibold">Posts:</span>{" "}
                {profile.postsCount}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Posts Section */}
      {posts.length > 0 && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
          <ul className="space-y-4">
            {posts.map((item, index) => (
              <Post key={index} post={item.post} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BlueskyLogin;
