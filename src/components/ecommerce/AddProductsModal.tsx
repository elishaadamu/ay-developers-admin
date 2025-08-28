import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Upload,
  InputNumber,
  notification,
} from "antd";
import type { RcFile } from "antd/es/upload/interface";
import {
  PlusOutlined,
  CloudServerOutlined,
  DesktopOutlined,
  SettingOutlined,
  PicLeftOutlined,
} from "@ant-design/icons";

// Update the Product interface
interface Product {
  name: string;
  price: number;
  description: string;
  images: string; // Changed from string[] to string
  status: "Active" | "Inactive";
}

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: Product) => Promise<void>;
}

const { Option } = Select;

export default function AddProductModal({
  open,
  onClose,
  onSubmit,
}: AddProductModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(""); // Changed from imageUrls array
  const [api, contextHolder] = notification.useNotification();

  // Modified image upload handler
  const handleImageUpload = (file: RcFile) => {
    return new Promise<boolean>((resolve, reject) => {
      // Validate file type
      if (!allowedFileTypes.includes(file.type)) {
        api.error({
          message: "Invalid file type",
          description: "You can only upload JPG, JPEG, PNG, or WebP files!",
          placement: "topRight",
        });
        resolve(false);
        return;
      }

      // Validate file size (50KB)
      const fileSizeKB = file.size / 1024;
      if (fileSizeKB > 50) {
        api.error({
          message: "File too large",
          description: `Image must be smaller than 50KB. Current size: ${Math.round(
            fileSizeKB
          )}KB`,
          placement: "topRight",
        });
        resolve(false);
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setImageUrl(base64String); // Set single image URL

        api.success({
          message: "Image uploaded successfully!",
          description: "The image has been added to the product",
          placement: "topRight",
          duration: 3,
        });

        resolve(false);
      };

      reader.onerror = () => {
        api.error({
          message: "Upload failed",
          description: "Failed to process the image. Please try again.",
          placement: "topRight",
        });
        reject(false);
      };

      reader.readAsDataURL(file);
    });
  };

  // Modified submit handler
  const handleSubmit = async (values: Product) => {
    setLoading(true);
    try {
      const productData = {
        ...values,
        images: imageUrl, // Changed from imageUrls array to single imageUrl
      };

      await onSubmit(productData);
      form.resetFields();
      setImageUrl(""); // Clear single image
      api.success({
        message: "Success!",
        description: "Product added successfully.",
        placement: "topRight",
      });
      onClose();
    } catch (error) {
      api.error({
        message: "Failed to add product",
        description: "Please try again.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Add file type validation
  const allowedFileTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  // Modified Form.Item for single image
  return (
    <>
      {contextHolder}
      <Modal
        title="Add New Product"
        open={open}
        onCancel={onClose}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            label="Product Name"
            name="name"
            rules={[
              { required: true, message: "Please select a product" },
              { min: 2, message: "Product name must be at least 2 characters" },
            ]}
          >
            <Select size="large" placeholder="Select product">
              <Option value="Reseller Hosting">
                <div className="flex items-center gap-2">
                  <CloudServerOutlined className="text-lg" />
                  <span>Reseller Hosting</span>
                </div>
              </Option>
              <Option value="Website Development">
                <div className="flex items-center gap-2">
                  <DesktopOutlined className="text-lg" />
                  <span>Website Development</span>
                </div>
              </Option>
              <Option value="Console Management">
                <div className="flex items-center gap-2">
                  <SettingOutlined className="text-lg" />
                  <span>Console Management</span>
                </div>
              </Option>
              <Option value="Others">
                <div className="flex items-center gap-2">
                  <PicLeftOutlined className="text-lg" />
                  <span>Others</span>
                </div>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: "Please enter product price" }]}
          >
            <InputNumber
              prefix="₦"
              className="w-full"
              min={0}
              step={0.01}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please enter product description" },
              {
                min: 10,
                message: "Description must be at least 10 characters",
              },
            ]}
          >
            <Input.TextArea rows={3} size="large" />
          </Form.Item>

          <Form.Item
            label="Image"
            name="images"
            rules={[
              {
                validator: async (_) => {
                  if (!imageUrl) {
                    throw new Error("Please upload an image");
                  }
                },
              },
            ]}
          >
            <Upload
              listType="picture-card"
              fileList={
                imageUrl
                  ? [
                      {
                        uid: "-1",
                        name: "image",
                        status: "done",
                        url: imageUrl,
                      },
                    ]
                  : []
              }
              beforeUpload={handleImageUpload}
              onRemove={() => {
                setImageUrl("");
                return true;
              }}
              accept=".jpg,.jpeg,.png,.webp"
            >
              {!imageUrl && (
                <div>
                  <PlusOutlined />
                  <div className="mt-2">Upload</div>
                </div>
              )}
            </Upload>
            <div className="mt-2 text-sm text-gray-500">
              Supported formats: JPG, JPEG, PNG, WebP. Max size: 50KB
            </div>
          </Form.Item>

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
                Add Product
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
