import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

// Register all Chart.js components
Chart.register(...registerables);

interface ChartProps {
  data: {
    labels: string[];
    datasets: {
      label?: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
      fill?: boolean;
    }[];
  };
  options?: Record<string, any>;
}

interface BarChartProps extends ChartProps {
  horizontal?: boolean;
}

export const DoughnutChart: React.FC<ChartProps> = ({ data, options }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart instance if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create new chart instance
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              },
              ...options?.plugins,
            },
            ...options,
          },
        });
      }
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, options]);

  return <canvas ref={chartRef} />;
};

export const BarChart: React.FC<BarChartProps> = ({ data, options, horizontal = false }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart instance if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create new chart instance
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: horizontal ? 'horizontalBar' : 'bar',
          data,
          options: {
            indexAxis: horizontal ? 'y' : 'x',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              },
              ...options?.plugins,
            },
            scales: {
              x: {
                stacked: true,
                ...options?.scales?.x,
              },
              y: {
                stacked: true,
                beginAtZero: true,
                ...options?.scales?.y,
              },
            },
            ...options,
          },
        });
      }
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, options, horizontal]);

  return <canvas ref={chartRef} />;
};

export const LineChart: React.FC<ChartProps> = ({ data, options }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart instance if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create new chart instance
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              },
              ...options?.plugins,
            },
            scales: {
              y: {
                beginAtZero: true,
                ...options?.scales?.y,
              },
              ...options?.scales,
            },
            ...options,
          },
        });
      }
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, options]);

  return <canvas ref={chartRef} />;
};
