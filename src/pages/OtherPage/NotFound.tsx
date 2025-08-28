import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();

  // Auto-redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center max-w-md mx-4">
        {/* 404 Display */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-6 mb-6">
          <div className="font-mono text-6xl md:text-8xl text-white font-bold">
            404
          </div>
          <div className="text-red-100 text-lg mt-2 font-medium">
            Page Not Found
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
            Oops! Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            The page you're looking for doesn't exist or has been moved. Don't
            worry, it happens to the best of us!
          </p>
        </div>

        {/* Auto-redirect countdown */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="text-gray-700 dark:text-gray-300 text-sm mb-2">
            Redirecting to home page in:
          </div>
          <div className="font-mono text-3xl font-bold text-blue-600 dark:text-blue-400">
            {countdown}s
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoHome}
            className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
          >
            Go to Homepage
          </button>

          <button
            onClick={handleGoBack}
            className="px-6 py-3 rounded-lg font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-200"
          >
            Go Back
          </button>

          <Link
            to="/contact"
            className="px-6 py-3 rounded-lg font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Contact Support
          </Link>
        </div>

        {/* Status Indicator */}
        <div className="mt-6">
          <span className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            Error 404 - Resource Not Found
          </span>
        </div>

        {/* Additional Help Links */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Need help? Try these:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              to="/"
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Dashboard
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/products"
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Products
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/profile"
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
