import { useState } from "react";
import { Link } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { notification } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Checkbox from "../form/input/Checkbox";
import { API_CONFIG, apiUrl } from "../../utilities/config";

// Update the interface to include role
interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: string; // Add role field
}

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Update the initial form state to include role
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "admin", // Set default role as admin
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
    const { firstName, lastName, email, phone, password } = formData;

    if (!firstName.trim()) {
      api.error({
        message: "Validation Error",
        description: "First name is required",
        placement: "topRight",
      });
      return false;
    }

    if (!lastName.trim()) {
      api.error({
        message: "Validation Error",
        description: "Last name is required",
        placement: "topRight",
      });
      return false;
    }

    if (!email.trim()) {
      api.error({
        message: "Validation Error",
        description: "Email is required",
        placement: "topRight",
      });
      return false;
    }

    if (!phone.trim()) {
      api.error({
        message: "Validation Error",
        description: "Phone number is required",
        placement: "topRight",
      });
      return false;
    }

    // Basic phone validation
    const phoneRegex = /[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      api.error({
        message: "Validation Error",
        description: "Please enter a valid phone number",
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

    if (password.length < 6) {
      api.error({
        message: "Validation Error",
        description: "Password must be at least 6 characters long",
        placement: "topRight",
      });
      return false;
    }

    if (!isChecked) {
      api.error({
        message: "Validation Error",
        description: "Please agree to the Terms and Conditions",
        placement: "topRight",
      });
      return false;
    }

    return true;
  };

  // Update the handleSubmit function to include role in payload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role, // Add role to payload
      };

      console.log("Signup payload:", payload);

      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNUP),
        payload
      );

      console.log("Signup response:", response.data);

      api.success({
        message: "Success!",
        description:
          "Account created successfully. Please check your email for verification.",
        placement: "topRight",
        duration: 5,
      });

      // Reset form data
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        role: "admin", // Reset role
      });
      setIsChecked(false);

      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (error: any) {
      console.error("Signup error:", error);
      console.error("Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message || "An error occurred during signup";
      api.error({
        message: "Signup Failed",
        description: errorMessage,
        placement: "topRight",
        duration: 5,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      {contextHolder}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your details to create your account!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* First Name */}
                  <div className="sm:col-span-1">
                    <Label>
                      First Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                  {/* Last Name */}
                  <div className="sm:col-span-1">
                    <Label>
                      Last Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                {/* Email */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                {/* Phone Number */}
                <div>
                  <Label>
                    Phone Number<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Enter your phone number (e.g., +234 801 234 5678)"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                {/* Password */}
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password (min. 6 characters)"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                {/* Checkbox */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                    disabled={isLoading}
                  />
                  <p className="inline-block text-[12px] md:text-[15px] font-normal text-gray-500 dark:text-gray-400">
                    By creating an account means you agree to the{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Terms and Conditions,
                    </span>{" "}
                    and our{" "}
                    <span className="text-gray-800 dark:text-white">
                      Privacy Policy
                    </span>
                  </p>
                </div>
                {/* Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing Up...</span>
                      </div>
                    ) : (
                      "Sign Up"
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 ml-2 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
