import { useState, useEffect } from "react";
// Remove unused Material Tailwind imports
import Chart from "react-apexcharts";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { ApexOptions } from "apexcharts";

// Define type for chart data to avoid 'any'
interface ChartDataType {
  options: ApexOptions;
  series: {
    name: string;
    data: number[];
    color: string;
  }[];
}

interface ProgressChartProps {
  evaluations: {
    id: string;
    date: string;
    scores: {
      clarity: number;
      coherence: number;
      delivery: number;
      vocabulary: number;
      overallImpact: number;
      fluency?: number;
      engagement?: number;
    };
  }[];
  selectedMetrics: string[];
  timeframe: string;
  allMetrics?: boolean;
}

const ProgressChart = ({
  evaluations,
  selectedMetrics,
  timeframe,
  allMetrics = false,
}: ProgressChartProps) => {
  const [chartData, setChartData] = useState<ChartDataType | null>(null);

  // Define color palette for metrics
  const metricColors = {
    clarity: "#3b82f6", // blue-500
    coherence: "#ef4444", // red-500
    delivery: "#10b981", // emerald-500
    vocabulary: "#f97316", // orange-500
    overallImpact: "#8b5cf6", // violet-500
    fluency: "#eab308", // yellow-500
    engagement: "#6b7280", // gray-500
  };

  // Define labels for metrics
  const metricLabels = {
    clarity: "Clarity",
    coherence: "Coherence",
    delivery: "Delivery",
    vocabulary: "Vocabulary",
    overallImpact: "Overall Impact",
    fluency: "Fluency",
    engagement: "Engagement",
  };

  // Define all available metrics
  const availableMetrics = [
    "clarity",
    "coherence",
    "delivery",
    "vocabulary",
    "overallImpact",
    "fluency",
    "engagement",
  ];

  useEffect(() => {
    if (!evaluations || !evaluations.length) return;

    // Sort evaluations by date
    const sortedEvals = [...evaluations].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Extract dates for x-axis
    const categories = sortedEvals.map((evaluation) =>
      new Date(evaluation.date).toLocaleDateString()
    );

    // Determine which metrics to show
    const metricsToShow = allMetrics ? availableMetrics : selectedMetrics;

    // Create series data for each selected metric
    const series = metricsToShow.map((metric) => ({
      name: metricLabels[metric as keyof typeof metricLabels],
      data: sortedEvals.map(
        (evaluation) =>
          evaluation.scores[metric as keyof typeof evaluation.scores] || 0
      ),
      color: metricColors[metric as keyof typeof metricColors],
    }));

    // Configure the ApexCharts options
    const options: ApexOptions = {
      chart: {
        type: "line",
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 5,
        hover: {
          size: 7,
        },
        // Remove the width property that's causing the error
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: (value: number) => `${value.toFixed(1)} / 10`,
        },
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            fontSize: "12px",
            fontFamily: "inherit",
          },
        },
        title: {
          text: "Date",
          style: {
            fontSize: "14px",
            fontWeight: 500,
          },
        },
      },
      yaxis: {
        min: 0,
        max: 10,
        tickAmount: 5,
        title: {
          text: "Score (0-10)",
          style: {
            fontSize: "14px",
            fontWeight: 500,
          },
        },
        labels: {
          formatter: (value: number) => value.toFixed(0),
        },
      },
      grid: {
        borderColor: "#e2e8f0",
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "center",
        fontSize: "14px",
        // Remove the width property from markers
        markers: {
          height: 12,
          radius: 12,
        },
        itemMargin: {
          horizontal: 10,
        },
      },
    };

    setChartData({ options, series });
  }, [
    evaluations,
    selectedMetrics,
    timeframe,
    allMetrics,
    availableMetrics,
    metricColors,
    metricLabels,
  ]);

  if (!chartData || evaluations.length === 0) {
    return (
      <div className="w-full shadow-lg bg-white rounded-lg">
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500 font-medium text-lg">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full shadow-lg bg-white rounded-lg">
      <div className="flex flex-col gap-4 rounded-none md:flex-row md:items-center px-6 py-4 border-b">
        <div className="w-12 h-12 rounded-lg bg-blue-600 p-3 text-white flex items-center justify-center">
          <ChartBarIcon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Speech Evaluation Progress
          </h3>
          <p className="text-sm text-gray-600">
            {allMetrics ? (
              "Tracking all speaking metrics over time"
            ) : (
              <>
                Track your improvements in{" "}
                {selectedMetrics.length === 1
                  ? metricLabels[
                      selectedMetrics[0] as keyof typeof metricLabels
                    ]
                  : "multiple speaking metrics"}{" "}
                over time
              </>
            )}
          </p>
        </div>
      </div>
      <div className="px-4 pb-4 pt-0">
        <div className="h-[400px]">
          {chartData && (
            <Chart
              options={chartData.options}
              series={chartData.series}
              type="line"
              height="100%"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
