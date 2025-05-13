import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import usePostCount from "../hooks/usePostCount";
import { updateProfile } from "firebase/auth";
import { db, storage } from "../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, loading } = useAuth();
  const { postCount, loading: postLoading } = usePostCount(user?.uid || null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoURL, setPhotoURL] = useState(user?.photoURL || import.meta.env.VITE_IMAGE_PLACEHOLDER);
  const [updating, setUpdating] = useState(false);

  if (loading || postLoading) {
    return <p className="text-center text-green-400">Loading...</p>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);

      // **Preview Image Before Upload**
      const fileReader = new FileReader();
      fileReader.onload = () => setPhotoURL(fileReader.result as string);
      fileReader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      let newPhotoURL = photoURL;

      // ✅ Upload New Profile Picture
      if (photo) {
        const photoRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(photoRef, photo);
        newPhotoURL = await getDownloadURL(photoRef);
      }

      // ✅ Update Firebase Auth & Firestore
      await updateProfile(user, { displayName, photoURL: newPhotoURL });
      await updateDoc(doc(db, "users", user.uid), { displayName, photoURL: newPhotoURL });

      // ✅ Update UI State
      setPhotoURL(newPhotoURL);
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Profile update error:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-green-100 text-white text-[18px]">
      <div className="bg-green-800 p-6 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>

        {/* ✅ Profile Picture with Preview */}
        <img
          src={photoURL}
          alt="Profile"
          className="w-24 h-24 rounded-full shadow-lg object-cover mb-4"
        />

        {editing ? (
          <div className="flex flex-col items-center w-full">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 bg-green-700 text-white border border-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full text-sm text-green-300 bg-green-700 p-2 border border-green-600 rounded-md"
            />
            <button
              onClick={handleSave}
              className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-all"
              disabled={updating}
            >
              {updating ? "Updating..." : "Save Changes"}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-lg font-semibold">{displayName || "No Name"}</p>
            <p className="text-green-400">{user?.email}</p>
            <p className="mt-2 text-green-500">Number of Posts: {postCount ?? 0}</p>
            <button
              onClick={() => setEditing(true)}
              className="mt-4 bg-green-500 text-white px-5 py-2 rounded-md hover:bg-green-600 transition-all"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
