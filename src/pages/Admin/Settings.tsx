import { Form, Input, Button, Tabs, notification } from "antd";
import { LockOutlined, SecurityScanOutlined } from "@ant-design/icons";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function Settings() {
  const [createPinForm] = Form.useForm();
  const [changePinForm] = Form.useForm();

  const handleCreatePin = async (values: {
    pin: string;
    confirmPin: string;
  }) => {
    try {
      if (values.pin !== values.confirmPin) {
        notification.error({
          message: "PIN Mismatch",
          description: "The PINs you entered do not match.",
          placement: "topRight",
        });
        return;
      }

      // TODO: Add API call to create PIN
      console.log("Creating PIN:", values);

      notification.success({
        message: "PIN Created",
        description: "Your PIN has been created successfully.",
        placement: "topRight",
      });
      createPinForm.resetFields();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to create PIN. Please try again.",
        placement: "topRight",
      });
    }
  };

  const handleChangePin = async (values: {
    currentPin: string;
    newPin: string;
    confirmNewPin: string;
  }) => {
    try {
      if (values.newPin !== values.confirmNewPin) {
        notification.error({
          message: "PIN Mismatch",
          description: "The new PINs you entered do not match.",
          placement: "topRight",
        });
        return;
      }

      // TODO: Add API call to change PIN
      console.log("Changing PIN:", values);

      notification.success({
        message: "PIN Changed",
        description: "Your PIN has been changed successfully.",
        placement: "topRight",
      });
      changePinForm.resetFields();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to change PIN. Please try again.",
        placement: "topRight",
      });
    }
  };

  const items = [
    {
      key: "1",
      label: (
        <span className="flex items-center gap-2">
          <SecurityScanOutlined />
          Create PIN
        </span>
      ),
      children: (
        <div className="max-w-md mx-auto">
          <Form
            form={createPinForm}
            layout="vertical"
            onFinish={handleCreatePin}
            requiredMark={false}
          >
            <Form.Item
              label="Enter PIN"
              name="pin"
              rules={[
                { required: true, message: "Please enter your PIN" },
                { len: 4, message: "PIN must be exactly 4 digits" },
                { pattern: /^\d+$/, message: "PIN must contain only numbers" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                className="py-2"
              />
            </Form.Item>

            <Form.Item
              label="Confirm PIN"
              name="confirmPin"
              rules={[
                { required: true, message: "Please confirm your PIN" },
                { len: 4, message: "PIN must be exactly 4 digits" },
                { pattern: /^\d+$/, message: "PIN must contain only numbers" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm 4-digit PIN"
                maxLength={4}
                className="py-2"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button type="primary" htmlType="submit" className="w-full">
                Create PIN
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <span className="flex items-center gap-2">
          <LockOutlined />
          Change PIN
        </span>
      ),
      children: (
        <div className="max-w-md mx-auto">
          <Form
            form={changePinForm}
            layout="vertical"
            onFinish={handleChangePin}
            requiredMark={false}
          >
            <Form.Item
              label="Current PIN"
              name="currentPin"
              rules={[
                { required: true, message: "Please enter your current PIN" },
                { len: 4, message: "PIN must be exactly 4 digits" },
                { pattern: /^\d+$/, message: "PIN must contain only numbers" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter current PIN"
                maxLength={4}
                className="py-2"
              />
            </Form.Item>

            <Form.Item
              label="New PIN"
              name="newPin"
              rules={[
                { required: true, message: "Please enter your new PIN" },
                { len: 4, message: "PIN must be exactly 4 digits" },
                { pattern: /^\d+$/, message: "PIN must contain only numbers" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter new PIN"
                maxLength={4}
                className="py-2"
              />
            </Form.Item>

            <Form.Item
              label="Confirm New PIN"
              name="confirmNewPin"
              rules={[
                { required: true, message: "Please confirm your new PIN" },
                { len: 4, message: "PIN must be exactly 4 digits" },
                { pattern: /^\d+$/, message: "PIN must contain only numbers" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm new PIN"
                maxLength={4}
                className="py-2"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button type="primary" htmlType="submit" className="w-full">
                Change PIN
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta
        title="AY Developers - Settings"
        description="Manage your account settings and security"
      />
      <PageBreadcrumb pageTitle="Settings" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Security Settings
        </h3>

        <Tabs
          defaultActiveKey="1"
          items={items}
          className="dark:text-white/90"
        />
      </div>
    </>
  );
}
