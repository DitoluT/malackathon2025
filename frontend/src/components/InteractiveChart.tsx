import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Card } from '@/components/ui/card';

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area';
  data: ChartDataPoint[];
  title: string;
  dataKey?: string;
  xAxisKey?: string;
  colors?: string[];
}

interface InteractiveChartProps {
  data: ChartData;
}

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // green
  '#06b6d4', // cyan
  '#ef4444', // red
  '#f97316', // orange
];

const InteractiveChart: React.FC<InteractiveChartProps> = ({ data }) => {
  const colors = data.colors || COLORS;

  const renderChart = () => {
    switch (data.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey={data.xAxisKey || 'name'}
                tick={{ fontSize: 11 }}
                stroke="#6b7280"
              />
              <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey={data.dataKey || 'value'}
                fill={colors[0]}
                radius={[8, 8, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey={data.xAxisKey || 'name'}
                tick={{ fontSize: 11 }}
                stroke="#6b7280"
              />
              <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey={data.dataKey || 'value'}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0], r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey={data.xAxisKey || 'name'}
                tick={{ fontSize: 11 }}
                stroke="#6b7280"
              />
              <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area
                type="monotone"
                dataKey={data.dataKey || 'value'}
                stroke={colors[0]}
                fillOpacity={1}
                fill="url(#colorValue)"
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) =>
                  `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey={data.dataKey || 'value'}
                animationDuration={800}
              >
                {data.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <p className="text-sm text-muted-foreground">Tipo de gráfica no soportado</p>;
    }
  };

  return (
    <Card className="p-4 bg-white border shadow-sm">
      <h4 className="text-sm font-semibold mb-3 text-foreground">{data.title}</h4>
      {renderChart()}
    </Card>
  );
};

export default InteractiveChart;
