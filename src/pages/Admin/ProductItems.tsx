import { useState, useEffect } from "react";
import axios from "axios";
import { message, DatePicker } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ProductTable from "../../components/ecommerce/ProductTable";
import AddProductModal from "../../components/ecommerce/AddProductsModal";
import PerformanceModal from "../../components/ecommerce/PerformanceModal";
import SGListModal from "../../components/ecommerce/SGListModal";
import { apiUrl, API_CONFIG } from "../../utilities/config";
import { decryptData } from "../../utilities/encryption";

dayjs.extend(isBetween);

// Update the interface to handle _id from API
interface Product {
  id?: number;
  _id?: string; // Add _id for MongoDB
  name: string;
  price: number;
  description: string;
  images: string; // Changed from string[] to string since API returns base64 string
  status: "Active" | "Inactive";
  createdDate: string;
  salesCount: number;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showSGListModal, setShowSGListModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState<"day" | "month">(
    "day"
  );
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);
  const [userData, setUserData] = useState<any>(null);

  // Add useEffect to get user data
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

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching products from API...");
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.GetProducts)
      );

      console.log("✅ Products fetched successfully:", response.data);
      setProducts(response.data.products || response.data || []);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      message.error("Failed to fetch products");
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Add product via API
  const addProduct = async (
    productData: Omit<Product, "id" | "createdDate" | "salesCount">
  ): Promise<void> => {
    try {
      const payload = {
        ...productData,
        userId: userData?.id,
        createdDate: new Date().toISOString(),
        salesCount: 0,
      };

      console.log("📤 Sending product payload:", payload);
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.AddProducts),
        payload
      );

      console.log("✅ Product added successfully:", response.data);
      message.success("Product added successfully");

      // Refresh the products list
      await fetchProducts();
      setShowAddModal(false);
    } catch (error) {
      console.error("❌ Error adding product:", error);
      if (axios.isAxiosError(error)) {
        console.error("📋 Error response:", error.response?.data);
        console.error("📊 Error status:", error.response?.status);
      }
      throw error;
    }
  };

  // Update product via API
  const updateProduct = async (
    productId: string | number,
    productData: Partial<Product>
  ) => {
    try {
      console.log("🔄 Updating product:", productId, productData);
      const response = await axios.put(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.UpdateProduct + productId),
        {
          ...productData,
          userId: userData?.id,
        }
      );

      console.log("✅ Product updated successfully:", response.data);
      message.success("Product updated successfully");

      // Refresh the products list
      await fetchProducts();
    } catch (error) {
      console.error("❌ Error updating product:", error);
      if (axios.isAxiosError(error)) {
        console.error("📋 Error response:", error.response?.data);
        console.error("📊 Error status:", error.response?.status);
        message.error(
          error.response?.data?.message || "Failed to update product"
        );
      } else {
        message.error("Failed to update product");
      }
      throw error;
    }
  };

  // Delete product via API
  const deleteProduct = async (productId: string | number) => {
    try {
      console.log("🗑️ Deleting product:", productId);
      const response = await axios.delete(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.DeleteProduct + productId)
      );

      console.log("✅ Product deleted successfully:", response.data);
      message.success("Product deleted successfully");

      // Refresh the products list
      await fetchProducts();
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      if (axios.isAxiosError(error)) {
        console.error("📋 Error response:", error.response?.data);
        console.error("📊 Error status:", error.response?.status);
        message.error(
          error.response?.data?.message || "Failed to delete product"
        );
      } else {
        message.error("Failed to delete product");
      }
    }
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = product.status;

    // Add date range filtering
    const matchesDate =
      !dateRange[0] ||
      !dateRange[1] ||
      dayjs(product.createdDate).isBetween(
        dateRange[0],
        dateRange[1],
        "day",
        "[]"
      );

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Add date range change handler
  const handleDateRangeChange: RangePickerProps["onChange"] = (dates) => {
    setDateRange(dates || [null, null]);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <PageMeta
        title="AY Developers | Products"
        description="Product management and performance tracking"
      />
      <PageBreadcrumb pageTitle="Product Management" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header Section with Action Buttons */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="mb-2 font-semibold text-gray-800 dark:text-white/90 text-xl md:text-2xl">
              Products Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-[12px] md:text-sm">
              Manage products, track performance, and handle S&G lists
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-2 w-full mt-[0px] md:mt-[-20px]">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-[11px] md:text-[14px] font-medium text-white hover:bg-blue-700"
            >
              Add Product
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Date Range Picker */}
          <DatePicker.RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-full sm:w-auto dark:bg-gray-700"
            placeholder={["Start date", "End date"]}
            style={{ borderRadius: "0.375rem" }}
          />
        </div>

        {/* Products Table */}
        <ProductTable
          products={filteredProducts}
          loading={loading}
          onDelete={deleteProduct}
          onUpdate={updateProduct}
        />

        {/* Modals */}
        <AddProductModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={addProduct}
        />

        <PerformanceModal
          open={showPerformanceModal}
          onClose={() => setShowPerformanceModal(false)}
          timeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
          products={products}
        />

        <SGListModal
          open={showSGListModal}
          onClose={() => setShowSGListModal(false)}
        />
      </div>
    </div>
  );
}
