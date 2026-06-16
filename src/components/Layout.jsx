import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import { motion } from 'framer-motion';

const Layout = ({ children, title }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-navy-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <motion.div
            className="p-4 md:p-6 page-transition"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default Layout;
