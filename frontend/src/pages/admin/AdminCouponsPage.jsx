import {
    Button,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Select,
    Table,
    message,
    Space,
    Popconfirm,
    Switch,
} from "antd";
import { useEffect, useState } from "react";
// Import getAllProducts and getAllCategories from apiService
import { createCoupon, getAllCoupons as fetchAllCoupons, deleteCoupon, getAllProducts, getAllCategories } from "../../api/apiService"; //
import dayjs from "dayjs";

const { Option } = Select;

const AdminCouponsPage = () => {
    const [form] = Form.useForm();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]); // State for products
    const [categories, setCategories] = useState([]); // State for categories

    useEffect(() => {
        getAllCoupons();
        fetchProductsAndCategories(); // Fetch products and categories when component mounts
    }, []);

    const fetchProductsAndCategories = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                getAllProducts({ page: 0, size: 9999, sort: 'name,asc' }), // Fetch all products, unpaginated
                getAllCategories(), // Fetch all categories
            ]);
            setProducts(productsRes.data.content || productsRes.data); // Adjust based on actual API response structure
            setCategories(categoriesRes.data); //
        } catch (error) {
            message.error("Failed to fetch products or categories.");
            console.error("Error fetching products/categories:", error);
        }
    };

    const getAllCoupons = async () => {
        try {
            setLoading(true);
            const couponsRes = await fetchAllCoupons();
            setCoupons(couponsRes.data);
        } catch (error) {
            message.error(error.response?.data?.message || "Something went wrong fetching coupons!");
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            // Format date before sending
            const payload = {
                ...values,
                expiryDate: values.expiryDate ? dayjs(values.expiryDate).toISOString() : null,
                // Ensure applicableProducts and applicableCategories are arrays or null
                applicableProducts: values.applicableProducts && values.applicableProducts.length > 0 ? values.applicableProducts : null,
                applicableCategories: values.applicableCategories && values.applicableCategories.length > 0 ? values.applicableCategories : null,
            };
            const res = await createCoupon(payload);
            message.success(`Coupon "${res.data.name}" created successfully!`);
            getAllCoupons();
            form.resetFields();
        } catch (error) {
            message.error(error.response?.data?.message || "Something went wrong creating the coupon!");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (couponId) => {
        try {
            await deleteCoupon(couponId);
            message.success("Coupon deleted successfully!");
            getAllCoupons();
        } catch (error) {
            message.error("Failed to delete coupon.");
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id", key: "id", sorter: (a, b) => a.id - b.id },
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Code", dataIndex: "code", key: "code" },
        {
            title: "Discount",
            key: "discount",
            render: (_, record) => {
                if (record.discountType === 'PERCENTAGE') {
                    return `${record.discountValue}%`;
                }
                if (record.discountType === 'FIXED_AMOUNT') {
                    return `$${record.discountValue.toFixed(2)}`;
                }
                return 'Free Shipping';
            },
        },
        {
            title: "Expiry Date",
            dataIndex: "expiryDate",
            key: "expiryDate",
            render: (date) => dayjs(date).format("YYYY-MM-DD"),
        },
        { title: "Times Used", dataIndex: "timesUsed", key: "timesUsed" },
        { title: "Usage Limit", dataIndex: "usageLimit", key: "usageLimit" },
        {
            title: "Applies To",
            key: "appliesTo",
            render: (_, record) => {
                const productNames = record.applicableProducts?.map(p => p.name).join(', ');
                const categoryNames = record.applicableCategories?.map(c => c.name).join(', ');

                if (productNames && categoryNames) {
                    return `Products: ${productNames}; Categories: ${categoryNames}`;
                } else if (productNames) {
                    return `Products: ${productNames}`;
                } else if (categoryNames) {
                    return `Categories: ${categoryNames}`;
                }
                return 'All';
            },
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Popconfirm
                    title="Delete the coupon"
                    description="Are you sure you want to delete this coupon?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="primary" danger>
                        Delete
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Manage Coupons</h1>
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Create New Coupon</h2>
                <Form layout="vertical" form={form} onFinish={onFinish}>
                    <Form.Item label="Coupon Name" name="name" rules={[{ required: true }]}>
                        <Input placeholder="e.g., Summer Sale" />
                    </Form.Item>
                    <Form.Item label="Coupon Code" name="code" rules={[{ required: true }]}>
                        <Input placeholder="e.g., SUMMER25" />
                    </Form.Item>
                    <Form.Item label="Discount Type" name="discountType" rules={[{ required: true }]}>
                        <Select placeholder="Select a discount type">
                            <Option value="PERCENTAGE">Percentage</Option>
                            <Option value="FIXED_AMOUNT">Fixed Amount</Option>
                            <Option value="FREE_SHIPPING">Free Shipping</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Discount Value" name="discountValue" rules={[{ required: true }]}>
                        <InputNumber min={0} className="w-full" placeholder="e.g., 25 for 25% or 10 for $10" />
                    </Form.Item>
                    <Form.Item label="Expiry Date" name="expiryDate" rules={[{ required: true }]}>
                        <DatePicker className="w-full" />
                    </Form.Item>
                    <Form.Item label="Minimum Purchase Amount" name="minPurchaseAmount">
                        <InputNumber min={0} className="w-full" placeholder="e.g., 50" />
                    </Form.Item>
                    <Form.Item label="Usage Limit" name="usageLimit" rules={[{ required: true }]}>
                        <InputNumber min={0} className="w-full" placeholder="Total times this coupon can be used (0 for unlimited)" />
                    </Form.Item>
                    {/* New: Product-Specific Discount Field */}
                    <Form.Item label="Applicable Products (Optional)" name="applicableProducts">
                        <Select
                            mode="multiple"
                            placeholder="Select products for this coupon"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {products.map(product => (
                                <Option key={product.id} value={product.id}>{product.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    {/* New: Category-Specific Discount Field */}
                    <Form.Item label="Applicable Categories (Optional)" name="applicableCategories">
                        <Select
                            mode="multiple"
                            placeholder="Select categories for this coupon"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {categories.map(category => (
                                <Option key={category.id} value={category.id}>{category.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="firstTimeOnly" label="For First-Time Customers Only" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Create Coupon
                        </Button>
                    </Form.Item>
                </Form>
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-4">Existing Coupons</h2>
                <Table
                    columns={columns}
                    dataSource={coupons}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: true }}
                />
            </div>
        </div>
    );
};

export default AdminCouponsPage;