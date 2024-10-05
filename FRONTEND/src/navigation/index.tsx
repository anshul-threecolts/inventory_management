import {
  Routes,
  Route,
  Navigate,
  RouteProps,
  RoutesProps,
} from "react-router-dom";

import React, { Suspense, useEffect } from "react";
import { useState } from "react";
import ProtectedRoute from "./ProtectedRoute";
import Main from "../components/Main";
import { RootState } from "../config/Store";
import { UserState } from "../reducer/AuthReducer";
import { useSelector } from "react-redux";
const Navigation = () => {

  interface ProtectedRouteProps extends RoutesProps {
    isAuthenticated: boolean;
    authenticationPath: string;
  }

  const login: any = useSelector<RootState, UserState>((state: any) => state.userLogin);

  // element = { defaultProtectedRouteProps.isAuthenticated || login.loginSuccess ? (<Navigate replace to="/dashboard" />) : item.component }

  const defaultProtectedRouteProps: Omit<ProtectedRouteProps, "outlet"> = {
    isAuthenticated: localStorage.getItem("token") != null,
    authenticationPath: "/login",
  };

  const Login = React.lazy(() => import("../components/Login/Login"));
  const Dashboard = React.lazy(() => import("../pages/Dashboard/Dashboard"));
  const Charging = React.lazy(() => import("../pages/Charging/Charging"));
  const Station = React.lazy(() => import("../pages/Station/Station"));
  const Users = React.lazy(() => import("../pages/Users/Users"));
  const Bookings = React.lazy(() => import("../pages/Bookings/Bookings"));
  const VendorManagement = React.lazy(() => import("../pages/VendorManagement/VendorManagement"));
  const Feedback = React.lazy(() => import("../pages/Feedback/Feedback"));
  const Feedbackdetails = React.lazy(() => import("../pages/Feedbackdetails/Feedbackdetails"));
  const ChargingdetailsTab =  React.lazy(() => import("../pages/Charging/Chargin.details.tab"));
  const ServiceMonitoring =  React.lazy(() => import("../pages/Service-Monitoring/Service.Monitoring"));
  const CustomerDatabase = React.lazy(() => import("../pages/Customer-Database/Customer.Database"));

  return (
    <>
      <div id="main-wraper">
        <Routes>
          <Route
            path="/login"
            element={
              <Suspense fallback={<></>}>{defaultProtectedRouteProps.isAuthenticated || login.loginSuccess ? (<Navigate replace to="/dashboard" />) : <Login />}</Suspense>
            }
          />
          <Route path="/" element={defaultProtectedRouteProps.isAuthenticated || login.loginSuccess ? (<Navigate replace to="/dashboard" />) : <Navigate replace to="/login" />} />
          <Route path="/"
            element={
              <ProtectedRoute
                {...defaultProtectedRouteProps}
                outlet={<Main />}
              />
            }
          >

            <Route path="/dashboard" element={<Suspense fallback={<></>}> <Dashboard /> </Suspense>} />
            <Route path="/charging" element={<Suspense fallback={<></>}> <Charging /> </Suspense>} />
            <Route path="/charging-details" element={<Suspense fallback={<></>}> <ChargingdetailsTab /> </Suspense>} />
            <Route path="/station" element={<Suspense fallback={<></>}> <Station /> </Suspense>} />
            <Route path="/users" element={<Suspense fallback={<></>}> <Users /> </Suspense>} />
            <Route path="/bookings" element={<Suspense fallback={<></>}> <Bookings /> </Suspense>} />
            <Route path="/vendor-management" element={<Suspense fallback={<></>}> <VendorManagement /> </Suspense>} />
            <Route path="/customer-database" element={<Suspense fallback={<></>}> <CustomerDatabase /> </Suspense>} />
            <Route path="/feedback" element={<Suspense fallback={<></>}> <Feedback /> </Suspense>} />
            <Route path="/feedbackdetails" element={<Suspense fallback={<></>}> <Feedbackdetails /> </Suspense>} />
            <Route path="/service-monitoring" element={<Suspense fallback={<></>}> <ServiceMonitoring /> </Suspense>} />
          </Route>
        </Routes >
      </div >
    </>
  );
};

export default Navigation;
