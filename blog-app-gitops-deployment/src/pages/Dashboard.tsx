import { useAuth } from "../context/AuthContext";
import usePostCount from "../hooks/usePostCount";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { postCount, loading: postLoading } = usePostCount(user?.uid || null);

  if (loading || postLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-950">
        <p className="text-lg text-blue-200 animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-6">
      <div className="bg-blue-900 shadow-xl rounded-2xl p-6 w-full max-w-md border border-blue-500 text-[18px]">
        <h1 className="text-2xl font-bold text-blue-100 mb-4 text-center">
          Welcome, {user?.displayName || "User"} 🎉
        </h1>

        <div className="space-y-4">
          <div className="p-4 bg-blue-500 border border-blue-500 rounded-lg">
            <p className="text-blue-200">
              <span className="font-semibold text-white">Email:</span> {user?.email}
            </p>
          </div>

          <div className="p-4 bg-blue-500 border border-blue-500 rounded-lg">
            <p className="text-blue-200">
              <span className="font-semibold text-white">Number of Posts:</span> {postCount ?? 0}
            </p>
          </div>
        </div>

        <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-400 transition">
          View Posts
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
