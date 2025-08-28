import { Modal, Radio, Card, Statistic, Tabs, Table, Button } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Define the Product type (customize fields as needed)
interface Product {
  salesCount: number;
  // Add other fields as needed, e.g. id, name, price, etc.
}

interface PerformanceModalProps {
  open: boolean;
  onClose: () => void;
  timeframe: "day" | "month";
  onTimeframeChange: (timeframe: "day" | "month") => void;
  products: Product[];
}

export default function PerformanceModal({
  open,
  onClose,
  timeframe,
  onTimeframeChange,
  products,
}: PerformanceModalProps) {
  // Calculate total sales
  const totalSales = products.reduce(
    (sum, product) => sum + product.salesCount,
    0
  );

  // Mock data - replace with actual data
  const salesData = [
    { name: "Jan", sales: 400 },
    { name: "Feb", sales: 300 },
    { name: "Mar", sales: 600 },
    // ... more data
  ];

  return (
    <Modal
      title="Sales Performance"
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Radio.Group
            value={timeframe}
            onChange={(e) => onTimeframeChange(e.target.value)}
          >
            <Radio.Button value="day">Daily</Radio.Button>
            <Radio.Button value="month">Monthly</Radio.Button>
          </Radio.Group>

          <Card>
            <Statistic
              title="Total Sales"
              value={totalSales}
              precision={0}
              prefix=""
            />
          </Card>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <Tabs
          items={[
            {
              key: "1",
              label: "Special Lists",
              children: (
                <div className="space-y-4">
                  <Button type="primary">Add New Special List</Button>
                  <Table
                    columns={[
                      { title: "List Name", dataIndex: "name" },
                      { title: "Products", dataIndex: "productCount" },
                      { title: "Actions", key: "actions" },
                    ]}
                    dataSource={[]}
                  />
                </div>
              ),
            },
            {
              key: "2",
              label: "Group Lists",
              children: (
                <div className="space-y-4">
                  <Button type="primary">Add New Group List</Button>
                  <Table
                    columns={[
                      { title: "List Name", dataIndex: "name" },
                      { title: "Products", dataIndex: "productCount" },
                      { title: "Actions", key: "actions" },
                    ]}
                    dataSource={[]}
                  />
                </div>
              ),
            },
          ]}
        />
      </div>
    </Modal>
  );
}
