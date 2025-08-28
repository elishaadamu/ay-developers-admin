import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { notification } from "antd";
import axios from "axios";
import { API_CONFIG, apiUrl } from "../../utilities/config";
import { encryptData } from "../../utilities/encryption";

interface SignInFormData {
  email: string;
  password: string;
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const { email, password } = formData;

    if (!email.trim()) {
      api.error({
        message: "Validation Error",
        description: "Email is required",
        placement: "topRight",
      });
      return false;
    }

    if (!password.trim()) {
      api.error({
        message: "Validation Error",
        description: "Password is required",
        placement: "topRight",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
      };

      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNIN),
        payload
      );
      console.log("Signin response:", response);
      if (response.data) {
        const encryptedUserData = encryptData(response.data);
        localStorage.setItem("userData", encryptedUserData);
      }

      api.success({
        message: "Success!",
        description: "Signed in successfully. Welcome back!",
        placement: "topRight",
        duration: 3,
      });

      // Clear form data
      setFormData({
        email: "",
        password: "",
      });
      setIsChecked(false);

      // Navigate immediately after setting localStorage
      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("Signin error:", error);

      const errorMessage =
        error.response?.data?.message || "Invalid email or password";
      api.error({
        message: "Sign In Failed",
        description: errorMessage,
        placement: "topRight",
        duration: 5,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {contextHolder}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="info@gmail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isChecked}
                      onChange={setIsChecked}
                      disabled={isLoading}
                    />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <button
                    type="submit"
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
