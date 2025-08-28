import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

import { MoreDotIcon } from "../../icons";
import { decryptData } from "../../utilities/encryption";
import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "../../utilities/config";

export default function MonthlySalesChart() {
  const [userData, setUserData] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);

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
        `${apiUrl(API_CONFIG.ENDPOINTS.AUTH.getCharts)}`
      );

      console.log(
        "🔄 Fetching customers from API....................",
        response.data
      );
      setCharts(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
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
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
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
    fill: {
      opacity: 1,
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

  const series = [
    {
      name: "Sales",
      data: charts ? charts.monthlySales : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  ];

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Sales
        </h3>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={180} />
        </div>
      </div>
    </div>
  );
}
