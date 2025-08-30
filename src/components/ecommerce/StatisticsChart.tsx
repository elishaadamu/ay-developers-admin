import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

import { MoreDotIcon } from "../../icons";
import { decryptData } from "../../utilities/encryption";
import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "../../utilities/config";

export default function StatisticsChart() {
  const [userData, setUserData] = useState<any>(null);
  const [chartData, setChartData] = useState<any>({
    series: [{ name: "Daily Sales", data: [] }],
    categories: [],
  });

  // Load user data from localStorage
  useEffect(() => {
    try {
      const encryptedUserData = localStorage.getItem("userData");
      if (encryptedUserData) {
        const decryptedUserData = decryptData(encryptedUserData);
        setUserData(decryptedUserData);
      } else {
        console.log("No user data found in localStorage");
      }
    } catch (error) {
      console.error("Failed to decrypt user data:", error);
    }
  }, []);

  // Fetch API data
  const fetchCharts = async () => {
    try {
      if (!userData) {
        throw new Error("No user data available");
      }

      const response = await axios.get(
        `${apiUrl(API_CONFIG.ENDPOINTS.AUTH.getSales)}`
      );

      console.log("🔄 Fetching charts from API", response.data.data);

      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      const dailySales = new Array(daysInMonth).fill(0);
      const categories = Array.from({ length: daysInMonth }, (_, i) =>
        (i + 1).toString()
      );

      if (response.data && Array.isArray(response.data.data)) {
        response.data.data.forEach((transaction: any) => {
          const transactionDate = new Date(transaction.paidAt);
          if (
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear
          ) {
            const dayOfMonth = transactionDate.getDate();
            dailySales[dayOfMonth - 1] += transaction.amount;
          }
        });
      }

      setChartData({
        series: [{ name: "Daily Sales", data: dailySales }],
        categories: categories,
      });
    } catch (error) {
      console.error("Error fetching charts:", error);
    }
  };

  // Run fetch once userData is ready
  useEffect(() => {
    if (userData) {
      fetchCharts();
    }
  }, [userData]);

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "line",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartData.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  const series = chartData.series;

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Daily Growth
        </h3>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="line" height={180} />
        </div>
      </div>
    </div>
  );
}