import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { Table, Tabs, Badge, Modal, Dropdown, Menu } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import axios from "axios";
import { apiUrl, API_CONFIG } from "../../utilities/config";
import { decryptData } from "../../utilities/encryption";
import { ToastContainer, toast } from "react-toastify";
import dayjs from "dayjs";

const { TabPane } = Tabs;

export default function Promotions() {
  const [loading, setLoading] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  // Decrypt user
  useEffect(() => {
    try {
      const encryptedUserData = localStorage.getItem("userData");
      if (encryptedUserData) {
        decryptData(encryptedUserData);
      }
    } catch (error) {
      console.error("Failed to decrypt user data:", error);
    }
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.getPromotions)
      );
      console.log("Fetched promotions:", response.data);

      const sorted = (response.data || []).sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPromotions(sorted);
    } catch (error) {
      console.error("❌ Error fetching promotions:", error);
      toast.error("Failed to fetch promotions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // 🔑 Update status
  const toApprove = async (id: string, transactionReference: string) => {
    const payload = {
      status: "approved",
      transactionReference, // include it here
    };
    console.log("Payload for approval:", payload);
    try {
      const response = await axios.put(
        `${apiUrl(API_CONFIG.ENDPOINTS.AUTH.updatePromotion)}${id}`,
        payload
      );
      console.log("Promotion updated:", response.data);
      toast.success("Status updated to Approved");
      fetchPromotions(); // refresh table
    } catch (error: any) {
      console.error("❌ Error updating status:", error);
      toast.error(error.response?.data?.error || "Failed to update");
    }
  };

  const toReject = async (id: string, transactionReference: string) => {
    const payload = {
      status: "rejected",
      transactionReference, // include it here
    };
    try {
      const response = await axios.put(
        `${apiUrl(API_CONFIG.ENDPOINTS.AUTH.updatePromotion)}${id}`,
        payload
      );
      console.log("Promotion updated:", response.data);
      toast.success("Status updated to Rejected");
      fetchPromotions(); // refresh table
    } catch (error: any) {
      console.error("❌ Error updating status:", error.response.data.error);
      toast.error(error.response.data.error);
    }
  };

  // 📊 Table columns
  const promotionsColumns = [
    {
      title: "Name",
      key: "name",
      render: (_: any, record: any) =>
        `${record.firstName || ""} ${record.lastName || ""}`,
    },
    {
      title: "Date Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("MMM D, YYYY h:mm A"),
    },
    {
      title: "Receipt",
      dataIndex: "paymentReceipt",
      key: "paymentReceipt",
      render: (url: string) =>
        url ? (
          <a
            onClick={() => {
              setSelectedReceipt(url);
              setReceiptModalVisible(true);
            }}
          >
            View
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge
          status={
            status === "approved"
              ? "success"
              : status === "rejected"
              ? "error"
              : "processing"
          }
          text={status ? status.charAt(0).toUpperCase() + status.slice(1) : ""}
        />
      ),
    },
    {
      title: "Transaction Reference",
      dataIndex: "transactionReference",
      key: "transactionReference",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        const menu = (
          <Menu>
            <Menu.Item
              onClick={() => toApprove(record._id, record.transactionReference)}
            >
              Approve
            </Menu.Item>
            <Menu.Item
              onClick={() => toReject(record._id, record.transactionReference)}
            >
              Reject
            </Menu.Item>
          </Menu>
        );
        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <EllipsisOutlined style={{ fontSize: 20, cursor: "pointer" }} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <PageMeta
        title="AY Developers - Promotions"
        description="Manage your sales and promotions"
      />
      <PageBreadcrumb pageTitle="Promotions" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Track button on the right */}
        <div className="flex justify-end mb-4"></div>

        <Tabs defaultActiveKey="submit">
          <TabPane tab="Total Sales" key="submit">
            <Table
              columns={promotionsColumns}
              dataSource={promotions}
              rowKey="_id"
              loading={loading}
            />
          </TabPane>
          <TabPane tab="Pending" key="pending">
            <Table
              columns={promotionsColumns}
              dataSource={promotions.filter((p) => p.status === "pending")}
              rowKey="_id"
              loading={loading}
            />
          </TabPane>
          <TabPane tab="Approved" key="approved">
            <Table
              columns={promotionsColumns}
              dataSource={promotions.filter((p) => p.status === "approved")}
              rowKey="_id"
              loading={loading}
            />
          </TabPane>
          <TabPane tab="Rejected" key="rejected">
            <Table
              columns={promotionsColumns}
              dataSource={promotions.filter((p) => p.status === "rejected")}
              rowKey="_id"
              loading={loading}
            />
          </TabPane>
        </Tabs>
      </div>

      {/* Receipt Preview Modal */}
      <Modal
        open={receiptModalVisible}
        footer={null}
        onCancel={() => setReceiptModalVisible(false)}
        width={600}
      >
        {selectedReceipt && (
          <img
            src={selectedReceipt}
            alt="Payment Receipt"
            style={{ width: "100%" }}
          />
        )}
      </Modal>
    </>
  );
}
