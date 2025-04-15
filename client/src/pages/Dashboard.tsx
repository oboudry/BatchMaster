import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { 
  ClipboardList, 
  CheckCircle, 
  BadgeCheck, 
  ArrowUp, 
  ArrowDown,
  Clock,
  Edit3,
  AlertTriangle,
  AlertCircle
} from "lucide-react";
import StatCard from "@/components/Dashboard/StatCard";
import ActivityItem from "@/components/Dashboard/ActivityItem";
import { DoughnutChart, BarChart } from "@/components/ui/charts";

interface DashboardStats {
  activeWorkOrders: number;
  pendingQcReviews: number;
  completedThisMonth: number;
  statusCounts: Record<string, number>;
  workOrderIncrease: string;
  pendingIncrease: string;
  completedIncrease: string;
}

const Dashboard = () => {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  // Fetch recent activity logs
  const { data: activityLogs, isLoading: activityLoading } = useQuery<any[]>({
    queryKey: ['/api/activity-logs/recent'],
  });
  
  // Prepare chart data
  const [workOrderChartData, setWorkOrderChartData] = useState<{
    labels: string[];
    datasets: { data: number[]; backgroundColor: string[]; }[];
  }>({
    labels: ['Planned', 'In Progress', 'Completed', 'Under Review', 'Approved', 'Rejected'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: [
        '#e5e7eb', // gray-200
        '#fbbf24', // amber-400
        '#60a5fa', // blue-400
        '#93c5fd', // blue-300
        '#34d399', // green-400
        '#f87171'  // red-400
      ]
    }]
  });

  // QC Decision Chart data (mock for now)
  const [qcChartData, setQcChartData] = useState({
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
  });

  // Update chart data when stats are loaded
  useEffect(() => {
    if (stats?.statusCounts) {
      setWorkOrderChartData(prev => ({
        ...prev,
        datasets: [{
          ...prev.datasets[0],
          data: [
            stats.statusCounts.planned || 0,
            stats.statusCounts.in_progress || 0,
            stats.statusCounts.completed || 0,
            stats.statusCounts.under_review || 0,
            stats.statusCounts.approved || 0,
            stats.statusCounts.rejected || 0
          ]
        }]
      }));
    }
  }, [stats]);

  // Format date for activity logs
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return activityDate.toLocaleDateString();
    }
  };

  // Determine activity icon and colors based on activity type
  const getActivityDisplay = (activity: any) => {
    switch (activity.activityType) {
      case 'quality_review_completed':
        return {
          icon: <BadgeCheck className="h-5 w-5" />,
          bgColor: "bg-primary bg-opacity-10",
          textColor: "text-primary"
        };
      case 'batch_record_created':
        return {
          icon: <Edit3 className="h-5 w-5" />,
          bgColor: "bg-blue-100",
          textColor: "text-blue-600"
        };
      case 'batch_record_submitted':
        return {
          icon: <Clock className="h-5 w-5" />,
          bgColor: "bg-amber-100",
          textColor: "text-amber-600"
        };
      case 'work_order_status_changed':
        if (activity.details.includes('rejected')) {
          return {
            icon: <AlertCircle className="h-5 w-5" />,
            bgColor: "bg-red-100",
            textColor: "text-red-600"
          };
        }
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          bgColor: "bg-green-100",
          textColor: "text-green-600"
        };
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          bgColor: "bg-gray-100",
          textColor: "text-gray-600"
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsLoading ? (
          // Loading skeletons for stats
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white shadow rounded-lg p-5">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))
        ) : (
          <>
            <StatCard
              title="Active Work Orders"
              value={stats?.activeWorkOrders || 0}
              change={stats?.workOrderIncrease || ""}
              icon={<ClipboardList className="h-6 w-6" />}
              iconBgColor="bg-primary bg-opacity-10"
              iconTextColor="text-primary"
              changeIcon={<ArrowUp className="h-5 w-5" />}
              changeColor="text-green-500"
            />
            <StatCard
              title="Pending QC Review"
              value={stats?.pendingQcReviews || 0}
              change={stats?.pendingIncrease || ""}
              icon={<Clock className="h-6 w-6" />}
              iconBgColor="bg-amber-500 bg-opacity-10"
              iconTextColor="text-amber-500"
              changeIcon={<ArrowUp className="h-5 w-5" />}
              changeColor="text-red-500"
            />
            <StatCard
              title="Completed This Month"
              value={stats?.completedThisMonth || 0}
              change={stats?.completedIncrease || ""}
              icon={<CheckCircle className="h-6 w-6" />}
              iconBgColor="bg-green-500 bg-opacity-10"
              iconTextColor="text-green-500"
              changeIcon={<ArrowUp className="h-5 w-5" />}
              changeColor="text-green-500"
            />
          </>
        )}
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Recent Activity</h3>
        </div>
        <div className="p-6">
          {activityLoading ? (
            // Loading skeleton for activity
            <div className="animate-pulse space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {activityLogs && activityLogs.length > 0 ? (
                activityLogs.map((activity) => {
                  const displayData = getActivityDisplay(activity);
                  return (
                    <ActivityItem
                      key={activity.id}
                      icon={displayData.icon}
                      iconBgColor={displayData.bgColor}
                      iconTextColor={displayData.textColor}
                      message={activity.details}
                      timestamp={formatTimeAgo(activity.createdAt)}
                    />
                  );
                })
              ) : (
                <li className="py-4 text-center text-gray-500">No recent activity</li>
              )}
            </ul>
          )}
        </div>
        <div className="px-6 py-3 bg-gray-50 text-right">
          <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark">
            View all activity
          </a>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">Work Order Status</h3>
          </div>
          <div className="p-6 h-[300px] flex items-center justify-center">
            {statsLoading ? (
              <div className="animate-pulse w-full h-full bg-gray-200 rounded-full"></div>
            ) : (
              <DoughnutChart data={workOrderChartData} />
            )}
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">QC Decision Summary</h3>
          </div>
          <div className="p-6 h-[300px] flex items-center justify-center">
            <BarChart data={qcChartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
