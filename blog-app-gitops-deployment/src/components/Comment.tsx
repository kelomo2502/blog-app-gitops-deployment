import { useState, useEffect, useRef } from "react";
import { addDoc, collection, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

interface CommentProps {
  postId: string;
}

const Comment = ({ postId }: CommentProps) => {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, "comments"), where("postId", "==", postId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, [postId]);

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast.error("Comment cannot be empty!");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "comments"), {
        text: comment,
        author: user?.displayName || "Anonymous",
        postId,
        userId: user?.uid,
        timestamp: serverTimestamp(),
      });

      setComment("");
      toast.success("Comment added! 🎉");

      // Scroll to latest comment
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (error) {
      console.error("Error adding comment: ", error);
      toast.error("Failed to add comment. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 px-4">
      <div className="bg-white dark:bg-green-800 shadow-md rounded-lg p-4">
        {/* Comment Input Section */}
        {user && (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 w-full px-4 py-3 text-green-900 dark:text-white bg-green-100 dark:bg-green-700 border border-green-300 dark:border-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
            <button
              onClick={handleAddComment}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg text-white font-medium transition-all ${
                loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
              disabled={loading}
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        )}

        {/* Comments List */}
        <div className="mt-4 max-h-60 overflow-y-auto space-y-3 ">
          {comments.length === 0 ? (
            <p className="text-green-500 text-center">No comments yet. Be the first! 💬</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="p-3 bg-green-50 dark:bg-green-700 rounded-lg shadow-sm">
                <p className="text-sm">
                  <strong className="text-green-600 dark:text-green-400">{c.author}</strong> -{" "}
                  <span className="text-green-500 dark:text-green-400">
                    {c.timestamp?.seconds
                      ? formatDistanceToNow(new Date(c.timestamp.seconds * 1000), { addSuffix: true })
                      : "Just now"}
                  </span>
                </p>
                <p className="text-green-800 dark:text-green-200">{c.text}</p>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default Comment;
