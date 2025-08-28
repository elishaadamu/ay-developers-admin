import { useEffect, useState } from "react";
import { Modal, notification, Upload, Button as AntButton, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { decryptData, encryptData } from "../../utilities/encryption";
import { API_CONFIG, apiUrl } from "../../utilities/config";
import axios from "axios";

interface UserData {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  photo?: string;
  country?: string;
  state?: string;
}

export default function UserInfoCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<UserData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [fetchUserData, setFetchUserData] = useState<UserData | null>(null);
  const [api, contextHolder] = notification.useNotification();
  const [isDataLoading, setIsDataLoading] = useState(true); // Loading state

  useEffect(() => {
    // Decrypt and load user data when component mounts
    try {
      const encryptedUserData = localStorage.getItem("userData");

      if (encryptedUserData) {
        const decryptedUserData = decryptData(encryptedUserData);
        setUserData(decryptedUserData);
        setFormData(decryptedUserData);
      }
    } catch (error) {
      console.error("Failed to decrypt user data:", error);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const uploadProps = {
    accept: "image/*",
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        api.error({
          message: "Invalid file type",
          description: "You can only upload image files!",
          placement: "topRight",
        });

        // Also show browser alert
        alert("Invalid file type! You can only upload image files.");
        return false;
      }

      const fileSizeKB = file.size / 1024;
      const isLt50KB = fileSizeKB < 50;

      if (!isLt50KB) {
        const errorMessage = `File too large! Image size is ${Math.round(
          fileSizeKB
        )}KB. Please select an image smaller than 50KB.`;

        // Show Ant Design notification
        api.error({
          message: "File too large",
          description: errorMessage,
          placement: "topRight",
          duration: 6,
        });

        return false;
      }

      handleImageUpload(file);
      return false; // Prevent default upload
    },
    showUploadList: false,
  };

  const handleImageUpload = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;

        setFormData((prev) => {
          const newData = {
            ...prev,
            photo: base64String,
          };

          return newData;
        });

        // Show success notification
        api.success({
          message: "Image uploaded successfully!",
          description: "Profile picture has been updated",
          placement: "topRight",
          duration: 3,
        });

        resolve(base64String);
      };
      reader.onerror = (error) => {
        const errorMessage = "Failed to process the image. Please try again.";

        api.error({
          message: "Upload failed",
          description: errorMessage,
          placement: "topRight",
        });

        // Show alert for upload failure
        alert(errorMessage);

        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Create payload with userId
      const payload = {
        userId: userData?.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        photo: formData.photo,
        country: formData.country,
        state: formData.state,
      };

      const response = await axios.patch(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.UserUpdate),
        payload
      );
      console.log("Update response:", response.data);
      // Update local storage with new encrypted data
      const updatedUserData = response.data.user;
      const encryptedUserData = encryptData(updatedUserData);
      localStorage.setItem("userData", encryptedUserData);

      // Update component state
      setUserData(updatedUserData);

      api.success({
        message: "Success!",
        description: "Profile updated successfully.",
        placement: "topRight",
        duration: 0,
      });

      setIsModalOpen(false);

      // Refresh the page after a short delay to ensure user sees the success message
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      api.error({
        message: "Update Failed",
        description: errorMessage,
        placement: "topRight",
        duration: 5,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update the useEffect that fetches data
  useEffect(() => {
    const dbUsername = async () => {
      try {
        setIsDataLoading(true);
        const dbUser = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.AUTH.UserData + userData?.id)
        );
        setFetchUserData(dbUser.data.user);
        console.log("db Update", dbUser.data.user);
      } catch (error) {
        console.log(error);
        api.error({
          message: "Error",
          description: "Failed to load user data",
          placement: "topRight",
        });
      } finally {
        setIsDataLoading(false);
      }
    };
    if (userData?.id) {
      dbUsername();
    }
  }, [userData?.id]);

  const openModal = () => {
    try {
      if (fetchUserData) {
        // Create a new object with only the fields we want to edit
        const initialFormData = {
          firstName: fetchUserData.firstName || "",
          lastName: fetchUserData.lastName || "",
          email: fetchUserData.email || "",
          phone: fetchUserData.phone || "",
          country: fetchUserData.country || "",
          state: fetchUserData.state || "",
          photo: fetchUserData.photo || "",
        };
        setFormData(initialFormData);
      }
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to set form data:", error);
      setFormData({});
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(userData || {});
  };

  return (
    <>
      {contextHolder}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        {isDataLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Spin size="large" tip="Loading user data..." />
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                Personal Information
              </h4>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    First Name
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {fetchUserData?.firstName || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Last Name
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {userData?.lastName || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Email address
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {fetchUserData?.email || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Phone
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {fetchUserData?.phone || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Country
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {fetchUserData?.country || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    State
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {fetchUserData?.state || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Role
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90 uppercase">
                    {userData?.role || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={openModal}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            >
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                  fill=""
                />
              </svg>
              Edit
            </button>
          </div>
        )}

        {/* Keep Modal outside of loading check */}
        <Modal
          title="Edit Personal Information"
          open={isModalOpen}
          onCancel={closeModal}
          footer={null}
          width={700}
          className="custom-modal "
        >
          <div className="py-4">
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Update your details to keep your profile up-to-date.
            </p>

            <div className="space-y-6">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 overflow-hidden border-2 border-gray-200 rounded-full dark:border-gray-700">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <Upload {...uploadProps}>
                  <AntButton
                    icon={<UploadOutlined />}
                    className="border-gray-300 hover:border-blue-400"
                  >
                    Change Profile Picture
                  </AntButton>
                </Upload>

                {/* Add this for debugging */}
                {formData.photo && (
                  <p className="text-xs text-gray-500 text-center">
                    Image uploaded successfully
                  </p>
                )}
              </div>

              {/* Personal Information */}
              <div>
                <h5 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-800">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ""}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label>Last Name</Label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ""}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label>Phone</Label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label>Country</Label>
                    <Input
                      type="text"
                      name="country"
                      value={formData.country || ""}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="Enter your country"
                    />
                  </div>

                  <div>
                    <Label>State</Label>
                    <Input
                      type="text"
                      name="state"
                      value={formData.state || ""}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="Enter your state"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 justify-end text-white dark:text-white/90">
              <Button
                size="sm"
                variant="outline"
                onClick={closeModal}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
