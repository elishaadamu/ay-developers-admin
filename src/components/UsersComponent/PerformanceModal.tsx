import { Modal, Radio, Card, Statistic, Tabs, Table, Button } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface User {
  id?: number;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "S/G Manager" | "Ambassador" | "Customer";
  status: "Active" | "Suspended" | "Inactive";
  createdDate: string;
  performance?: {
    totalSales: number;
    totalCommission: number;
    activeClients: number;
  };
}

interface PerformanceModalProps {
  open: boolean;
  onClose: () => void;
  timeframe: "day" | "month";
  onTimeframeChange: (timeframe: "day" | "month") => void;
  user: User | null;
}

export default function PerformanceModal({
  open,
  onClose,
  timeframe,
  onTimeframeChange,
  user,
}: PerformanceModalProps) {
  if (!user) return null;

  // Mock performance data - replace with actual data from API
  const performanceData = [
    { name: "Jan", sales: 400, commission: 120, clients: 15 },
    { name: "Feb", sales: 300, commission: 90, clients: 12 },
    { name: "Mar", sales: 600, commission: 180, clients: 25 },
    { name: "Apr", sales: 800, commission: 240, clients: 30 },
    { name: "May", sales: 700, commission: 210, clients: 28 },
    { name: "Jun", sales: 900, commission: 270, clients: 35 },
  ];

  const clientsData = [
    {
      name: "Active",
      value: user.performance?.activeClients || 25,
      color: "#22c55e",
    },
    { name: "Inactive", value: 10, color: "#ef4444" },
    { name: "Pending", value: 5, color: "#eab308" },
  ];

  return (
    <Modal
      title={`Performance Analytics - ${user.firstName} ${user.lastName}`}
      open={open}
      onCancel={onClose}
      width={900}
      footer={null}
    >
      <div className="space-y-6">
        {/* Header with timeframe selection and key metrics */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Radio.Group
            value={timeframe}
            onChange={(e) => onTimeframeChange(e.target.value)}
          >
            <Radio.Button value="day">Daily</Radio.Button>
            <Radio.Button value="month">Monthly</Radio.Button>
          </Radio.Group>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card size="small">
              <Statistic
                title="Total Sales"
                value={user.performance?.totalSales || 0}
                precision={0}
                prefix="₦"
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
            <Card size="small">
              <Statistic
                title="Total Commission"
                value={user.performance?.totalCommission || 0}
                precision={0}
                prefix="₦"
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
            <Card size="small">
              <Statistic
                title="Active Clients"
                value={user.performance?.activeClients || 0}
                precision={0}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </div>
        </div>

        {/* Performance Charts */}
        <Tabs
          items={[
            {
              key: "1",
              label: "Sales & Commission",
              children: (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#22c55e"
                        strokeWidth={2}
                        name="Sales (₦)"
                      />
                      <Line
                        type="monotone"
                        dataKey="commission"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Commission (₦)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ),
            },
            {
              key: "2",
              label: "Client Acquisition",
              children: (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="clients"
                        fill="#8b5cf6"
                        name="New Clients"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ),
            },
            {
              key: "3",
              label: "Client Status",
              children: (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {clientsData.map((item, index) => (
                      <Card key={index} size="small">
                        <Statistic
                          title={`${item.name} Clients`}
                          value={item.value}
                          valueStyle={{ color: item.color }}
                        />
                      </Card>
                    ))}
                  </div>

                  <Table
                    size="small"
                    columns={[
                      {
                        title: "Client Name",
                        dataIndex: "name",
                        key: "name",
                      },
                      {
                        title: "Status",
                        dataIndex: "status",
                        key: "status",
                        render: (status: string) => (
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              status === "Active"
                                ? "bg-green-100 text-green-800"
                                : status === "Inactive"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {status}
                          </span>
                        ),
                      },
                      {
                        title: "Last Activity",
                        dataIndex: "lastActivity",
                        key: "lastActivity",
                      },
                      {
                        title: "Total Spent",
                        dataIndex: "totalSpent",
                        key: "totalSpent",
                        render: (amount: number) =>
                          `₦${amount.toLocaleString()}`,
                      },
                    ]}
                    dataSource={[
                      {
                        key: "1",
                        name: "John Doe",
                        status: "Active",
                        lastActivity: "2 hours ago",
                        totalSpent: 50000,
                      },
                      {
                        key: "2",
                        name: "Jane Smith",
                        status: "Active",
                        lastActivity: "1 day ago",
                        totalSpent: 75000,
                      },
                      {
                        key: "3",
                        name: "Bob Johnson",
                        status: "Inactive",
                        lastActivity: "1 week ago",
                        totalSpent: 25000,
                      },
                    ]}
                    pagination={{ pageSize: 5 }}
                  />
                </div>
              ),
            },
          ]}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
          <Button type="primary">Export Report</Button>
        </div>
      </div>
    </Modal>
  );
}
