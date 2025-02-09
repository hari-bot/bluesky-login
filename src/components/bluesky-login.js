import { useState } from "react";

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
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md space-y-4 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 text-center">
        Bluesky Login
      </h2>
      <input
        type="text"
        placeholder="Bluesky Handle"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        className="border p-2 w-full rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        type="password"
        placeholder="App Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white p-2 rounded-md w-full font-medium transition hover:bg-blue-600"
      >
        Login
      </button>
      {error && <p className="text-red-500 text-center">{error}</p>}

      {profile && (
        <div className="mt-4 p-4 border rounded-md bg-gray-50 text-gray-900">
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
              {profile.followingCount}
            </p>
            <p>
              <span className="font-semibold">Posts:</span> {profile.postsCount}
            </p>
          </div>
        </div>
      )}

      {posts.length > 0 && (
        <div className="mt-4 p-4 border rounded-md bg-gray-50 text-gray-900">
          <h3 className="text-lg font-semibold">Recent Posts</h3>
          <ul className="space-y-4">
            {posts.map((item, index) => {
              const post = item.post;
              const postText = post?.record?.text || "No content";
              const postDate = new Date(
                post?.record?.createdAt
              ).toLocaleString();
              const postImage =
                post?.embed?.images?.length > 0
                  ? post.embed.images[0].fullsize
                  : null;

              return (
                <li
                  key={index}
                  className="p-4 border rounded-md bg-white shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.author.avatar}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full border"
                    />
                    <div>
                      <h4 className="text-md font-semibold">
                        {post.author.displayName}
                      </h4>
                      <p className="text-gray-500 text-sm">
                        @{post.author.handle}
                      </p>
                    </div>
                  </div>

                  <p className="mt-2 text-gray-900">{postText}</p>

                  {postImage && (
                    <div className="mt-3">
                      <img
                        src={postImage}
                        alt="Post Image"
                        className="rounded-md w-full h-auto"
                      />
                    </div>
                  )}

                  <p className="text-gray-500 text-xs mt-2">{postDate}</p>

                  <div className="mt-3 flex justify-between text-gray-700 text-sm">
                    <p>💬 {post.replyCount}</p>
                    <p>🔁 {post.repostCount}</p>
                    <p>❤️ {post.likeCount}</p>
                    <p>🗨️ {post.quoteCount}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BlueskyLogin;
