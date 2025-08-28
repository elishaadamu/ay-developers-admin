import { useEffect, useState } from "react";
import { decryptData } from "../../utilities/encryption";
import axios from "axios";
import { API_CONFIG, apiUrl } from "../../utilities/config";
import { Spin } from "antd";

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  photo?: string;
  country?: string;
  state?: string;
}

export default function UserMetaCard() {
  const [fetchUserData, setFetchUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const encryptedUserData = localStorage.getItem("userData");
        if (encryptedUserData) {
          const decryptedUserData = decryptData(encryptedUserData);

          // Fetch latest user data from API
          const dbUser = await axios.get(
            apiUrl(API_CONFIG.ENDPOINTS.AUTH.UserData + decryptedUserData.id)
          );
          setFetchUserData(dbUser.data.user);
        }
      } catch (error) {
        console.error("❌ UserMetaCard - Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fullName =
    fetchUserData?.firstName && fetchUserData?.lastName
      ? `${fetchUserData.firstName} ${fetchUserData.lastName}`
      : fetchUserData?.firstName || fetchUserData?.lastName || "User";

  const location =
    fetchUserData?.country && fetchUserData?.state
      ? `${fetchUserData.state}, ${fetchUserData.country}`
      : fetchUserData?.country ||
        fetchUserData?.state ||
        "Location not provided";

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Spin size="large" tip="Loading profile..." />
          </div>
        ) : (
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
              <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                {fetchUserData?.photo ? (
                  <img
                    src={fetchUserData.photo}
                    alt="user"
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
              <div className="order-3 xl:order-2">
                <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                  {fullName}
                </h4>
                <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                  <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                    {fetchUserData?.role || "User"}
                  </p>
                  <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
