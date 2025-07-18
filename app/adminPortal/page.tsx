"use client";

import { AdminPortal } from "./AdminPortal";

export default function AdminPage() {
  return (
    <AdminPortal
      formatPrice={(price) => `PKR ${(price || 0).toFixed(2)}`}
    />
  );
}