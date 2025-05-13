import { useState, useEffect } from "react";
import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import Post from "../components/Post";

const Posts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "posts"), (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleAddPost = async () => {
    if (!content.trim()) return;
    await addDoc(collection(db, "posts"), {
      content,
      author: user?.displayName || "Anonymous",
      userId: user?.uid,
      photoURL: user?.photoURL,
      timestamp: serverTimestamp(),
    });
    setContent("");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto text-[18px]">
      {/* ✅ Create New Post */}
      {user && (
        <div className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-2 text-white">Create a Post</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-[18px]"
          />
          <button
            onClick={handleAddPost}
            className="mt-2 bg-green-500 text-white px-5 py-2 rounded-md hover:bg-green-600 transition-all"
          >
            Post
          </button>
        </div>
      )}

      {/* ✅ Posts List */}
      {posts.length > 0 ? (
        posts.map((post) => <Post key={post.id} {...post} />)
      ) : (
        <p className="text-gray-400 text-center">No posts yet. Be the first to post something! 🚀</p>
      )}
    </div>
  );
};

export default Posts;
