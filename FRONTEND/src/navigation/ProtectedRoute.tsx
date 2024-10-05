import * as React from "react";
import { Navigate } from "react-router";
import WebService from "../Services/WebService";
export type ProtectedRouteProps = {
  authenticationPath: string;
  outlet: JSX.Element;
};

export default function ProtectedRoute({
  authenticationPath,
  outlet,
}: ProtectedRouteProps) {
  // if (localStorage.getItem("access_token") != null) {
  return outlet;
  // } else {
  //   let platform =
  //     localStorage.getItem("platform") != undefined
  //       ? localStorage.getItem("platform")
  //       : "egrowth";
  //   localStorage.clear();
  //   window.location.href ="/login";
  //   return outlet;
  // }
}
