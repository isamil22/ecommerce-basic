// Create new file: isamil22/ecommerce-basic/ecommerce-basic-de52fb3f9923420c0ceb538f0eea6ad24aa94a25/frontend/src/components/CouponUsageChart.jsx

import React, { useState, useEffect } from 'react';
import { getCouponUsageStatisticsById } from '../api/apiService';
import { Line } from '@ant-design/plots';
import { message } from 'antd';
import dayjs from 'dayjs';

const CouponUsageChart = ({ couponId }) => {
    const [usageData, setUsageData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsageData = async () => {
            if (!couponId) return;
            try {
                setLoading(true);
                const res = await getCouponUsageStatisticsById(couponId);
                const formattedData = res.data.map(d => ({
                    ...d,
                    date: dayjs(d.date).format('YYYY-MM-DD'),
                }));
                setUsageData(formattedData);
            } catch (error) {
                message.error("Failed to load usage data for this coupon.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsageData();
    }, [couponId]);

    if (loading) {
        return <p>Loading chart data...</p>;
    }

    if (usageData.length === 0) {
        return <p>No usage data available for this coupon.</p>;
    }

    const chartConfig = {
        data: usageData,
        xField: 'date',
        yField: 'count',
        xAxis: { tickCount: 5 },
        smooth: true,
        height: 200,
        point: {
            size: 5,
            shape: 'diamond',
        },
        label: {
            style: {
                fill: '#aaa',
            },
        },
    };

    return <Line {...chartConfig} />;
};

export default CouponUsageChart;