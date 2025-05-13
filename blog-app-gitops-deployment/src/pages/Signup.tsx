import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(email, password, name);
      toast.success("Account created successfully! 🎉");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Signup failed! ❌");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 md:px-8">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-sm sm:max-w-md bg-white p-6 sm:p-8 shadow-lg rounded-lg border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
          Create an Account
        </h2>

        {/* ✅ Full Name Input */}
        <div className="mb-4">
          <label className="block text-gray-600 font-medium mb-1">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-md p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        {/* ✅ Email Input */}
        <div className="mb-4">
          <label className="block text-gray-600 font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-md p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        {/* ✅ Password Input */}
        <div className="mb-6">
          <label className="block text-gray-600 font-medium mb-1">Password</label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-md p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        {/* ✅ Sign Up Button */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 rounded-md font-medium text-lg hover:bg-green-500 transition-all"
        >
          Sign Up
        </button>

        {/* ✅ Login Link */}
        <p className="text-gray-500 text-center mt-4 text-sm sm:text-base">
          Already have an account?{" "}
          <Link to={"/login"} className="text-green-500 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
