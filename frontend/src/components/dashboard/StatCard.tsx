import React from 'react';
import { Card, Statistic, Skeleton } from 'antd';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  loading: boolean;
  prefix?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, loading, prefix }) => (
  <Card>
    <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
      <Statistic title={title} value={value} prefix={prefix} />
    </Skeleton>
  </Card>
);

export default StatCard;