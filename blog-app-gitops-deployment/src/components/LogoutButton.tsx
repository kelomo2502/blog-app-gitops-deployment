import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* Logout Button */}
      <button
        onClick={() => setIsConfirming(true)}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition-all"
      >
        Logout
      </button>

      {/* Confirmation Modal */}
      {isConfirming && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold text-gray-800">Are you sure?</h2>
            <p className="text-gray-600 mt-2">You will be logged out.</p>
            
            <div className="flex justify-center gap-4 mt-4">
              {/* Confirm Logout */}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition-all"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Yes, Logout"}
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => setIsConfirming(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-all"
                disabled={isLoggingOut}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
