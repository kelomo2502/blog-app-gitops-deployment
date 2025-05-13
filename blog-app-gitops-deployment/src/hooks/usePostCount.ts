import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig"; // Adjust path if needed

const usePostCount = (userId: string | null) => {
  const [postCount, setPostCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPostCount = async () => {
      try {
        const postsRef = collection(db, "posts");
        const snapshot = await getDocs(postsRef);
        const userPosts = snapshot.docs.filter((doc) => doc.data().userId === userId);
        setPostCount(userPosts.length);
      } catch (error) {
        console.error("Error fetching post count:", error);
        setPostCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPostCount();
  }, [userId]);

  return { postCount, loading };
};

export default usePostCount;
