import {
    Button,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Select,
    Table,
    message,
} from "antd";
import { useEffect, useState } from "react";
import { couponApi } from "../../api/coupon";
import { productApi } from "../../api/product";

const AdminCouponsPage = () => {
    const [form] = Form.useForm();
    const [coupons, setCoupons] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getAllCoupons();
        getAllProducts();
    }, []);

    const getAllProducts = async () => {
        try {
            setLoading(true);
            const productsRes = await productApi.getAllProducts();
            // FIX: Access the .content property from the paginated response
            setProducts(productsRes.data.content || []);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            message.error(error.response.data.message || "Something went wrong!");
        }
    };

    const getAllCoupons = async () => {
        try {
            setLoading(true);
            const couponsRes = await couponApi.getAllCoupons();
            setCoupons(couponsRes.data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            message.error(error.response.data.message || "Something went wrong!");
        }
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const res = await couponApi.createCoupon(values);
            message.success(`Coupon ${res.data.name} created successfully!`);
            getAllCoupons();
            form.resetFields();
            setLoading(false);
        } catch (error) {
            setLoading(false);
            message.error(error.response.data.message || "Something went wrong!");
        }
    };

    const columns = [
        {
            title: "Coupon Name",
            dataIndex: "name",
        },
        {
            title: "Coupon Code",
            dataIndex: "code",
        },
        {
            title: "Discount",
            dataIndex: "discount",
            render: (discount) => `${discount}%`,
        },
        {
            title: "Expiration Date",
            dataIndex: "expirationDate",
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: "Action",
            render: (text, record) => (
                <Button type="primary" danger onClick={() => {}}>
                    Delete
                </Button>
            ),
        },
    ];

    return (
        <div>
            <h1 className="text-3xl font-semibold">Coupons</h1>
            <div className="mt-5">
                <Form layout="vertical" form={form} onFinish={onFinish}>
                    <Form.Item
                        label="Coupon Name"
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: "Please input coupon name!",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Coupon Code"
                        name="code"
                        rules={[
                            {
                                required: true,
                                message: "Please input coupon code!",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Discount"
                        name="discount"
                        rules={[
                            {
                                required: true,
                                message: "Please input discount!",
                            },
                        ]}
                    >
                        <InputNumber />
                    </Form.Item>
                    <Form.Item
                        label="Expiration Date"
                        name="expirationDate"
                        rules={[
                            {
                                required: true,
                                message: "Please input expiration date!",
                            },
                        ]}
                    >
                        <DatePicker />
                    </Form.Item>
                    <Form.Item label="Products" name="productIds">
                        <Select
                            mode="multiple"
                            allowClear
                            style={{
                                width: "100%",
                            }}
                            placeholder="Please select"
                            options={products.map((product) => ({
                                label: product.name,
                                value: product.id,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Create Coupon
                        </Button>
                    </Form.Item>
                </Form>
            </div>

            <div className="mt-5">
                <Table
                    columns={columns}
                    dataSource={coupons}
                    rowKey="id"
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default AdminCouponsPage;