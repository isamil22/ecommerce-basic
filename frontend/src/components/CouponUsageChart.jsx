// Create new file: isamil22/ecommerce-basic/ecommerce-basic-de52fb3f9923420c0ceb538f0eea6ad24aa94a25/frontend/src/components/CouponUsageChart.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getCouponUsageStatisticsById } from '../api/apiService';
import { DualAxes } from '@ant-design/plots';
import { message, Card, Statistic, Spin, Alert, Row, Col, Table, Empty } from 'antd';
import { RiseOutlined, TrophyOutlined, BarChartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styled from 'styled-components';

const DashboardCard = styled(Card)`
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  border: none;
  margin-bottom: 24px;
`;

const KPIStat = styled(Statistic)`
  .ant-statistic-title {
    font-size: 16px;
    color: #8c8c8c;
  }
  .ant-statistic-content {
    font-size: 30px;
    font-weight: 600;
  }
`;

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
                })).sort((a, b) => dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1);

                let cumulative = 0;
                const processedData = formattedData.map(d => {
                    cumulative += d.count;
                    return { ...d, cumulative };
                });

                setUsageData(processedData);
            } catch (error) {
                message.error("Failed to load usage data for this coupon.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsageData();
    }, [couponId]);

    const { totalUses, peakUsage, averageUses } = useMemo(() => {
        if (usageData.length === 0) {
            return { totalUses: 0, peakUsage: 0, averageUses: 0 };
        }
        const total = usageData.reduce((acc, curr) => acc + curr.count, 0);
        const peak = Math.max(...usageData.map(d => d.count));
        const avg = total / usageData.length;
        return {
            totalUses: total,
            peakUsage: peak,
            averageUses: avg.toFixed(1),
        };
    }, [usageData]);

    if (loading) {
        return (
            <DashboardCard>
                <div style={{ textAlign: 'center', padding: '70px 0' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: '20px', fontSize: '16px' }}>Loading Professional Analytics Dashboard...</p>
                </div>
            </DashboardCard>
        );
    }

    if (usageData.length === 0) {
        return (
            <DashboardCard>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <span>
                            No usage data available for this coupon.
                        </span>
                    }
                />
            </DashboardCard>
        );
    }

    const chartConfig = {
        data: [usageData, usageData],
        xField: 'date',
        yField: ['count', 'cumulative'],
        geometryOptions: [
            {
                geometry: 'column',
                color: '#5B8FF9',
                columnStyle: {
                    radius: [4, 4, 0, 0],
                },
            },
            {
                geometry: 'line',
                color: '#5AD8A6',
                lineStyle: {
                    lineWidth: 3,
                },
            },
        ],
        xAxis: {
            tickCount: 5,
        },
        yAxis: {
            count: {
                title: { text: 'Daily Usage', style: { fontSize: 14 } },
            },
            cumulative: {
                title: { text: 'Cumulative Usage', style: { fontSize: 14 } },
            },
        },
        legend: {
            itemName: {
                formatter: (text, item) => (item.value === 'count' ? 'Daily' : 'Total'),
            },
        },
        tooltip: {
            shared: true,
            showMarkers: false,
        },
        interactions: [{ type: 'active-region' }],
    };

    const columns = [
        { title: 'Date', dataIndex: 'date', key: 'date', sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix() },
        { title: 'Usage Count', dataIndex: 'count', key: 'count', sorter: (a, b) => a.count - b.count },
    ];

    return (
        <>
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={8}>
                    <DashboardCard>
                        <KPIStat title="Total Uses" value={totalUses} prefix={<RiseOutlined />} />
                    </DashboardCard>
                </Col>
                <Col xs={24} sm={8}>
                    <DashboardCard>
                        <KPIStat title="Peak Daily Usage" value={peakUsage} prefix={<TrophyOutlined />} />
                    </DashboardCard>
                </Col>
                <Col xs={24} sm={8}>
                    <DashboardCard>
                        <KPIStat title="Average Daily Uses" value={averageUses} prefix={<BarChartOutlined />} />
                    </DashboardCard>
                </Col>
            </Row>
            <DashboardCard title={<span style={{fontSize: '20px', fontWeight: '500'}}>Coupon Usage Analytics</span>}>
                <DualAxes {...chartConfig} />
            </DashboardCard>
            <DashboardCard title={<span style={{fontSize: '20px', fontWeight: '500'}}>Detailed Usage Data</span>}>
                <Table columns={columns} dataSource={usageData} rowKey="date" pagination={{ pageSize: 5 }} />
            </DashboardCard>
        </>
    );
};

export default CouponUsageChart;