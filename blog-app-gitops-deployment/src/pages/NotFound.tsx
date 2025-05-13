import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <motion.h1
        className="text-6xl font-extrabold text-red-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        404 🚫
      </motion.h1>
      <p className="text-xl text-gray-700 mt-2">Oops! Page Not Found</p>
      
      <Link
        to="/"
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition"
      >
        🔙 Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
