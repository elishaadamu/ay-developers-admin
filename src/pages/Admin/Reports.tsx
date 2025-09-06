import { useState, useEffect } from "react";
import {
  Card,
  Statistic,
  DatePicker,
  Select,
  Button,
  Spin,
  Table,
  message,
} from "antd";
import {
  DownloadOutlined,
  ShoppingOutlined,
  UserOutlined,
  TrophyOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { RangePickerProps } from "antd/es/date-picker";
import dayjs from "dayjs";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { API_CONFIG, apiUrl } from "../../utilities/config";
import axios from "axios";
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ReportData {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  salesGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
}

interface SalesData {
  date: string;
  sales: number;
  orders: number;
  customers: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Ambassador {
  _id: string;
  userId: User;
  productId: Product;
  amount: number;
  currency: string;
  status: string;
  transactionRef: string;
  createdAt: string;
  paidAt: string;
  paymentGateway: string;
}

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData>({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    salesGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    productsGrowth: 0,
  });
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([dayjs().subtract(30, "day"), dayjs()]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true); // For main table and related stats
  const [period, setPeriod] = useState<string>("daily");
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false); // For products card
  const [isFetchingUsers, setIsFetchingUsers] = useState<boolean>(false); // For users card

  const handleDateRangeChange: RangePickerProps["onChange"] = (dates) => {
    setDateRange(dates || [null, null]);
  };

  const handleExportCSV = () => {
    if (ambassadors.length === 0) {
      message.warning("No data to export.");
      return;
    }
    const csvData = ambassadors.map((ambassador) => ({
      "Ambassador Name": ambassador.userId
        ? `${ambassador.userId.firstName} ${ambassador.userId.lastName}`
        : "N/A",
      Email: ambassador.userId?.email || "N/A",
      Amount: `${ambassador.currency} ${ambassador.amount}`,
      Status: ambassador.status,
      "Transaction Date": dayjs(ambassador.createdAt).format(
        "MMM DD, YYYY HH:mm"
      ),
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(","), // Header
      ...csvData.map((row) => Object.values(row).join(",")), // Rows
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sales_report_${dayjs().format("YYYY-MM-DD")}.csv`;
    link.click();
    message.success("CSV file downloaded successfully");
  };

  const handleExportPDF = () => {
    if (ambassadors.length === 0) {
      message.warning("No data to export.");
      return;
    }
    message.loading({ content: "Generating PDF report...", key: "pdfExport" });

    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(16);
      doc.text("Ambassador Sales Report", 14, 15);

      // Add date range
      doc.setFontSize(10);
      const dateRangeText =
        dateRange[0] && dateRange[1]
          ? `Period: ${dateRange[0].format(
              "MMM DD, YYYY"
            )} - ${dateRange[1].format("MMM DD, YYYY")}`
          : "All Time";
      doc.text(dateRangeText, 14, 25);

      // Add summary statistics
      doc.setFontSize(12);

      doc.setFontSize(10);
      doc.text(
        `Total Sales: ₦${reportData.totalSales.toLocaleString()}`,
        14,
        42
      );
      doc.text(`Total Orders: ${reportData.totalOrders}`, 14, 48);
      doc.text(`Total Customers: ${reportData.totalCustomers}`, 14, 54);

      // Prepare table data
      const tableData = ambassadors.map((ambassador) => [
        ambassador.userId
          ? `${ambassador.userId.firstName} ${ambassador.userId.lastName}`
          : "N/A",
        ambassador.userId?.email || "N/A",
        ambassador.productId?.name || "N/A",
        `${ambassador.currency} ${ambassador.amount.toLocaleString()}`,
        ambassador.status,
        dayjs(ambassador.createdAt).format("MMM DD, YYYY HH:mm"),
      ]);

      // Add table using jspdf-autotable
      autoTable(doc, {
        startY: 65,
        head: [
          [
            "Ambassador Name",
            "Email",
            "Product",
            "Amount",
            "Status",
            "Transaction Date",
          ],
        ],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 8 },
        margin: { top: 60 },
      });

      // Save the PDF
      const fileName = `ambassador_sales_report_${dayjs().format(
        "YYYY-MM-DD"
      )}.pdf`;
      doc.save(fileName);

      message.success({
        content: "PDF report generated successfully",
        key: "pdfExport",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      message.error({
        content: "Failed to generate PDF report",
        key: "pdfExport",
      });
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    setIsFetching(true);
    try {
      console.log("🔄 Fetching products from API...");
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.GetProducts)
      );

      setProducts(response.data);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      message.error("Failed to fetch products");
      setProducts([]); // Set empty array on error
    } finally {
      setIsFetching(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  const ambassadorColumns = [
    {
      title: "Ambassador Name",
      key: "name",
      render: (records: Ambassador) =>
        records.userId
          ? `${records.userId.firstName} ${records.userId.lastName}`
          : "N/A",
    },
    {
      title: "Email",
      key: "email",
      render: (records: Ambassador) => records.userId?.email || "N/A",
    },
    {
      title: "Product",
      key: "product",
      render: (records: Ambassador) => records.productId?.name || "N/A",
    },
    {
      title: "Amount",
      key: "amount",
      render: (record: Ambassador) =>
        `${record.currency} ${record.amount.toLocaleString()}`,
    },
    {
      title: "Status",
      key: "status",
      render: (record: Ambassador) => {
        if (record.status === "success") {
          return (
            <span className="bg-green-100 p-[6px] rounded-[16px] text-green-800">
              Completed
            </span>
          );
        } else if (record.status === "failed") {
          return (
            <span className="bg-red-100 p-2 rounded-xl text-red-800">
              Failed
            </span>
          );
        }
        return null;
      },
    },
    {
      title: "Transaction Date",
      key: "date",
      render: (record: Ambassador) =>
        dayjs(record.createdAt).format("MMM DD, YYYY HH:mm"),
    },
  ];

  const fetchUsers = async () => {
    setIsFetchingUsers(true);
    try {
      console.log("🔄 Fetching users from API...");
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.GetUsers)
      );

      console.log("✅ Users fetched successfully:", response.data);
      setUsers(response.data.length);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching orders from API...");
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.getSales)
      );

      const orders = response.data.data;

      // Filter orders based on date range and period
      const filteredOrders = orders.filter((order: Ambassador) => {
        const orderDate = dayjs(order.createdAt);

        // Check if within selected date range
        if (dateRange[0] && dateRange[1]) {
          const isInRange =
            orderDate.isAfter(dateRange[0]) && orderDate.isBefore(dateRange[1]);
          if (!isInRange) return false;
        }

        // Apply period filter
        if (period === "daily") {
          return true; // Show all data for daily view
        } else if (period === "weekly") {
          // Group by week
          const startOfWeek = dayjs().startOf("week");
          return orderDate.isAfter(startOfWeek);
        } else if (period === "monthly") {
          // Group by month
          const startOfMonth = dayjs().startOf("month");
          return orderDate.isAfter(startOfMonth);
        }
        return true;
      });

      setAmbassadors(filteredOrders.slice().reverse());
      // Calculate totals from the filtered orders
      const totalSales = filteredOrders.reduce(
        (sum: number, order: Ambassador) => sum + (Number(order.amount) || 0),
        0
      );

      const uniqueProducts = new Set(
        filteredOrders.map((o: Ambassador) => o.productId?._id || o.productId)
      ).size;

      // Calculate previous period range (if dateRange provided) to compute growth
      let prevStart: dayjs.Dayjs | null = null;
      let prevEnd: dayjs.Dayjs | null = null;
      if (dateRange[0] && dateRange[1]) {
        const daysDiff = dateRange[1].diff(dateRange[0], "day");
        prevEnd = dateRange[0].subtract(1, "day");
        prevStart = dateRange[0].subtract(daysDiff + 1, "day");
      } else {
        // fallback based on period
        if (period === "daily") {
          prevEnd = dayjs().subtract(1, "day");
          prevStart = dayjs().subtract(1, "day");
        } else if (period === "weekly") {
          prevEnd = dayjs().startOf("week").subtract(1, "day");
          prevStart = prevEnd.clone().subtract(6, "day");
        } else if (period === "monthly") {
          prevEnd = dayjs().startOf("month").subtract(1, "day");
          prevStart = prevEnd.clone().startOf("month");
        }
      }

      // Helper to filter orders by range
      const filterByRange = (
        arr: any[],
        start: dayjs.Dayjs | null,
        end: dayjs.Dayjs | null
      ) => {
        if (!start || !end) return [];
        return arr.filter((o: Ambassador) => {
          const d = dayjs(o.createdAt);
          return (
            (d.isAfter(start) || d.isSame(start, "day")) &&
            (d.isBefore(end) || d.isSame(end, "day"))
          );
        });
      };

      const prevOrders = filterByRange(orders, prevStart, prevEnd);

      const prevTotalSales = prevOrders.reduce(
        (sum: number, order: Ambassador) => sum + (Number(order.amount) || 0),
        0
      );
      const prevTotalOrders = prevOrders.length;
      const prevUniqueCustomers = new Set(
        prevOrders.map((o: Ambassador) => o.userId?._id || o.userId)
      ).size;
      const prevUniqueProducts = new Set(
        prevOrders.map((o: Ambassador) => o.productId?._id || o.productId)
      ).size;

      const pct = (prev: number, curr: number) => {
        if (!prev) return curr ? 100 : 0; // show 100% growth when prev was 0 and curr > 0
        return Math.round(((curr - prev) / Math.abs(prev)) * 1000) / 10; // one decimal
      };

      const salesGrowth = pct(prevTotalSales, totalSales);
      const ordersGrowth = pct(prevTotalOrders, filteredOrders.length);
      const customersGrowth = pct(
        prevUniqueCustomers,
        new Set(
          filteredOrders.map((o: Ambassador) => o.userId?._id || o.userId)
        ).size
      );
      const productsGrowth = pct(prevUniqueProducts, uniqueProducts);

      // Update report data with calculated totals and growth percentages
      setReportData((prev) => ({
        ...prev,
        totalOrders: filteredOrders.length,
        totalSales: totalSales,
        totalProducts: uniqueProducts,
        salesGrowth,
        ordersGrowth,
        customersGrowth,
        productsGrowth,
      }));

      // Build daily aggregated sales data for Quick Insights
      try {
        const dailyMap = new Map<
          string,
          { sales: number; orders: number; customers: Set<string> }
        >();

        filteredOrders.forEach((order: Ambassador) => {
          const day = dayjs(order.createdAt).format("YYYY-MM-DD");
          const existing = dailyMap.get(day) || {
            sales: 0,
            orders: 0,
            customers: new Set<string>(),
          };
          existing.sales += Number(order.amount) || 0;
          existing.orders += 1;
          const customerId =
            order.userId?._id ||
            (typeof order.userId === "string" ? order.userId : undefined);
          if (customerId) existing.customers.add(customerId);
          dailyMap.set(day, existing);
        });

        const dailyArray: SalesData[] = Array.from(dailyMap.entries())
          .map(([date, v]) => ({
            date,
            sales: v.sales,
            orders: v.orders,
            customers: v.customers.size,
          }))
          .sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1));

        setSalesData(dailyArray);
      } catch (e) {
        console.error("Error building daily sales data:", e);
        setSalesData([]);
      }

      console.log(
        "✅ Orders fetched and filtered successfully:",
        filteredOrders
      );
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, [period, dateRange]);
  return (
    <>
      <PageMeta
        title="AY Developers - Reports"
        description="Comprehensive business reports and analytics dashboard"
      />
      <PageBreadcrumb pageTitle="Reports" />

      <div className="space-y-6">
        {/* Header Section with Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Business Reports
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Analyze your business performance with detailed reports and
                insights
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={period}
                onChange={setPeriod}
                className="w-full sm:w-40"
                placeholder="Select Period"
              >
                <Option value="daily">Daily</Option>
                <Option value="weekly">Weekly</Option>
                <Option value="monthly">Monthly</Option>
              </Select>

              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                className="w-full sm:w-auto"
                format="MMM DD, YYYY"
              />

              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportPDF}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-2xl border-gray-200 dark:border-gray-800">
            <Spin spinning={loading}>
              <Statistic
                title="Total Sales"
                value={reportData.totalSales}
                precision={2}
                valueStyle={{ color: "#3f8600" }}
                prefix={<span className="text-2xl font-semibold">₦</span>}
              />
            </Spin>
          </Card>

          <Card className="rounded-2xl border-gray-200 dark:border-gray-800">
            <Spin spinning={loading}>
              <Statistic
                title="Total Orders"
                value={reportData.totalOrders}
                valueStyle={{ color: "#1890ff" }}
                prefix={<ShoppingOutlined />}
              />
            </Spin>
          </Card>

          <Card className="rounded-2xl border-gray-200 dark:border-gray-800">
            <Spin spinning={isFetchingUsers}>
              <Statistic
                title="Total Customers"
                value={users}
                valueStyle={{ color: "#722ed1" }}
                prefix={<UserOutlined />}
              />
            </Spin>
          </Card>

          <Card className="rounded-2xl border-gray-200 dark:border-gray-800">
            <Spin spinning={isFetching}>
              <Statistic
                title="Total Products"
                value={products.length}
                valueStyle={{ color: "#eb2f96" }}
                prefix={<TrophyOutlined />}
              />
            </Spin>
          </Card>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Top Performing Periods
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">
                  Best Sales Day
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  ₦{Math.max(...salesData.map((d) => d.sales)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">
                  Most Orders
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {Math.max(...salesData.map((d) => d.orders))} orders
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">
                  Peak Customer Day
                </span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {Math.max(...salesData.map((d) => d.customers))} new customers
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Growth Trends
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Sales Growth
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(reportData.salesGrowth * 5, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    +{reportData.salesGrowth}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Customer Growth
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          reportData.customersGrowth * 5,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    +{reportData.customersGrowth}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Product Growth
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          reportData.productsGrowth * 10,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">
                    +{reportData.productsGrowth}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ambassador Sales Report Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Ambassadors Sales Report
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                View sales by period and export as PDF for email distribution.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={period}
                onChange={setPeriod}
                className="w-full sm:w-32"
              >
                <Option value="daily">Daily</Option>
                <Option value="weekly">Weekly</Option>
                <Option value="monthly">Monthly</Option>
              </Select>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates || [null, null])}
                format="MMM DD, YYYY"
                className="w-full sm:w-auto"
              />
            </div>
          </div>

          <Spin spinning={loading}>
            <div className="mb-4 flex justify-end gap-3">
              <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
                Export CSV
              </Button>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={handleExportPDF}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Export PDF
              </Button>
            </div>
            <Table
              dataSource={ambassadors}
              columns={ambassadorColumns}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }}
              scroll={{ x: true }}
              bordered
              footer={() => (
                <div className="flex justify-end text-sm text-gray-700 dark:text-gray-300">
                  Total Orders:{" "}
                  <span className="font-semibold ml-2">
                    {reportData.totalOrders}
                  </span>
                </div>
              )}
            />
          </Spin>
        </div>
      </div>
    </>
  );
}
