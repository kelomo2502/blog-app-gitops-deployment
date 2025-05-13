import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { auth } from "./firebase/firebaseConfig";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { Toaster } from "react-hot-toast";
import { Menu, X } from "lucide-react";

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* ✅ Responsive Navigation Bar */}
        <nav className="bg-green-500 text-white shadow-lg text-[20px]">
          <div className="container mx-auto flex justify-between items-center px-6 py-4">
            <Link to="/" className="text-lg font-bold tracking-wide hover:underline">
              MyBlogApp
            </Link>
            
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-white focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/" className="hover:underline transition">Home</Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="hover:underline transition">Dashboard</Link>
                  <Link to="/profile" className="hover:underline transition">Profile</Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:underline transition">Login</Link>
                  <Link
                    to="/signup"
                    className="bg-green-500 px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all"
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile Menu */}
          {menuOpen && (
            <div className="lg:hidden flex flex-col items-center bg-green-500 text-white py-4 space-y-4">
              <Link to="/" className="hover:underline transition" onClick={() => setMenuOpen(false)}>Home</Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="hover:underline transition" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <Link to="/profile" className="hover:underline transition" onClick={() => setMenuOpen(false)}>Profile</Link>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="bg-red-500 px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:underline transition" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link
                    to="/signup"
                    className="bg-green-500 px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>

        {/* ✅ Main Content */}
        <main className="container mx-auto max-w-7xl px-4 py-6">
          <AppRoutes />
        </main>
      </div>
    </>
  );
};

export default App;
