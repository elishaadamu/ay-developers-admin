import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SignIn from "./pages/AuthPages/SignIn";
// import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AdminProfile from "./pages/AuthPages/AdminProfile";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { decryptData } from "./utilities/encryption";
import { API_CONFIG, apiUrl } from "./utilities/config";
import axios from "axios";
import ProtectedRoute from "./components/auth/ProtectedRoute";
// Add new imports for sidebar pages
import Products from "./pages/Admin/ProductItems";
import Tickets from "./pages/Admin/Tickets";
import Customers from "./pages/Admin/Users/Customers";
import Promotions from "./pages/Admin/Promotions";
import PayoutWithdrawal from "./pages/Admin/PayoutWithdrawal";
import Reports from "./pages/Admin/Reports";
import Settings from "./pages/Admin/Settings";
import AddUsers from "./pages/Admin/Users/AddUsers";
import Ambassador from "./pages/Admin/Users/Ambassador";
import SGManagers from "./pages/Admin/Users/SGManager";

export default function App() {
  const [userData, setUserData] = useState<UserData | null>(null);

  interface UserData {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    role?: string;
    photo?: string;
    country?: string;
    state?: string;
  }
  useEffect(() => {
    // Decrypt and load user data when component mounts
    try {
      const encryptedUserData = localStorage.getItem("userData");

      if (encryptedUserData) {
        const decryptedUserData = decryptData(encryptedUserData);
        setUserData(decryptedUserData);
      }
    } catch (error) {
      console.error("Failed to decrypt user data:", error);
    }
  }, []);
  // Update the useEffect that fetches data
  useEffect(() => {
    const dbUsername = async () => {
      try {
        const dbUser = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.AUTH.UserData + userData?.id)
        );
        console.log("db APP.jsx", dbUser.data.user);
      } catch (error) {
        console.log(error);
      }
    };
    if (userData?.id) {
      dbUsername();
    }
  }, [userData?.id]);

  return (
    <>
      <ToastContainer />
      <Router>
        <ScrollToTop />

        <Routes>
          {/* Dashboard Layout - Protected */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index path="/" element={<Home />} />

            {/* Main Menu Pages */}
            <Route path="/add-users" element={<AddUsers />} />
            <Route path="/ambassadors" element={<Ambassador />} />
            <Route path="/sg-managers" element={<SGManagers />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/withdrawals" element={<PayoutWithdrawal />} />
            <Route path="/reports" element={<Reports />} />

            {/* Profile Pages */}
            <Route path="/profile" element={<AdminProfile />} />
            <Route path="/settings" element={<Settings />} />

            {/* Others Page */}
            <Route path="/calendar" element={<Calendar />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          {/* <Route path="/signup" element={<SignUp />} /> */}

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}