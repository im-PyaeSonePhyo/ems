import React from "react";
import {
  FaTachometerAlt,
  FaUser,
  FaRegCalendarAlt,
  FaMoneyCheck,
} from "react-icons/fa";
import { AiFillSetting } from "react-icons/ai";
import Sidebar from "../layout/Sidebar";
import { observer } from "mobx-react-lite";
import { authStore } from "../../stores/auth.store";

const EmployeeSidebar = observer(() => {
  const { user } = authStore;

  const SIDEBAR_ITEMS = [
    {
      name: "Dashboard",
      icon: FaTachometerAlt,
      color: "oklch(58.5% 0.233 277.117)",
      href: "/employee-dashboard",
    },
    {
      name: "My Profile",
      icon: FaUser,
      color: "oklch(71.5% 0.143 215.221)",
      href: `profile/${user._id}`,
    },
    {
      name: "Leaves",
      icon: FaRegCalendarAlt,
      color: "oklch(62.3% 0.214 259.815)",
      href: `leaves/${user._id}`,
    },
    {
      name: "Salary",
      icon: FaMoneyCheck,
      color: "oklch(72.3% 0.219 149.579)",
      href: `salary/employee/${user._id}`,
    },
    {
      name: "Settings",
      icon: AiFillSetting,
      color: "oklch(76.9% 0.188 70.08)",
      href: "setting",
    },
  ];
  return (
    <>
      <Sidebar SIDEBAR_ITEMS={SIDEBAR_ITEMS} />
    </>
  );
});

export default EmployeeSidebar;
