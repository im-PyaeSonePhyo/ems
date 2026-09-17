import { observer } from "mobx-react-lite";
import UpdatePassword from "./UpdatePassword";
import { motion } from "framer-motion";
import Navbar from "../layout/Navbar";
import React from "react";

const Setting = observer(() => {
  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Navbar title={"Settings"} />
      <main className={`max-w-3xl mx-auto py-6 px-4 lg:px-8`}>
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <UpdatePassword />
        </motion.div>
      </main>
    </div>
  );
});

export default Setting;
