import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = ({ setIsLoggedIn, setUserEmail }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (name && email) {
      try {
        localStorage.setItem("userEmail", email);

        const response = await axios.get("http://localhost:5000/api/users", {
          params: { name, email },
        });

        if (response.data.exists) {
          setIsLoggedIn(true);
          setUserEmail(email);
          navigate("/");
        } else {
          await axios.post("http://localhost:5000/api/users", { name, email });
          setIsLoggedIn(true);
          setUserEmail(email);
          navigate("/");
        }
      } catch (error) {
        console.error("Error logging in:", error);
        alert("Login failed. Please try again.");
      }
    } else {
      alert("Please enter both name and email.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl mt-0 font-bold mb-6 bg-blue-800 p-6 text-white fixed text-center w-full">Login</h1>
      <div></div>
      <div className="flex items-center justify-center min-h-screen bg-[#6aa3e6]">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-600 mb-2">
                Name
              </label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-600 mb-2">
                Email
              </label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
