import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { notification, Dropdown } from "antd";
import type { MenuProps } from "antd";
import type { User } from "../../types/user";
import { MoreOutlined } from "@ant-design/icons";

interface UserTableProps {
  users: User[];
  loading: boolean;
  onDelete: (userId: string | number) => Promise<void>;
  onUpdate: (userId: string | number, userData: Partial<User>) => Promise<void>;
  onViewPerformance: (user: User) => void;
  onSuspend: (user: User) => Promise<void>;
  onSendReport?: (user: User) => Promise<void> | void; // <-- added
}

export default function UserTable({
  users,
  loading,
  onDelete,
  onViewPerformance,
  onSuspend,
  onSendReport,
}: UserTableProps) {
  const [api, contextHolder] = notification.useNotification();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const displayRole = (role: string) => {
    // Use toLowerCase for case-insensitive comparison
    const lowerCaseRole = role.toLowerCase();
    if (lowerCaseRole === "ambassador") return "Ambassador";
    if (lowerCaseRole === "manager") return "S/G Manager";
    if (lowerCaseRole === "customer") return "Customer";
    // Fallback for any unexpected roles.
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleDelete = async (user: User) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${user.firstName} ${user.lastName}?`
      )
    ) {
      try {
        await onDelete(user._id || user.id!);
        api.success({
          message: "User Deleted",
          description: `${user.firstName} ${user.lastName} has been successfully deleted.`,
          placement: "topRight",
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        api.error({
          message: "Deletion Failed",
          description:
            "There was an error deleting the user. Please try again.",
          placement: "topRight",
        });
      }
    }
  };

  const handleSuspend = async (user: User) => {
    const currentlySuspended = user.suspended === true;
    const action = currentlySuspended ? "reactivate" : "suspend";
    const actionPastTense = currentlySuspended ? "reactivated" : "suspended";

    if (
      window.confirm(
        `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`
      )
    ) {
      try {
        await onSuspend(user);
        api.success({
          message: "Status Updated",
          description: `${user.firstName} ${user.lastName} has been successfully ${actionPastTense}.`,
          placement: "topRight",
        });
      } catch (error) {
        console.error("Error updating user status:", error);
        api.error({
          message: "Update Failed",
          description: `There was an error ${action}ing the user. Please try again.`,
          placement: "topRight",
        });
      }
    }
  };

  // Define the type for menu items
  type MenuItem = Required<MenuProps>["items"][number];

  // Update the getActionMenu function
  const getActionMenu = (user: User): MenuItem[] => {
    const currentlySuspended = user.suspended === true;

    const items: MenuItem[] = [
      {
        key: "performance",
        label: (
          <div className="flex items-center gap-2 px-3 py-2 text-green-600 hover:text-green-800">
            {/* ...icon... */}
            View Performance
          </div>
        ),
        onClick: () => onViewPerformance(user),
      },
      {
        key: "sendReport", // <-- new item
        label: (
          <div className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8"
              />
            </svg>
            Send Report
          </div>
        ),
        onClick: () => {
          if (onSendReport) onSendReport(user);
        },
      },
      {
        key: "suspend",
        label: (
          <div
            className={`flex items-center gap-2 px-3 py-2 ${
              currentlySuspended
                ? "text-blue-600 hover:text-blue-800"
                : "text-yellow-600 hover:text-yellow-800"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  currentlySuspended
                    ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                }
              />
            </svg>
            {currentlySuspended ? "Reactivate" : "Suspend"}
          </div>
        ),
        onClick: () => handleSuspend(user),
      },
      {
        type: "divider",
      } as MenuItem,
      {
        key: "delete",
        label: (
          <div className="flex items-center gap-2 px-3 py-2 text-red-700 hover:text-white">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete User
          </div>
        ),
        onClick: () => handleDelete(user),
        danger: true,
      },
    ];

    return items;
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Phone
                </TableCell>

                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Created Date
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No users found. Add your first user to get started.
                  </td>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user._id || user.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {user.photo ? (
                            <img
                              src={user.photo}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-600 dark:text-blue-300 font-medium text-sm">
                              {user.firstName.charAt(0)}
                              {user.lastName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {displayRole(user.role)}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 text-gray-500 dark:text-gray-400">
                      {user.email}
                    </TableCell>

                    <TableCell className="py-4 text-gray-500 dark:text-gray-400">
                      {user.phone || "N/A"}
                    </TableCell>

                    <TableCell className="py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex justify-center">
                        <Dropdown
                          menu={{ items: getActionMenu(user) }}
                          trigger={["click"]}
                          placement="bottomRight"
                          arrow={{ pointAtCenter: true }}
                          overlayStyle={{
                            minWidth: "180px",
                          }}
                          overlayClassName="user-actions-dropdown"
                        >
                          <button
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            onClick={(e) => e.preventDefault()}
                          >
                            <MoreOutlined
                              className="text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
                              style={{ fontSize: "16px", color: "grey" }}
                            />
                          </button>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
