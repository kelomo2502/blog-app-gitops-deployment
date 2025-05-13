import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import Post from "../components/Post";
import CreatePost from "../components/CreatePost";
import toast from "react-hot-toast";

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");

  // Fetch posts from Firestore
  const fetchPosts = useCallback(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = fetchPosts();
    return () => unsubscribe();
  }, [fetchPosts]);

  // Handle post deletion
  const handleDelete = async (postId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
      toast.success("Post deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete post.");
      console.error("Error deleting post:", error);
    }
  };

  // Handle post editing
  const handleEdit = (postId: string, currentContent: string) => {
    setEditingPost(postId);
    setEditedContent(currentContent);
  };

  const handleSaveEdit = async (postId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "posts", postId), { content: editedContent });
      toast.success("Post updated successfully!");
      setEditingPost(null);
    } catch (error) {
      toast.error("Failed to update post.");
      console.error("Error updating post:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* ✅ Show Create Post Form for Signed-in Users */}
      {user && (
        <div className="mb-6 bg-green-800 shadow-md rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-white mb-4">Create a Post</h2>
          <CreatePost />
        </div>
      )}

      {/* ✅ Display All Posts */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Posts</h2>

      {loading ? (
        <p className="text-gray-500 text-center text-lg animate-pulse">Loading posts...</p>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition">
              {/* ✅ Edit Mode */}
              {editingPost === post.id ? (
                <div>
                  <textarea
                    className="border p-2 w-full text-[18px]"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleSaveEdit(post.id)} className="bg-green-500 text-white px-4 py-2 rounded">
                      Save
                    </button>
                    <button onClick={() => setEditingPost(null)} className="bg-gray-500 text-white px-4 py-2 rounded">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Post {...post} />
                  {/* ✅ Edit/Delete Options for Post Owner */}
                  {user?.uid === post.userId && (
                    <div className="flex gap-4 mt-2">
                      <button
                        onClick={() => handleEdit(post.id, post.content)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center text-lg">No posts available yet. Be the first to share!</p>
      )}
    </div>
  );
};

export default Home;
