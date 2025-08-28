import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Select,
  notification,
  Button,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import {
  CloudServerOutlined,
  DesktopOutlined,
  SettingOutlined,
  PicLeftOutlined,
} from "@ant-design/icons";

const { Option } = Select;

interface Product {
  id?: number;
  _id?: string;
  name: string;
  status: "Active" | "Inactive";
  createdDate: string;
  images: string;
  price: number;
  description: string;
}

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onDelete: (id: string | number) => Promise<void>;
  onUpdate?: (id: string | number, data: Partial<Product>) => Promise<void>;
}

export default function ProductTable({
  products,
  loading,
  onDelete,
  onUpdate,
}: ProductTableProps) {
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle edit button click
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setImageUrl(product.images || "");
    form.setFieldsValue({
      name: product.name,
      price: product.price,
      description: product.description,
      status: product.status,
    });
    setEditModalOpen(true);
  };

  // Handle image upload
  const handleImageUpload = (file: RcFile) => {
    return new Promise<boolean>((resolve) => {
      // Validate file type
      const allowedFileTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

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
        setImageUrl(base64String);

        api.success({
          message: "Image uploaded successfully!",
          description: "The image has been updated",
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
        resolve(false);
      };

      reader.readAsDataURL(file);
    });
  };

  // Handle form submission
  const handleUpdateSubmit = async (values: any) => {
    if (!editingProduct || !onUpdate) return;

    setUpdateLoading(true);
    try {
      const productId = editingProduct._id || editingProduct.id;
      if (productId) {
        const updateData = {
          ...values,
          images: imageUrl,
        };

        await onUpdate(productId, updateData);

        api.success({
          message: "Success!",
          description: "Product updated successfully.",
          placement: "topRight",
        });

        setEditModalOpen(false);
        form.resetFields();
        setImageUrl("");
        setEditingProduct(null);
      }
    } catch (error) {
      api.error({
        message: "Update Failed",
        description: "Failed to update product. Please try again.",
        placement: "topRight",
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle modal cancel
  const handleCancel = () => {
    setEditModalOpen(false);
    form.resetFields();
    setImageUrl("");
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Product Name
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Price
                </TableCell>

                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Created Date
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 actions"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {products.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No products found. Add your first product to get started.
                  </td>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow
                    key={product._id || product.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        {product.images && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            <img
                              src={product.images}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center text-gray-400 text-xs image">
                                      No Image
                                    </div>
                                  `;
                                }
                              }}
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90 name">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs dark:text-gray-400 description">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 text-gray-500 dark:text-gray-400 price">
                      ₦{product.price.toLocaleString()}
                    </TableCell>

                    <TableCell className="py-4 text-gray-500 text-theme-sm dark:text-gray-400 date">
                      {formatDate(product.createdDate)}
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium edit-product"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(product._id || product.id!)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium delete-product"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Product Modal */}
      <Modal
        title="Edit Product"
        open={editModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateSubmit}
          requiredMark={false}
        >
          <Form.Item
            label="Product Name"
            name="name"
            rules={[{ required: true, message: "Please select a product" }]}
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
              <Button
                onClick={handleCancel}
                disabled={updateLoading}
                size="large"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateLoading}
                size="large"
              >
                Update Product
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
