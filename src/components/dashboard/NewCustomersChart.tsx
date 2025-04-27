import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface NewCustomersChartProps {
  customers: any[];
}

function getMonthlyNewCustomers(customers: any[]) {
  // Group by month/year
  const counts: { [key: string]: number } = {};
  customers.forEach(c => {
    const date = new Date(c.createdAt || c.created_at);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    counts[key] = (counts[key] || 0) + 1;
  });
  // Sort keys
  const sortedKeys = Object.keys(counts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  return {
    labels: sortedKeys.map(k => {
      const [year, month] = k.split('-');
      return `${month}/${year}`;
    }),
    data: sortedKeys.map(k => counts[k])
  };
}

export default function NewCustomersChart({ customers }: NewCustomersChartProps) {
  const { labels, data } = getMonthlyNewCustomers(customers || []);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'عملاء جدد',
        data,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>تطور العملاء الجدد شهرياً</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: 300 }}>
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
