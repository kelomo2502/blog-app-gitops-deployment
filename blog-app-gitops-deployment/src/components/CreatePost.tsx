import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const MAX_CHAR = 280; // ✅ Character limit

const CreatePost = () => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddPost = async () => {
    if (!content.trim()) {
      toast.error("Post cannot be empty!");
      return;
    }

    if (content.length > MAX_CHAR) {
      toast.error(`Post cannot exceed ${MAX_CHAR} characters!`);
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "posts"), {
        content,
        author: user?.displayName || "Anonymous",
        userId: user?.uid,
        photoURL: user?.photoURL || "https://media.istockphoto.com/id/666545204/vector/default-placeholder-profile-icon.jpg?s=612x612&w=0&k=20&c=UGYk-MX0pFWUZOr5hloXDREB6vfCqsyS7SgbQ1-heY8=",
        timestamp: serverTimestamp(),
      });
      setContent("");
      toast.success("Post added successfully! 🎉");
    } catch (error) {
      console.error("Error adding post: ", error);
      toast.error("Failed to add post. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-green-100 p-4 rounded-lg shadow-md mb-4  ">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="border p-3 w-full rounded-md text-green-950 text-[18px] focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        maxLength={MAX_CHAR}
      />
      <p className="text-sm text-green-500 mt-1">{content.length} / {MAX_CHAR}</p>

      <button
        onClick={handleAddPost}
        className={`w-full mt-2 py-2 rounded-lg text-white transition-all ${
          loading ? "bg-green-600 cursor-not-allowed" : "bg-green-800 hover:bg-green-700"
        }`}
        disabled={loading}
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
};

export default CreatePost;
