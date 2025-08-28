import { useState, useEffect } from "react";
import { notification } from "antd";
import axios from "axios";
import ComponentCard from "../../../components/common/ComponentCard";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import { API_CONFIG, apiUrl } from "../../../utilities/config";
import PageMeta from "../../../components/common/PageMeta";

interface UserForm {
  firstName: string;
  lastName: string;
  role: string;
  stateOfResidence: string;
  localGovernment: string;
  email: string;
  passport: string; // Changed to string for base64
  phoneNumber: string;
}

interface ValidationErrors {
  firstName: boolean;
  lastName: boolean;
  role: boolean;
  stateOfResidence: boolean;
  localGovernment: boolean;
  email: boolean;
  phoneNumber: boolean;
}

interface StateOption {
  value: string;
  label: string;
}

interface LgaOption {
  value: string;
  label: string;
}

export default function AddUsers() {
  <PageMeta
    title="AY Developers - Add Users"
    description="This is the Add Users page for AY Developers"
  />;
  const [formData, setFormData] = useState<UserForm>({
    firstName: "",
    lastName: "",
    role: "",
    stateOfResidence: "",
    localGovernment: "",
    email: "",
    passport: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({
    firstName: false,
    lastName: false,
    role: false,
    stateOfResidence: false,
    localGovernment: false,
    email: false,
    phoneNumber: false,
  });

  const [success, setSuccess] = useState<Partial<ValidationErrors>>({});
  const [stateOptions, setStateOptions] = useState<StateOption[]>([]);
  const [lgaOptions, setLgaOptions] = useState<LgaOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options for role dropdown
  const roleOptions = [
    { value: "manager", label: "Sales & Growth Manager" },
    { value: "ambassador", label: "Ambassador" },
  ];

  // Fetch states from API
  const getStatesFromApi = async () => {
    try {
      setLoadingStates(true);
      const response = await axios.get(
        "https://nga-states-lga.onrender.com/fetch"
      );

      let statesArray = null;
      const data = response.data;

      if (data.states && Array.isArray(data.states)) {
        statesArray = data.states;
      } else if (data.data && Array.isArray(data.data)) {
        statesArray = data.data;
      } else if (Array.isArray(data)) {
        statesArray = data;
      } else {
        throw new Error("Invalid API response structure");
      }

      const formattedStates = statesArray.map((state: string) => ({
        value: state.toLowerCase().replace(/\s+/g, "-"),
        label: state,
      }));

      setStateOptions(formattedStates);
    } catch (error) {
      console.error("Error fetching states:", error);
      // Fallback to default states if API fails
      setStateOptions([
        { value: "lagos", label: "Lagos" },
        { value: "abuja", label: "FCT - Abuja" },
        { value: "kano", label: "Kano" },
        { value: "ogun", label: "Ogun" },
        { value: "rivers", label: "Rivers" },
        { value: "kaduna", label: "Kaduna" },
      ]);
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch LGAs from API based on selected state
  const getLgasFromApi = async (stateName: string) => {
    try {
      setLoadingLgas(true);
      const response = await axios.get(
        `https://nga-states-lga.onrender.com/?state=${encodeURIComponent(
          stateName
        )}`
      );

      let lgaArray = null;
      const data = response.data;

      if (data.lga && Array.isArray(data.lga)) {
        lgaArray = data.lga;
      } else if (data.data && Array.isArray(data.data)) {
        lgaArray = data.data;
      } else if (Array.isArray(data)) {
        lgaArray = data;
      } else {
        throw new Error("Invalid LGA API response structure");
      }

      const formattedLgas = lgaArray.map((lga: string) => ({
        value: lga.toLowerCase().replace(/\s+/g, "-"),
        label: lga,
      }));

      setLgaOptions(formattedLgas);
    } catch (error) {
      console.error("Error fetching LGAs:", error);
      setLgaOptions([
        { value: "ikeja", label: "Ikeja" },
        { value: "surulere", label: "Surulere" },
        { value: "mainland", label: "Lagos Mainland" },
        { value: "island", label: "Lagos Island" },
        { value: "alimosho", label: "Alimosho" },
      ]);
    } finally {
      setLoadingLgas(false);
    }
  };

  // Convert image to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file upload with validation
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset the file input value first
    const fileInput = e.target as HTMLInputElement;

    // Check file size (50KB = 50 * 1024 bytes)
    const maxSize = 50 * 1024;
    if (file.size > maxSize) {
      notification.error({
        message: "Image Size Error",
        description:
          "Image size must be less than 50KB. Please compress your image and try again.",
        duration: 4,
        placement: "topRight",
      });
      fileInput.value = ""; // Clear the input
      return;
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      notification.error({
        message: "Invalid File Type",
        description:
          "Please select a valid image file (JPEG, JPG, PNG, or GIF).",
        duration: 4,
        placement: "topRight",
      });
      fileInput.value = ""; // Clear the input
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      setFormData((prev) => ({ ...prev, passport: base64 }));
      setImagePreview(base64);

      notification.success({
        message: "Image Uploaded",
        description: "Profile image uploaded successfully!",
        duration: 3,
        placement: "topRight",
      });
    } catch (error) {
      notification.error({
        message: "Upload Error",
        description: "Failed to process the image. Please try again.",
        duration: 4,
        placement: "topRight",
      });
      fileInput.value = ""; // Clear the input
    }
  };

  // Remove image
  const removeImage = () => {
    setFormData((prev) => ({ ...prev, passport: "" }));
    setImagePreview("");
    // Clear the file input
    const fileInput = document.getElementById("passport") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Fetch states on component mount
  useEffect(() => {
    getStatesFromApi();
  }, []);

  // Validation functions
  const validateEmail = (email: string) => {
    const isValidEmail =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    return isValidEmail;
  };

  const validatePhoneNumber = (phone: string) => {
    const isValidPhone = /^(\+234|0)[789]\d{9}$/.test(phone);
    return isValidPhone;
  };

  const validateRequired = (value: string) => {
    return value.trim().length > 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof UserForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // If state is changed, fetch LGAs for that state and reset local government
    if (field === "stateOfResidence" && value) {
      const selectedState = stateOptions.find((state) => state.value === value);
      if (selectedState) {
        getLgasFromApi(selectedState.label);
        setFormData((prev) => ({ ...prev, localGovernment: "" }));
      }
    }

    // Real-time validation
    let isValid = false;

    switch (field) {
      case "firstName":
      case "lastName":
        isValid = validateRequired(value);
        break;
      case "email":
        isValid = validateEmail(value);
        break;
      case "phoneNumber":
        isValid = validatePhoneNumber(value);
        break;
      case "role":
      case "stateOfResidence":
      case "localGovernment":
        isValid = validateRequired(value);
        break;
      default:
        isValid = true;
    }

    setErrors((prev) => ({ ...prev, [field]: !isValid }));
    setSuccess((prev) => ({ ...prev, [field]: isValid && value.length > 0 }));
  };

  // Handle form submission with API call
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all fields
    const newErrors: ValidationErrors = {
      firstName: !validateRequired(formData.firstName),
      lastName: !validateRequired(formData.lastName),
      role: !validateRequired(formData.role),
      stateOfResidence: !validateRequired(formData.stateOfResidence),
      localGovernment: !validateRequired(formData.localGovernment),
      email: !validateEmail(formData.email),
      phoneNumber: !validatePhoneNumber(formData.phoneNumber),
    };

    setErrors(newErrors);

    // Check if form is valid
    const isFormValid = !Object.values(newErrors).some((error) => error);

    if (isFormValid) {
      try {
        // Prepare payload
        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          state: formData.stateOfResidence,
          lga: formData.localGovernment,
          phone: formData.phoneNumber,
          photo: formData.passport, // Base64 string
        };

        console.log("Payload to be sent:", payload);
        // Make API call using axios
        const response = await axios.post(
          apiUrl(API_CONFIG.ENDPOINTS.AUTH.AddUsers),
          payload
        );
        console.log("Full response", response);

        notification.success({
          message: "User Added Successfully",
          description:
            "The new " +
            `${formData.role}` +
            " role has been added to the system successfully!",
          duration: 4,
          placement: "topRight",
        });

        // Clear form and reset file input
        const fileInput = document.getElementById(
          "passport"
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }

        setFormData({
          firstName: "",
          lastName: "",
          role: "",
          stateOfResidence: "",
          localGovernment: "",
          email: "",
          passport: "",
          phoneNumber: "",
        });
        setErrors({
          firstName: false,
          lastName: false,
          role: false,
          stateOfResidence: false,
          localGovernment: false,
          email: false,
          phoneNumber: false,
        });
        setSuccess({});
        setLgaOptions([]);
        setImagePreview("");
      } catch (error) {
        console.error("Error creating user:", error);

        if (axios.isAxiosError(error)) {
          notification.error({
            message: "Submission Failed",
            description:
              error.response?.data?.message ||
              "Failed to add user. Please try again.",
            duration: 4,
            placement: "topRight",
          });
        } else {
          notification.error({
            message: "Submission Failed",
            description: "An unexpected error occurred. Please try again.",
            duration: 4,
            placement: "topRight",
          });
        }
      }
    } else {
      notification.warning({
        message: "Form Validation Error",
        description: "Please fix the errors in the form and try again.",
        duration: 4,
        placement: "topRight",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <ComponentCard
        title="Add New User"
        desc="Fill in the details below to add a new user to the system."
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Two columns for desktop/tablet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                type="text"
                id="firstName"
                value={formData.firstName}
                error={errors.firstName}
                success={success.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter first name"
                hint={
                  errors.firstName
                    ? "First name is required."
                    : success.firstName
                    ? "Valid first name."
                    : ""
                }
              />
            </div>

            {/* Last Name */}
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                type="text"
                id="lastName"
                value={formData.lastName}
                error={errors.lastName}
                success={success.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter last name"
                hint={
                  errors.lastName
                    ? "Last name is required."
                    : success.lastName
                    ? "Valid last name."
                    : ""
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={formData.email}
                error={errors.email}
                success={success.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
                hint={
                  errors.email
                    ? "Please enter a valid email address."
                    : success.email
                    ? "Valid email address."
                    : ""
                }
              />
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                error={errors.phoneNumber}
                success={success.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                placeholder="Enter phone number (e.g., +2348012345678)"
                hint={
                  errors.phoneNumber
                    ? "Please enter a valid Nigerian phone number."
                    : success.phoneNumber
                    ? "Valid phone number."
                    : ""
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role */}
            <div>
              <Label>Role</Label>
              <Select
                options={roleOptions}
                placeholder="Select a role"
                onChange={(value) => handleInputChange("role", value)}
                className="dark:bg-dark-900"
              />
              {errors.role && (
                <p className="mt-1 text-sm text-red-500">Role is required.</p>
              )}
            </div>

            {/* State of Residence */}
            <div>
              <Label>State of Residence</Label>
              <select
                value={formData.stateOfResidence}
                onChange={(e) =>
                  handleInputChange("stateOfResidence", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                disabled={loadingStates}
              >
                <option value="">
                  {loadingStates ? "Loading states..." : "Select state"}
                </option>
                {stateOptions.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
              {errors.stateOfResidence && (
                <p className="mt-1 text-sm text-red-500">
                  State of residence is required.
                </p>
              )}
            </div>
          </div>

          {/* Local Government - Full width */}
          <div>
            <Label>Local Government Area</Label>
            <select
              value={formData.localGovernment}
              onChange={(e) =>
                handleInputChange("localGovernment", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              disabled={loadingLgas || !formData.stateOfResidence}
            >
              <option value="">
                {loadingLgas
                  ? "Loading LGAs..."
                  : !formData.stateOfResidence
                  ? "Select state first"
                  : "Select local government"}
              </option>
              {lgaOptions.map((lga) => (
                <option key={lga.value} value={lga.value}>
                  {lga.label}
                </option>
              ))}
            </select>
            {errors.localGovernment && (
              <p className="mt-1 text-sm text-red-500">
                Local government is required.
              </p>
            )}
          </div>

          {/* Passport Photo */}
          <div>
            <Label htmlFor="passport">Passport Photo (Optional)</Label>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-4 flex items-center gap-4">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Passport preview"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none"
                  >
                    ×
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Image uploaded successfully</p>
                  <p className="text-xs">
                    Size: {Math.round((imagePreview.length * 3) / 4 / 1024)} KB
                  </p>
                </div>
              </div>
            )}

            {/* File Input */}
            <div className="mt-1">
              <input
                type="file"
                id="passport"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300 dark:text-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum file size: 50KB. Supported formats: JPEG, JPG, PNG, GIF
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
              onClick={() => {
                // Clear file input
                const fileInput = document.getElementById(
                  "passport"
                ) as HTMLInputElement;
                if (fileInput) {
                  fileInput.value = "";
                }

                setFormData({
                  firstName: "",
                  lastName: "",
                  role: "",
                  stateOfResidence: "",
                  localGovernment: "",
                  email: "",
                  passport: "",
                  phoneNumber: "",
                });
                setErrors({
                  firstName: false,
                  lastName: false,
                  role: false,
                  stateOfResidence: false,
                  localGovernment: false,
                  email: false,
                  phoneNumber: false,
                });
                setSuccess({});
                setLgaOptions([]);
                setImagePreview("");
              }}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "Adding User..." : "Add User"}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
