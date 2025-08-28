import { useEffect, useState } from "react";
import axios from "axios";
import { Users as GroupIcon, Package as BoxIconLine } from "lucide-react";
import { apiUrl, API_CONFIG } from "../../utilities/config";

export default function EcommerceMetric() {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.getSales)
      );

      const orders = response.data;
      console.log("🔄 Fetching orders from API...", orders);
      setTotalOrders(orders.count);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
    }
  };
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.GetUsers)
      );

      const customers = response.data;
      console.log("🔄 Fetching customers from API...", response.data);
      setTotalCustomers(customers.length);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Customers */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Customers
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalCustomers === 0 ? "Loading..." : totalCustomers}
            </h4>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalOrders === 0 ? "Loading..." : totalOrders}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}
