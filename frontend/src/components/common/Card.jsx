import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import React from "react"
import { Skeleton } from "./Skeleton";

const Card = ({ name, icon: Icon, value, color, to, isLoading = false }) => {
  const content = (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 h-full"
      whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
    >
      <div className="px-4 py-5 sm:p-6">
        <span className="flex items-center text-sm font-medium text-gray-400">
          <Icon size={20} className="mr-2 shrink-0" style={{ color }} />
          {name}
        </span>
        {isLoading ? (
          <Skeleton className="mt-3 h-8 w-20" />
        ) : (
          <p className="mt-1 text-3xl font-semibold text-gray-100 break-words">
            {value}
          </p>
        )}
      </div>
    </motion.div>
  );

  if (!to) return content;

  return <Link to={to}>{content}</Link>;
}

export default Card
