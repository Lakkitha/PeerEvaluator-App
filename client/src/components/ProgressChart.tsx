import { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

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
  const [activeTimeframe, setActiveTimeframe] = useState(timeframe);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Calculate average scores for the top metrics display
  const calculateAverages = () => {
    if (!evaluations || !evaluations.length) return {};

    const totals = evaluations.reduce(
      (acc, evaluation) => {
        return {
          clarity: acc.clarity + (evaluation.scores.clarity || 0),
          overallImpact:
            acc.overallImpact + (evaluation.scores.overallImpact || 0),
        };
      },
      { clarity: 0, overallImpact: 0 }
    );

    return {
      clarity: (totals.clarity / evaluations.length).toFixed(1),
      overallImpact: (totals.overallImpact / evaluations.length).toFixed(1),
    };
  };

  const averages = calculateAverages();

  // Use useMemo to fix dependency warnings
  const metricColors = useMemo(
    () => ({
      clarity: "#3b82f6", // blue-500
      coherence: "#ef4444", // red-500
      delivery: "#10b981", // emerald-500
      vocabulary: "#f97316", // orange-500
      overallImpact: "#8b5cf6", // violet-500
      fluency: "#eab308", // yellow-500
      engagement: "#6b7280", // gray-500
    }),
    []
  );

  // Use useMemo to fix dependency warnings
  const metricLabels = useMemo(
    () => ({
      clarity: "Clarity",
      coherence: "Coherence",
      delivery: "Delivery",
      vocabulary: "Vocabulary",
      overallImpact: "Overall Impact",
      fluency: "Fluency",
      engagement: "Engagement",
    }),
    []
  );

  // Use useMemo to fix dependency warnings
  const availableMetrics = useMemo(
    () => [
      "clarity",
      "coherence",
      "delivery",
      "vocabulary",
      "overallImpact",
      "fluency",
      "engagement",
    ],
    []
  );

  useEffect(() => {
    if (!evaluations || !evaluations.length) return;

    // Set active timeframe when prop changes
    setActiveTimeframe(timeframe);

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
          show: false, // Hide toolbar for a cleaner look
        },
        animations: {
          enabled: true,
          speed: 800,
          // Remove easing property as it doesn't exist in the type definition
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
        size: 4,
        hover: {
          size: 6,
        },
        // Remove height property as it doesn't exist in the type definition
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
      },
      yaxis: {
        min: 0,
        max: 10,
        tickAmount: 5,
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
        markers: {
          radius: 8,
          // Remove height property
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
      <div className="max-w-full w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg dark:bg-gray-700">
          <p className="text-gray-500 font-medium text-lg dark:text-gray-400">
            No data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
      <div className="flex justify-between mb-5">
        <div className="grid gap-4 grid-cols-2">
          <div>
            <h5 className="inline-flex items-center text-gray-500 dark:text-gray-400 leading-none font-normal mb-2">
              Clarity
              <span className="relative group">
                <InformationCircleIcon className="w-3 h-3 text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer ms-1" />
                <div className="absolute z-10 invisible group-hover:visible inline-block text-sm text-gray-500 bg-white border border-gray-200 rounded-lg shadow-xs w-72 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 top-full left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="p-3 space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Clarity Score
                    </h3>
                    <p>How clearly the speech's message was communicated.</p>
                  </div>
                </div>
              </span>
            </h5>
            <p className="text-gray-900 dark:text-white text-2xl leading-none font-bold">
              {averages.clarity}/10
            </p>
          </div>
          <div>
            <h5 className="inline-flex items-center text-gray-500 dark:text-gray-400 leading-none font-normal mb-2">
              Overall Impact
              <span className="relative group">
                <InformationCircleIcon className="w-3 h-3 text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer ms-1" />
                <div className="absolute z-10 invisible group-hover:visible inline-block text-sm text-gray-500 bg-white border border-gray-200 rounded-lg shadow-xs w-72 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 top-full left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="p-3 space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Overall Impact
                    </h3>
                    <p>The combined effectiveness and impact of the speech.</p>
                  </div>
                </div>
              </span>
            </h5>
            <p className="text-gray-900 dark:text-white text-2xl leading-none font-bold">
              {averages.overallImpact}/10
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            type="button"
            className="px-3 py-2 inline-flex items-center text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          >
            {timeframe === "week"
              ? "Last week"
              : timeframe === "month"
              ? "Last month"
              : timeframe === "year"
              ? "Last year"
              : "All time"}
            <svg
              className="w-2.5 h-2.5 ms-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 right-0">
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                <li>
                  <button
                    onClick={() => {
                      setActiveTimeframe("all");
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    All time
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTimeframe("week");
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Last 7 days
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTimeframe("month");
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Last 30 days
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTimeframe("year");
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Last 90 days
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="h-64">
        {chartData && (
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="line"
            height="100%"
          />
        )}
      </div>

      <div className="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between mt-2.5">
        <div className="pt-5">
          <a
            href="/progresstracking"
            className="px-5 py-2.5 text-sm font-medium text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <svg
              className="w-3.5 h-3.5 text-white me-2 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 16 20"
            >
              <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2Zm-3 15H4.828a1 1 0 0 1 0-2h6.238a1 1 0 0 1 0 2Zm0-4H4.828a1 1 0 0 1 0-2h6.238a1 1 0 1 1 0 2Z" />
              <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
            </svg>
            View full report
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
