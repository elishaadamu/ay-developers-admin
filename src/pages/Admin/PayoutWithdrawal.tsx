import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Dropdown,
  Spin,
  Empty,
} from "antd";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { MoreOutlined } from "@ant-design/icons";
import Badge from "../../components/ui/badge/Badge";
import axios from "axios";
import { apiUrl, API_CONFIG } from "../../utilities/config";
import { decryptData } from "../../utilities/encryption";

export default function PayoutWithdrawal() {
  const encryptedUserData = localStorage.getItem("userData");
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // ✅ new state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [form] = Form.useForm();

  // The decrypted data is an object, not a string.
  // We can give it a basic type to solve the error.
  const decryptedUserData: { id: string } | null = encryptedUserData
    ? decryptData(encryptedUserData)
    : null;

  if (!decryptedUserData) {
    message.error("User is not logged in.");
    // Return null for components that shouldn't render
    return null;
  }

  // ✅ fetch withdrawals
  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        apiUrl(`${API_CONFIG.ENDPOINTS.AUTH.getPendingWithdrawals}`)
      );

      const withdrawalsArray = Array.isArray(response.data.data)
        ? response.data.data
        : Object.values(response.data.data || {});

      setWithdrawals(withdrawalsArray);
    } catch (e) {
      console.error("Failed to fetch withdrawals:", e);
      message.error("Failed to fetch withdrawals");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ update withdrawal API
  const updateWithdrawal = async (values: any) => {
    if (!selectedWithdrawal?._id) return;

    const payload = {
      status: values.status,
      adminId: decryptedUserData.id,
      cancellationReason: values.cancellationReason || "",
      transactionReference: values.transactionReference,
    };

    setIsSubmitting(true); // start loading

    try {
      await axios.patch(
        apiUrl(
          `${API_CONFIG.ENDPOINTS.AUTH.updateWithdrawal}${selectedWithdrawal._id}`
        ),
        payload
      );

      message.success("Withdrawal updated successfully");
      setIsModalOpen(false);
      fetchWithdrawals(); // refresh list
      form.resetFields(); // clear modal form
    } catch (e) {
      console.error("Failed to update withdrawal:", e);
      message.error("Failed to update withdrawal");
    } finally {
      setIsSubmitting(false); // stop loading
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // ✅ menu for each withdrawal row
  const getActionMenu = (withdrawal: any) => {
    return [
      {
        key: "updateWithdrawal",
        label: (
          <div className="flex items-center gap-2 px-3 py-2 text-green-600 hover:text-green-800">
            Update Withdrawal
          </div>
        ),
        onClick: () => {
          setSelectedWithdrawal(withdrawal);
          form.setFieldsValue({
            status: withdrawal.status,
            transactionReference: withdrawal.transactionReference,
            cancellationReason: withdrawal.cancellationReason,
          });
          setIsModalOpen(true);
        },
      },
    ];
  };

  return (
    <>
      <PageMeta title="Withdrawals" description="Manage Withdrawals" />
      <PageBreadcrumb pageTitle="Manage Withdrawals" />

      <Card className="p-4 mt-4 shadow-md rounded-2xl">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : withdrawals.length === 0 ? (
          <Empty description="No withdrawals found" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Account Name</TableCell>
                <TableCell>Account Number</TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal, index) => (
                <TableRow key={index}>
                  <>
                    <TableCell className=" py-3 text-gray-500 text-start text-theme-sm">
                      {withdrawal.bankDetails?.accountName}
                    </TableCell>
                    <TableCell className=" py-3 text-gray-500 text-start text-theme-sm">
                      {withdrawal.bankDetails?.accountNumber}
                    </TableCell>
                    <TableCell className=" py-3 text-gray-500 text-start text-theme-sm">
                      {withdrawal.bankDetails?.bankName}
                    </TableCell>
                    <TableCell className=" py-3 text-gray-500 text-start text-theme-sm">
                      <Badge
                        size="sm"
                        color={
                          withdrawal.status === "approved"
                            ? "success"
                            : withdrawal.status === "pending"
                            ? "warning"
                            : "error"
                        }
                      >
                        {withdrawal.status}
                      </Badge>
                    </TableCell>
                    <TableCell className=" py-3 text-gray-500 text-theme-sm">
                      ₦{withdrawal.amount}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex justify-center">
                        <Dropdown
                          menu={{ items: getActionMenu(withdrawal) }}
                          trigger={["click"]}
                          placement="bottomRight"
                          arrow={{ pointAtCenter: true }}
                          overlayStyle={{ minWidth: "180px" }}
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
                  </>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* ✅ Update Withdrawal Modal */}
      <Modal
        title="Update Withdrawal"
        open={isModalOpen}
        onCancel={() => !isSubmitting && setIsModalOpen(false)} // disable closing while submitting
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={updateWithdrawal}>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="cancelled">Cancelled</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Transaction Reference" name="transactionReference">
            <Input />
          </Form.Item>

          <Form.Item shouldUpdate={(prev, curr) => prev.status !== curr.status}>
            {({ getFieldValue }) =>
              getFieldValue("status") === "cancelled" ? (
                <Form.Item
                  label="Cancellation Reason"
                  name="cancellationReason"
                  rules={[
                    { required: true, message: "Please provide a reason" },
                  ]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isSubmitting} // ✅ spinner
              disabled={isSubmitting} // ✅ prevents double submit
            >
              {isSubmitting ? "Updating..." : "Update Withdrawal"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
