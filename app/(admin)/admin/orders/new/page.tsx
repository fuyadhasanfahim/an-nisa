"use client";

import { AdminTitle } from "@/components/admin/AdminTitle";
import { OrderForm } from "@/components/admin/order/OrderForm";
import { motion } from "framer-motion";

export default function NewOrderPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className="space-y-6"
    >
      <AdminTitle
        title="New order"
        subtitle="Choose a customer and add line items from your catalog."
      />

      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-black/5">
          <OrderForm />
        </div>
      </div>
    </motion.div>
  );
}
