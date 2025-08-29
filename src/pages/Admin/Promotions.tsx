import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import {
  Form,
  Select,
  InputNumber,
  Input,
  Upload,
  Button,
  Table,
  Tabs,
  Badge,
  Modal,
  Dropdown,
  Menu,
  Switch,
} from "antd";
import { UploadOutlined, EllipsisOutlined } from "@ant-design/icons";
import axios from "axios";
import { apiUrl, API_CONFIG } from "../../utilities/config";
import { decryptData } from "../../utilities/encryption";
import { ToastContainer, toast } from "react-toastify";
import dayjs from "dayjs";

const { TabPane } = Tabs;

interface Product {
  _id: string;
  name: string;
  price: number;
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
}

type SaleStatus = "pending" | "approved" | "rejected";

interface Sale {
  _id: string;
  productId?: Product;
  quantity: number;
  transactionReference: string;
  status: SaleStatus;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  paymentReceipt?: string;
}

// 🔑 Convert file -> base64
const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function Promotions() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [promotions, setPromotions] = useState<Sale[]>([]);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "submission">("view");
  const [products, setProducts] = useState<Product[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<string>("");

  // Decrypt user
  useEffect(() => {
    try {
      const encryptedUserData = localStorage.getItem("userData");
      if (encryptedUserData) {
        const decryptedUserData = decryptData(encryptedUserData);
        setUserData(decryptedUserData);
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

  // 🔑 Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.GetProducts)
      );
      const rawProducts = response.data.products || response.data || [];
      const sorted = rawProducts.sort((a: Product, b: Product) =>
        a.name.localeCompare(b.name, "en", { sensitivity: "base" })
      );
      setProducts(sorted);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      toast.error("Failed to fetch products");
      setProducts([]);
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

  // 🔑 Post sales
  const postSales = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        firstName: userData?.firstName || "Admin",
        lastName: userData?.lastName || "User",
        productId: values.products,
        quantity: values.quantity,
        submittedBy: userData?.id || "",
        transactionReference: values.transactionReference,
        paymentReceipt: paymentReceipt, // base64 receipt
      };

      console.log("Submitting sale with payload:", payload);
      await axios.post(apiUrl(API_CONFIG.ENDPOINTS.AUTH.SubmitSale), payload);

      toast.success("Sale submitted successfully!");
      form.resetFields();
      setPaymentReceipt("");
      fetchPromotions(); // refresh promotions table
      setMode("view"); // switch back to view mode
    } catch (error: any) {
      console.error("❌ Error submitting sale:", error);
      toast.error(error.response?.data?.error || "Failed to submit sale");
    } finally {
      setLoading(false);
    }
  };

  // 🔑 Initial load for products for the form
  useEffect(() => {
    if (mode === "submission") {
      fetchProducts();
    }
  }, [mode]);

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

        <div className="mb-6 flex items-center justify-center gap-4">
          <span className={mode === "view" ? "font-semibold" : ""}>
            View All Sales
          </span>
          <Switch
            checked={mode === "submission"}
            onChange={(checked) => setMode(checked ? "submission" : "view")}
          />
          <span className={mode === "submission" ? "font-semibold" : ""}>
            Manual Submission
          </span>
        </div>

        {mode === "submission" ? (
          <Form
            form={form}
            layout="vertical"
            className="mx-auto max-w-2xl"
            onFinish={postSales}
          >
            {/* Product select */}
            <Form.Item
              name="products"
              label="Select Products"
              rules={[{ required: true, message: "Please select products" }]}
            >
              <Select placeholder="Select products" className="w-full">
                {products.map((product) => (
                  <Select.Option key={product._id} value={product._id}>
                    {product.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* Quantity */}
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: "Please enter quantity" }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>

            {/* Transaction Reference */}
            <Form.Item
              name="transactionReference"
              label="Transaction Reference"
              rules={[
                {
                  required: true,
                  message: "Please enter transaction reference",
                },
              ]}
            >
              <Input placeholder="Enter transaction reference" />
            </Form.Item>

            {/* Upload Receipt */}
            <Form.Item
              name="paymentReceipt"
              label="Upload Payment Receipt"
              rules={[{ required: true, message: "Please upload receipt" }]}
            >
              <Upload
                listType="picture"
                beforeUpload={async (file) => {
                  const isLt50KB = file.size / 1024 < 50;
                  if (!isLt50KB) {
                    toast.error("❌ File size must be less than 50KB");
                    return Upload.LIST_IGNORE;
                  }
                  const base64 = await getBase64(file);
                  setPaymentReceipt(base64);
                  return false;
                }}
                accept="image/*"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full"
              >
                Submit Sale
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Tabs defaultActiveKey="pending">
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
        )}
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
