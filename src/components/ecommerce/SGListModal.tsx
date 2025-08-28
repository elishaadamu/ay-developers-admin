// filepath: c:\Users\Adamu\Documents\aycreatives\admin-dashboard\src\components\ecommerce\SGListModal.tsx
import { Modal, Tabs, Table, Button } from "antd";

interface SGListModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SGListModal({ open, onClose }: SGListModalProps) {
  return (
    <Modal
      title="Manage S&G Lists"
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}
    >
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
    </Modal>
  );
}
