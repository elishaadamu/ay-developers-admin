import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  notification,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const { Option } = Select;

interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "manager" | "Ambassador" | "Customer";
  phone?: string;
}

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (user: Omit<User, "confirmPassword">) => Promise<void>;
  defaultRole?: "manager" | "Ambassador" | "Customer";
}

export default function AddUserModal({
  open,
  onClose,
  onSubmit,
  defaultRole,
}: AddUserModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const handleSubmit = async (values: User) => {
    setLoading(true);
    try {
      const { confirmPassword, ...userData } = values;
      await onSubmit(userData);

      api.success({
        message: "Success!",
        description: `${values.role} created successfully.`,
        placement: "topRight",
        duration: 4,
      });

      form.resetFields();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create user";

      api.error({
        message: "Creation Failed",
        description: errorMessage,
        placement: "topRight",
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const validatePassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error("Please enter password"));
    }
    if (value.length < 6) {
      return Promise.reject(
        new Error("Password must be at least 6 characters")
      );
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error("Please confirm password"));
    }
    if (value !== form.getFieldValue("password")) {
      return Promise.reject(new Error("Passwords do not match"));
    }
    return Promise.resolve();
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={`Add New ${defaultRole || "User"}`}
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          autoComplete="off"
          initialValues={{ role: defaultRole }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[
                  { required: true, message: "Please enter first name" },
                  {
                    min: 2,
                    message: "First name must be at least 2 characters",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter first name"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[
                  { required: true, message: "Please enter last name" },
                  {
                    min: 2,
                    message: "Last name must be at least 2 characters",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter last name"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: "Please enter email address" },
              { type: "email", message: "Please enter a valid email address" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter email address"
              size="large"
            />
          </Form.Item>

          <Form.Item label="Phone Number (Optional)" name="phone">
            <Input placeholder="Enter phone number" size="large" />
          </Form.Item>

          {!defaultRole && (
            <Form.Item
              label="User Role"
              name="role"
              rules={[{ required: true, message: "Please select user role" }]}
            >
              <Select
                placeholder="Select user role"
                size="large"
                suffixIcon={<TeamOutlined />}
              >
                <Option value="manager">
                  <div className="flex items-center gap-2">
                    <TeamOutlined />
                    <span>manager</span>
                  </div>
                </Option>
                <Option value="Ambassador">
                  <div className="flex items-center gap-2">
                    <UserOutlined />
                    <span>Ambassador</span>
                  </div>
                </Option>
                <Option value="Customer">
                  <div className="flex items-center gap-2">
                    <UserOutlined />
                    <span>Customer</span>
                  </div>
                </Option>
              </Select>
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Password"
                name="password"
                rules={[{ validator: validatePassword }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter password"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                rules={[{ validator: validateConfirmPassword }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm password"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0 mt-6">
            <div className="flex gap-3 justify-end">
              <Button onClick={handleCancel} disabled={loading} size="large">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
              >
                {loading ? "Creating..." : `Create ${defaultRole || "User"}`}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
