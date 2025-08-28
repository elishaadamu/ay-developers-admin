import { useState, useEffect } from "react";
import axios from "axios";
import { message, DatePicker } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import UserTable from "./UserTable";
import AddUserModal from "./AddUserModal";
import PerformanceModal from "./PerformanceModal";
import { apiUrl, API_CONFIG } from "../../utilities/config";
import { User } from "../../types/user";

dayjs.extend(isBetween);

export default function Ambassador() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState<"day" | "month">(
    "day"
  );
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);

  // Fetch Ambassadors from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching Ambassadors from API...");
      const response = await axios.get(
        apiUrl(`${API_CONFIG.ENDPOINTS.AUTH.GetUsers}`)
      );

      console.log("✅ Ambassadors fetched successfully:", response.data);

      // Filter to ensure we only get Ambassadors
      const ambassadors = (response.data.users || response.data || []).filter(
        (user: User) => user.role === "ambassador"
      );

      setUsers(ambassadors);
    } catch (error) {
      console.error("❌ Error fetching Ambassadors:", error);
      message.error("Failed to fetch Ambassadors");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Add user via API
  const addUser = async (
    userData: Pick<
      User,
      "firstName" | "lastName" | "email" | "phone" | "photo"
    > & { password?: string }
  ): Promise<void> => {
    try {
      const payload = {
        ...userData,
        role: "ambassador",
        createdAt: new Date().toISOString(), // Changed from createdDate to createdAt
        status: "Active",
        suspended: false,
      };

      console.log("📤 Sending user creation payload:", payload);
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.AddUsers),
        payload
      );

      console.log("✅ Ambassador added successfully:", response.data);
      message.success("Ambassador added successfully");

      await fetchUsers();
      setShowAddModal(false);
    } catch (error) {
      console.error("❌ Error adding Ambassador:", error);
      if (axios.isAxiosError(error)) {
        console.error("📋 Error response:", error.response?.data);
        console.error("📊 Error status:", error.response?.status);
      }
      throw error;
    }
  };

  // Update user via API
  const updateUser = async (
    userId: string | number,
    userData: Partial<User>
  ) => {
    try {
      console.log("🔄 Updating Ambassador:", userId, userData);
      const response = await axios.put(
        apiUrl(`${API_CONFIG.ENDPOINTS.AUTH.UpdateUser}${userId}`), // Fixed endpoint
        userData
      );

      console.log("✅ Ambassador updated successfully:", response.data);
      message.success("Ambassador updated successfully");

      await fetchUsers();
    } catch (error) {
      console.error("❌ Error updating Ambassador:", error);
      if (axios.isAxiosError(error)) {
        console.error("📋 Error response:", error.response?.data);
        console.error("📊 Error status:", error.response?.status);
        message.error(
          error.response?.data?.message || "Failed to update Ambassador"
        );
      } else {
        message.error("Failed to update Ambassador");
      }
      throw error;
    }
  };

  // Delete user via API
  const deleteUser = async (userId: string | number) => {
    try {
      console.log("🗑️ Deleting Ambassador:", userId);
      const response = await axios.delete(
        apiUrl(`${API_CONFIG.ENDPOINTS.AUTH.DeleteUser}${userId}`) // Fixed endpoint
      );

      console.log("✅ Ambassador deleted successfully:", response.data);
      message.success("Ambassador deleted successfully");

      await fetchUsers();
    } catch (error) {
      console.error("❌ Error deleting Ambassador:", error);
      if (axios.isAxiosError(error)) {
        console.error("📋 Error response:", error.response?.data);
        console.error("📊 Error status:", error.response?.status);
        message.error(
          error.response?.data?.message || "Failed to delete Ambassador"
        );
      } else {
        message.error("Failed to delete Ambassador");
      }
    }
  };

  // Handle performance view
  const handleViewPerformance = (user: User) => {
    setSelectedUser(user);
    setShowPerformanceModal(true);
  };

  // Handle suspend/activate user using specific endpoints
  const handleSuspendUser = async (user: User) => {
    try {
      const userId = user._id || user.id!;
      const isSuspended = user.suspended === true; // Check current suspended status

      console.log(
        `🔄 ${isSuspended ? "Activating" : "Suspending"} Ambassador:`,
        userId,
        `Current suspended status: ${user.suspended}`
      );

      let response;
      if (isSuspended) {
        // User is currently suspended (suspended: true), so ACTIVATE them
        response = await axios.patch(
          apiUrl(`${API_CONFIG.ENDPOINTS.AUTH.ActivateUser}${userId}`)
        );
        console.log("✅ Ambassador activated successfully:", response.data);
        message.success("Ambassador activated successfully");
      } else {
        // User is currently active (suspended: false), so SUSPEND them
        response = await axios.patch(
          apiUrl(`${API_CONFIG.ENDPOINTS.AUTH.SuspendUser}${userId}`)
        );
        console.log("✅ Ambassador suspended successfully:", response.data);
        message.success("Ambassador suspended successfully");
      }

      await fetchUsers();
    } catch (error) {
      console.error("❌ Error updating Ambassador status:", error);
      if (axios.isAxiosError(error)) {
        console.error("📋 Error response:", error.response?.data);
        console.error("📊 Error status:", error.response?.status);
        message.error(
          error.response?.data?.message || "Failed to update Ambassador status"
        );
      } else {
        message.error("Failed to update Ambassador status");
      }
      throw error;
    }
  };

  // Update the filter logic to handle suspended boolean and ensure role filtering
  const filteredUsers = users.filter((user) => {
    // First, ensure this is an Ambassador
    if (user.role !== "ambassador") {
      return false;
    }

    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Update status filter logic to handle suspended boolean
    let matchesStatus = true;
    if (statusFilter) {
      if (statusFilter === "Suspended") {
        matchesStatus = user.suspended === true;
      } else if (statusFilter === "Active") {
        matchesStatus = user.suspended === false && user.status === "Active";
      } else {
        matchesStatus = user.status === statusFilter;
      }
    }

    const matchesDate =
      !dateRange[0] ||
      !dateRange[1] ||
      dayjs(user.createdAt).isBetween(dateRange[0], dateRange[1], "day", "[]");

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleDateRangeChange: RangePickerProps["onChange"] = (dates) => {
    setDateRange(dates || [null, null]);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <PageMeta
        title="AY Developers | Ambassadors"
        description="Manage Ambassadors and track their performance"
      />
      <PageBreadcrumb pageTitle="Ambassadors Management" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header Section with Action Buttons */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="mb-2 font-semibold text-gray-800 dark:text-white/90 text-xl md:text-xl">
              Ambassadors Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-[12px] md:text-sm">
              Manage Ambassadors, track performance, and handle user operations
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-2 w-full mt-[0px] md:mt-[-20px]">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-[11px] md:text-[14px] font-medium text-white hover:bg-blue-700"
            >
              Add Ambassador
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search Ambassadors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Date Range Picker */}
          <DatePicker.RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-full sm:w-auto dark:bg-gray-700"
            placeholder={["Start date", "End date"]}
            style={{ borderRadius: "0.375rem" }}
          />
        </div>

        {/* Users Table */}
        <UserTable
          users={filteredUsers}
          loading={loading}
          onDelete={deleteUser}
          onUpdate={updateUser}
          onViewPerformance={handleViewPerformance}
          onSuspend={handleSuspendUser}
        />

        {/* Modals */}
        <AddUserModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={addUser}
          defaultRole="Ambassador"
        />

        <PerformanceModal
          open={showPerformanceModal}
          onClose={() => {
            setShowPerformanceModal(false);
            setSelectedUser(null);
          }}
          user={
            selectedUser
              ? {
                  ...selectedUser,
                  createdDate: selectedUser.createdAt,
                  role:
                    selectedUser.role === "ambassador"
                      ? "Ambassador"
                      : selectedUser.role === "manager"
                      ? "S/G Manager"
                      : "Customer",
                }
              : null
          }
          timeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
        />
      </div>
    </div>
  );
}
