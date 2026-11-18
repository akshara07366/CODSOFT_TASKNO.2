
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const sections = [
  {
    title: "Manage Orders",
    description: "View and manage customer orders.",
    icon: "📦",
    href: "/admin/orders",
  },
  {
    title: "Reservations",
    description: "Confirm or reject table bookings.",
    icon: "🪑",
    href: "/admin/reservations",
  },
  {
    title: "Menu Management",
    description: "Add, edit and remove food items.",
    icon: "🍕",
    href: "/admin/menu",
  },
  {
    title: "Kitchen Dashboard",
    description: "Manage food preparation and order status.",
    icon: "👨‍🍳",
    href: "/admin/kitchen",
  },
  {
    title: "Customers",
    description: "View customer information.",
    icon: "👥",
    href: "/admin/customers",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { title: "Total Orders", value: "0", icon: "🛍️", note: "All customer orders" },
    { title: "Reservations", value: "0", icon: "🪑", note: "Table bookings" },
    { title: "Menu Items", value: "0", icon: "🍽️", note: "Available dishes" },
    { title: "Revenue", value: "₹0", icon: "💰", note: "Completed orders" },
  ]);


const [recentOrders, setRecentOrders] = useState<
  {
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
  }[]
>([]);

const [recentReservations, setRecentReservations] = useState<
  {
    id: string;
    name: string;
    date: string;
    time: string;
    status: string;
  }[]
>([]);

  
useEffect(() => {
  async function loadDashboardStats() {
    try {
      const [ordersResponse, reservationsResponse, menuResponse] =
        await Promise.all([
          fetch("/api/orders"),
          fetch("/api/reservations"),
          fetch("/api/menu"),
        ]);

      if (
        !ordersResponse.ok ||
        !reservationsResponse.ok ||
        !menuResponse.ok
      ) {
        throw new Error("Failed to load dashboard data");
      }

      const orders = await ordersResponse.json();
      const reservations = await reservationsResponse.json();
      const menu = await menuResponse.json();

      setRecentOrders(
        orders.slice(0, 5).map(
          (order: {
            orderNumber: string;
            customerName: string;
            total: number;
            status: string;
          }) => ({
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            total: order.total,
            status:
              order.status === "PREPARING"
                ? "Preparing"
                : order.status === "READY"
                  ? "Ready"
                  : order.status === "COMPLETED"
                    ? "Completed"
                    : order.status === "CANCELLED"
                      ? "Cancelled"
                      : "Received",
          })
        )
      );

      setRecentReservations(
        reservations.slice(0, 5).map(
          (reservation: {
            id: string;
            name: string;
            date: string;
            time: string;
            status: string;
          }) => ({
            id: reservation.id,
            name: reservation.name,
            date: reservation.date.slice(0, 10),
            time: reservation.time,
            status:
              reservation.status === "CONFIRMED"
                ? "Confirmed"
                : reservation.status === "REJECTED"
                  ? "Rejected"
                  : reservation.status === "CANCELLED"
                    ? "Cancelled"
                    : "Pending",
          })
        )
      );

      const completedOrders = orders.filter(
        (order: { status: string }) =>
          order.status === "COMPLETED"
      );

      const revenue = completedOrders.reduce(
        (sum: number, order: { total: number }) =>
          sum + Number(order.total || 0),
        0
      );

      setStats([
        {
          title: "Total Orders",
          value: String(orders.length),
          icon: "🛍️",
          note: "All customer orders",
        },
        {
          title: "Reservations",
          value: String(reservations.length),
          icon: "🪑",
          note: "Total table bookings",
        },
        {
          title: "Menu Items",
          value: String(
            menu.filter(
              (dish: { available?: boolean }) =>
                dish.available !== false
            ).length
          ),
          icon: "🍽️",
          note: "Available dishes",
        },
        {
          title: "Revenue",
          value: "₹" + revenue.toLocaleString("en-IN"),
          icon: "💰",
          note: "Completed orders",
        },
      ]);
    } catch (error) {
      console.error("Could not load dashboard statistics:", error);
    }
  }

  loadDashboardStats();

  const interval = window.setInterval(loadDashboardStats, 5000);

  return () => window.clearInterval(interval);
}, []);

  return (
    <main className="min-h-screen bg-[#f7f6f0] text-[#26372b]">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 bg-[#26372b] p-6 text-white md:block">
          <h1 className="mb-2 text-2xl font-bold">DineDesk</h1>
          <p className="mb-10 text-sm text-gray-300">
            Restaurant Admin
          </p>

          <nav className="space-y-3">
            <Link href="/admin" className="block rounded-xl bg-[#405744] px-4 py-3">
              🏠 Dashboard
            </Link>

            <Link href="/admin/orders" className="block rounded-xl px-4 py-3 hover:bg-[#405744]">
              📦 Orders
            </Link>

            <Link href="/admin/reservations" className="block rounded-xl px-4 py-3 hover:bg-[#405744]">
              🪑 Reservations
            </Link>

            <Link href="/admin/menu" className="block rounded-xl px-4 py-3 hover:bg-[#405744]">
              🍕 Menu Management
            </Link>

            <Link href="/admin/kitchen" className="block rounded-xl px-4 py-3 hover:bg-[#405744]">
              👨‍🍳 Kitchen
            </Link>

            <Link href="/admin/customers" className="block rounded-xl px-4 py-3 hover:bg-[#405744]">
              👥 Customers
            </Link>
          </nav>

          <Link href="/" className="mt-12 block rounded-xl border border-white/20 px-4 py-3 text-sm hover:bg-[#405744]">
            ← Back to Website
          </Link>
        </aside>

        {/* Main Content */}
        <section className="min-w-0 flex-1 p-5 md:p-9">

          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Restaurant Management</p>
              <h2 className="mt-1 text-3xl font-bold">Admin Dashboard</h2>
              <p className="mt-2 text-sm text-gray-500">
                Welcome back! Here's your restaurant overview.
              </p>
            </div>

            <Link
              href="/admin/login"
              className="rounded-xl border border-[#26372b] px-4 py-2 text-sm font-semibold hover:bg-[#26372b] hover:text-white"
            >
              Admin Login
            </Link>
          </header>

          {/* Statistics */}
          <div className="mb-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="rounded-2xl border border-[#e8e5dc] bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                  <span className="text-2xl">{stat.icon}</span>
                </div>

                <h3 className="mt-4 text-3xl font-bold">{stat.value}</h3>
                <p className="mt-2 text-xs text-gray-500">{stat.note}</p>
              </div>
            ))}
          </div>

          {/* Management Sections */}
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-bold">Management Sections</h3>
            <span className="text-xs text-gray-500">Quick access</span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {sections.map((section) => (
              <Link
                key={section.title}
                href={section.href}
                className="rounded-2xl border border-[#e8e5dc] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className="text-3xl">{section.icon}</span>
                <h4 className="mt-4 text-lg font-bold">
                  {section.title}
                </h4>
                <p className="mt-2 text-sm text-gray-500">
                  {section.description}
                </p>
                <p className="mt-5 text-sm font-semibold text-[#d77a39]">
                  Open Section →
                </p>
              </Link>
            ))}
          </div>

          
{/* Recent Activity */}
<div className="mt-9">
  <h3 className="mb-5 text-xl font-bold">Recent Activity</h3>

  <div className="grid gap-5 lg:grid-cols-2">

    {/* Recent Orders */}
    <div className="rounded-2xl border border-[#e8e5dc] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-bold">📦 Recent Orders</h4>
        <Link href="/admin/orders" className="text-sm text-[#d77a39]">
          View All →
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <p className="text-sm text-gray-500">No orders yet.</p>
      ) : (
        recentOrders.map((order) => (
          <div
            key={order.orderNumber}
            className="flex items-center justify-between border-t border-gray-100 py-3"
          >
            <div>
              <p className="text-sm font-semibold">{order.customerName}</p>
              <p className="text-xs text-gray-500">{order.orderNumber}</p>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold">₹{order.total}</p>
              <p className="text-xs text-[#d77a39]">{order.status}</p>
            </div>
          </div>
        ))
      )}
    </div>

    {/* Recent Reservations */}
    <div className="rounded-2xl border border-[#e8e5dc] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-bold">🪑 Recent Reservations</h4>
        <Link href="/admin/reservations" className="text-sm text-[#d77a39]">
          View All →
        </Link>
      </div>

      {recentReservations.length === 0 ? (
        <p className="text-sm text-gray-500">No reservations yet.</p>
      ) : (
        recentReservations.map((reservation) => (
          <div
            key={reservation.id}
            className="flex items-center justify-between border-t border-gray-100 py-3"
          >
            <div>
              <p className="text-sm font-semibold">{reservation.name}</p>
              <p className="text-xs text-gray-500">
                {reservation.date} · {reservation.time}
              </p>
            </div>

            <p className="text-xs text-[#d77a39]">
              {reservation.status}
            </p>
          </div>
        ))
      )}
    </div>
  </div>
  </div>
</section>
</div>

   </main>
  );
}
