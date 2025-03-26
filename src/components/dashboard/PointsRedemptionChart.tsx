
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';

interface PointsRedemptionChartProps {
  data: any[];
}

const PointsRedemptionChart = ({ data }: PointsRedemptionChartProps) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>معدل استبدال النقاط</CardTitle>
        <CardDescription>النقاط المكتسبة مقابل المستبدلة</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              <Cell fill="#3b82f6" />
              <Cell fill="#22c55e" />
            </Pie>
            <Tooltip formatter={(value) => [value, 'النقاط']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PointsRedemptionChart;
