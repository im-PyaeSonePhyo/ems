import React from 'react'
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaRegCalendarAlt,
  FaMoneyCheck,
} from "react-icons/fa";
import { AiFillSetting } from "react-icons/ai";
import Sidebar from '../layout/Sidebar';
import { observer } from 'mobx-react-lite';

const SIDEBAR_ITEMS = [
  {
    name: "Dashboard",
    icon: FaTachometerAlt,
    color: "oklch(58.5% 0.233 277.117)",
    href: "/admin-dashboard",
  },
  {
    name: "Employees",
    icon: FaUsers,
    color: "oklch(71.5% 0.143 215.221)",
    href: "employees",
  },
  {
    name: "Departments",
    icon: FaBuilding,
    color: "oklch(62.7% 0.265 303.9)",
    href: "departments",
  },
  {
    name: "Leaves",
    icon: FaRegCalendarAlt,
    color: "oklch(62.3% 0.214 259.815)",
    href: "leaves",
  },
  {
    name: "Salary",
    icon: FaMoneyCheck,
    color: "oklch(72.3% 0.219 149.579)",
    href: "salary/collections",
  },
  {
    name: "Settings",
    icon: AiFillSetting,
    color: "oklch(76.9% 0.188 70.08)",
    href: "setting",
  },
];

const AdminSidebar = observer(() => {
  return (
    <>
        <Sidebar SIDEBAR_ITEMS={SIDEBAR_ITEMS}/>
    </>
  )
});

export default AdminSidebar