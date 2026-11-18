
"use client";

import { useEffect, useState } from "react";

type Dish = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: string;
  image: string;
};

type CartItem = {
  dish: Dish;
  quantity: number;
};

type OrderStatus = "Received" | "Preparing" | "Ready" | "Completed";
type PaymentStatus = "Pending" | "Paid" | "Failed";

type OrderConfirmation = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  orderType: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  total: number;
  items: CartItem[];
  createdAt: string;
  status: OrderStatus;
};

const statuses: OrderStatus[] = [
  "Received",
  "Preparing",
  "Ready",
  "Completed",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderConfirmation[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  
useEffect(() => {
  const loadOrders = async () => {
    try {
      const response = await fetch("/api/orders");

      if (!response.ok) {
        throw new Error("Failed to load orders");
      }

      const data = await response.json();

      const formattedOrders: OrderConfirmation[] = data.map(
        (order: {
          id: string;
          orderNumber: string;
          customerName: string;
          phone: string;
          address: string | null;
          orderType: string;
          paymentMethod: string;
          createdAt: string;
          paymentStatus: string;
          total: number;
          status: string;
          items: {
            menuItem: Dish;
            quantity: number;
          }[];
        }) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          phone: order.phone,
          address: order.address || "",
          orderType:
            order.orderType === "DELIVERY"
              ? "Delivery"
              : order.orderType === "PICKUP"
                ? "Pickup"
                : "Dine In",
          paymentMethod:
            order.paymentMethod === "CASH"
              ? "Cash on Delivery"
              : "Online Payment",
          total: order.total,
          createdAt: order.createdAt,
          status:
            order.status === "PREPARING"
              ? "Preparing"
              : order.status === "READY"
                ? "Ready"
                : order.status === "COMPLETED"
                  ? "Completed"
                  : "Received",
          items: order.items.map((item) => ({
            dish: item.menuItem,
            quantity: item.quantity,
          })),
          paymentStatus:
  order.paymentStatus === "PAID"
    ? "Paid"
    : order.paymentStatus === "FAILED"
      ? "Failed"
      : "Pending",
        })
      );

      setOrders(formattedOrders);
    } catch (error) {
      console.error("Could not load orders:", error);
    } finally {
      setLoaded(true);
    }
  };

  loadOrders();

  const interval = window.setInterval(loadOrders, 5000);

  return () => window.clearInterval(interval);
}, []);

  
async function updateStatus(
  orderNumber: string,
  newStatus: OrderStatus
) {
  const order = orders.find(
    (item) => item.orderNumber === orderNumber
  );

  if (!order) return;

  try {
    const response = await fetch("/api/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: order.id,
        status: newStatus,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update order status");
    }

    setOrders((previousOrders) =>
      previousOrders.map((item) =>
        item.id === order.id
          ? { ...item, status: newStatus }
          : item
      )
    );
  } catch (error) {
    console.error("Order status update error:", error);
    alert("Could not update order status. Please try again.");
  }
}


async function updatePaymentStatus(
  orderNumber: string,
  newStatus: PaymentStatus
) {
  const order = orders.find(
    (item) => item.orderNumber === orderNumber
  );

  if (!order) return;

  try {
    const response = await fetch("/api/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: order.id,
        paymentStatus: newStatus,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to update payment status"
      );
    }

    setOrders((previousOrders) =>
      previousOrders.map((item) =>
        item.id === order.id
          ? { ...item, paymentStatus: newStatus }
          : item
      )
    );

    alert("Payment status updated successfully!");
  } catch (error) {
    console.error("Payment update error:", error);
    alert("Could not update payment status.");
  }
}


  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.phone.includes(search);

    const matchesFilter =
      filter === "All" || order.status === filter;

    return matchesSearch && matchesFilter;
  });

  const totalRevenue = orders
  .filter(
    (order) =>
      order.status === "Completed" &&
      order.paymentStatus === "Paid"
  )
  .reduce((sum, order) => sum + order.total, 0);

  const countStatus = (status: string) =>
    orders.filter((order) => order.status === status).length;

  function statusColor(status: OrderStatus) {
    switch (status) {
      case "Received":
        return "bg-yellow-100 text-yellow-800";
      case "Preparing":
        return "bg-blue-100 text-blue-800";
      case "Ready":
        return "bg-purple-100 text-purple-800";
      case "Completed":
        return "bg-green-100 text-green-800";
    }
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#f7f6f0] p-10">
        Loading orders...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6f0] p-5 text-[#26372b] md:p-9">

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <a
            href="/admin"
            className="text-sm font-semibold text-[#d77a39]"
          >
            ← Back to Dashboard
          </a>

          <h1 className="mt-3 text-3xl font-bold">
            Orders Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View and manage all customer food orders.
          </p>
        </div>

        <a
          href="/admin/kitchen"
          className="rounded-xl bg-[#26372b] px-5 py-3 text-sm font-semibold text-white"
        >
          Open Kitchen Dashboard →
        </a>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Total Orders", value: orders.length, icon: "📦" },
          { title: "Received", value: countStatus("Received"), icon: "🕒" },
          { title: "Preparing", value: countStatus("Preparing"), icon: "👨‍🍳" },
          { title: "Completed Revenue", value: `₹${totalRevenue}`, icon: "💰" },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-[#e8e5dc] bg-white p-5 shadow-sm"
          >
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">{item.title}</p>
              <span className="text-2xl">{item.icon}</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row">
        <input
          type="text"
          placeholder="Search order number, customer or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#d77a39]"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-3"
        >
          <option value="All">All Orders</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Orders */}
      <div className="space-y-5">
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">📦</div>
            <h3 className="mt-4 text-xl font-bold">
              No Orders Found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Customer orders will appear here after checkout.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.orderNumber}
              className="rounded-2xl border border-[#e8e5dc] bg-white p-5 shadow-sm md:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-xs font-bold ${statusColor(order.status)}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="my-5 grid gap-4 border-y border-gray-100 py-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-400">CUSTOMER</p>
                  <p className="mt-1 font-semibold">{order.customerName}</p>
                  <p className="text-sm text-gray-500">{order.phone}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">ORDER TYPE</p>
                  <p className="mt-1 font-semibold">{order.orderType}</p>
                  <p className="text-sm text-gray-500">
                    {order.orderType === "Delivery"
                      ? order.address
                      : "Restaurant Pickup"}
                  </p>
                </div>

                <div>
  <p className="text-xs text-gray-400">PAYMENT METHOD</p>
  <p className="mt-1 font-semibold">{order.paymentMethod}</p>

  <p className="mt-3 text-xs text-gray-400">
    PAYMENT STATUS
  </p>

  <span
    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
      order.paymentStatus === "Paid"
        ? "bg-green-100 text-green-800"
        : order.paymentStatus === "Failed"
          ? "bg-red-100 text-red-800"
          : "bg-yellow-100 text-yellow-800"
    }`}
  >
    {order.paymentStatus}
  </span>
</div>

                <div>
                  <p className="text-xs text-gray-400">TOTAL AMOUNT</p>
                  <p className="mt-1 text-xl font-bold text-[#d77a39]">
                    ₹{order.total}
                  </p>
                </div>
              </div>

              <h4 className="mb-3 font-bold">Ordered Items</h4>

              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div
                    key={`${order.orderNumber}-${item.dish.id}-${index}`}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span>
                      {item.dish.name} × {item.quantity}
                    </span>
                    <span className="font-semibold">
                      ₹{item.dish.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
                <p className="text-sm font-bold">Update Order Status</p>

                <select
                  value={order.status}
                  onChange={(e) =>
                    updateStatus(
                      order.orderNumber,
                      e.target.value as OrderStatus
                    )
                  }
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              {/* Order status */}
<div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
  {/* Existing order status dropdown */}
</div>

{/* ADD PAYMENT STATUS DROPDOWN HERE */}
<div className="mt-5 ...">
  ...
</div>
            </div>
          ))
        )}
      </div>

      <footer className="mt-10 text-center text-xs text-gray-400">
        © DineDesk. Restaurant Management System.
      </footer>
    </main>
  );
}
