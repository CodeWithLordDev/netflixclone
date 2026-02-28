"use client";

import { AnimatePresence, motion } from "framer-motion";

export function Drawer({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="Close drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />
          {children}
        </>
      )}
    </AnimatePresence>
  );
}

export function DrawerContent({ className = "", children }) {
  return (
    <motion.aside
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 18, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`fixed z-[60] ${className}`.trim()}
    >
      {children}
    </motion.aside>
  );
}
