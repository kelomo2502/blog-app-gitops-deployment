import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import Comment from "./Comment";

interface PostProps {
  id: string;
  content: string;
  author: string;
  userId: string;
  photoURL?: string;
  timestamp: any;
}

const Post = ({ id, content, author, userId, photoURL, timestamp }: PostProps) => {
  const { user } = useAuth();
  const [newContent, setNewContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);

  const isOwner = user && user.uid === userId;

  const handleEdit = async () => {
    if (!newContent.trim()) return;
    await updateDoc(doc(db, "posts", id), { content: newContent });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db, "posts", id));
  };

  return (
    <div className="bg-white dark:bg-green-800 border border-green-300 dark:border-green-700 md:p-5 rounded-xl shadow-lg mb-6 max-w-2xl mx-auto">
      {/* ✅ Profile & Content */}
      <div className="flex gap-4 items-start">
        {/* Profile Image */}
        <img
          src={photoURL || import.meta.env.VITE_IMAGE_PLACEHOLDER}
          alt="User Profile"
          className="w-12 h-12 rounded-full border border-green-400 dark:border-green-600"
        />

        <div className="flex-1">
          {/* Timestamp */}
          <p className="text-xs text-green-500 dark:text-green-400">
            {new Date(timestamp?.seconds * 1000).toLocaleString()}
          </p>

          {/* Post Content */}
          {isEditing ? (
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="bg-green-100 dark:bg-green-700 text-green-900 dark:text-white border border-green-300 dark:border-green-600 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-lg font-medium text-green-800 dark:text-green-200">{content}</p>
          )}

          <p className="text-sm font-semibold text-green-500 dark:text-green-400 mt-2">By: {author}</p>

          {/* ✅ Owner Controls */}
          {isOwner && (
            <div className="mt-3 flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleEdit}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Comments Section */}
      <div className="mt-5 bg-green-50 dark:bg-green-700 md:p-4 rounded-lg shadow-sm">
        <Comment postId={id} />
      </div>
    </div>
  );
};

export default Post;
