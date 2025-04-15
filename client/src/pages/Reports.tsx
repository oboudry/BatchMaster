import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Calendar, ArrowUpDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DoughnutChart, BarChart, LineChart } from "@/components/ui/charts";

interface DateRange {
  start: Date;
  end: Date;
}

const Reports = () => {
  const [dateRange, setDateRange] = useState<string>("this-month");
  const [productFilter, setProductFilter] = useState<string>("");
  
  // Get dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });
  
  // Get products
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  // Sample data for charts
  const workOrderStatusData = {
    labels: ['Planned', 'In Progress', 'Completed', 'Under Review', 'Approved', 'Rejected'],
    datasets: [{
      data: stats?.statusCounts ? [
        stats.statusCounts.planned || 0,
        stats.statusCounts.in_progress || 0,
        stats.statusCounts.completed || 0,
        stats.statusCounts.under_review || 0,
        stats.statusCounts.approved || 0,
        stats.statusCounts.rejected || 0
      ] : [8, 10, 5, 12, 42, 8],
      backgroundColor: [
        '#e5e7eb', // gray-200
        '#fbbf24', // amber-400
        '#60a5fa', // blue-400
        '#93c5fd', // blue-300
        '#34d399', // green-400
        '#f87171'  // red-400
      ],
      borderWidth: 1
    }]
  };

  const monthlyProductionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Production Volume',
        data: [150, 180, 220, 210, 280, 300, 320, 290, 310, 340, 360, 380],
        borderColor: '#0f766e',
        backgroundColor: 'rgba(15, 118, 110, 0.1)',
        fill: true,
      }
    ]
  };

  const qualityIssuesData = {
    labels: ['pH Issues', 'Viscosity', 'Color', 'Scent', 'Stability', 'Microbial', 'Packaging'],
    datasets: [
      {
        label: 'Issues Count',
        data: [5, 8, 3, 6, 9, 2, 4],
        backgroundColor: '#ef4444',
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header section with title and action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
        <div className="flex flex-wrap gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products?.map((product: any) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <span>Sort</span>
          </Button>
          
          <Button>
            <Download className="mr-2 h-4 w-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Work Orders</CardTitle>
            <CardDescription>For selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeWorkOrders + stats?.completedThisMonth || 75}</div>
            <p className="text-sm text-gray-500 mt-2">
              <span className="text-green-500">↑ 12%</span> from previous period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Approval Rate</CardTitle>
            <CardDescription>For selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">86%</div>
            <p className="text-sm text-gray-500 mt-2">
              <span className="text-green-500">↑ 3%</span> from previous period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Average QC Time</CardTitle>
            <CardDescription>From submission to decision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1.2 days</div>
            <p className="text-sm text-gray-500 mt-2">
              <span className="text-red-500">↓ 0.5 days</span> from previous period
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Work Order Status Distribution</CardTitle>
            <CardDescription>Current status of all work orders</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <DoughnutChart data={workOrderStatusData} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Production Volume</CardTitle>
            <CardDescription>Units produced by month</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <LineChart data={monthlyProductionData} />
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quality Control Decisions</CardTitle>
            <CardDescription>Approval vs. Rejection rate by month</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <BarChart data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
              datasets: [
                {
                  label: 'Approved',
                  data: [32, 28, 35, 45, 38, 40, 42],
                  backgroundColor: '#34d399', // green-400
                },
                {
                  label: 'Rejected',
                  data: [5, 8, 6, 3, 7, 5, 8],
                  backgroundColor: '#f87171', // red-400
                }
              ]
            }} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Common Quality Issues</CardTitle>
            <CardDescription>Frequency of quality issues</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <BarChart data={qualityIssuesData} horizontal={true} />
          </CardContent>
        </Card>
      </div>
      
      {/* Production Efficiency Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Manufacturing Efficiency</CardTitle>
          <CardDescription>Average time from start to completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Manufacturing Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval Rate</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Produced</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Hydrating Moisturizer</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2.3 days</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">92%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2,500</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="text-green-500">↑ 5%</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Vitamin C Serum</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3.1 days</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">88%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1,750</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="text-green-500">↑ 2%</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Gentle Cleanser</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1.8 days</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">95%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3,200</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="text-green-500">↑ 8%</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">SPF 50 Sunscreen</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2.5 days</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">90%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2,800</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="text-red-500">↓ 3%</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Clay Face Mask</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2.0 days</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">89%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1,950</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="text-green-500">↑ 4%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
