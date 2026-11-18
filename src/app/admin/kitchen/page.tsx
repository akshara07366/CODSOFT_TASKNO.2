
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

type Order = {
  orderNumber: string;
  id : string;
  customerName: string;
  phone: string;
  address: string;
  orderType: string;
  paymentMethod: string;
  total: number;
  items: CartItem[];
  createdAt: string;
  status: OrderStatus;
};

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);

  
useEffect(() => {
  const loadOrders = async () => {
    try {
      const response = await fetch("/api/orders");

      if (!response.ok) {
        throw new Error("Failed to load kitchen orders");
      }

      const data = await response.json();

      const formattedOrders: Order[] = data.map(
        (order: {
          id: string;
          orderNumber: string;
          customerName: string;
          phone: string;
          address: string | null;
          orderType: string;
          paymentMethod: string;
          total: number;
          createdAt: string;
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
        })
      );

      setOrders(formattedOrders);
    } catch (error) {
      console.error("Unable to load kitchen orders:", error);
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
      throw new Error(data.error || "Failed to update order");
    }

    setOrders((previousOrders) =>
      previousOrders.map((item) =>
        item.id === order.id
          ? { ...item, status: newStatus }
          : item
      )
    );
  } catch (error) {
    console.error("Kitchen status update error:", error);
    alert("Could not update order status. Please try again.");
  }
}


  const activeOrders = orders.filter(
    (order) =>
      order.status === "Received" ||
      order.status === "Preparing" ||
      order.status === "Ready"
  );

  const receivedCount = orders.filter(
    (order) => order.status === "Received"
  ).length;

  const preparingCount = orders.filter(
    (order) => order.status === "Preparing"
  ).length;

  const readyCount = orders.filter(
    (order) => order.status === "Ready"
  ).length;

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#f7f6f0] p-10">
        Loading kitchen orders...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6f0] p-5 text-[#26372b] md:p-9">

      {/* Header */}
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <a
            href="/admin"
            className="text-sm font-semibold text-[#d77a39]"
          >
            ← Back to Admin Dashboard
          </a>

          <h1 className="mt-3 text-3xl font-bold">
            Kitchen Dashboard 👨‍🍳
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage incoming orders and food preparation.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-[#26372b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#405744]"
        >
          ↻ Refresh Orders
        </button>
      </header>

      {/* Statistics */}
      <div className="mb-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Active Orders",
            value: activeOrders.length,
            icon: "📦",
          },
          {
            title: "New Orders",
            value: receivedCount,
            icon: "🕒",
          },
          {
            title: "Preparing",
            value: preparingCount,
            icon: "🔥",
          },
          {
            title: "Ready",
            value: readyCount,
            icon: "✅",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-[#e8e5dc] bg-white p-6 shadow-sm"
          >
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">{item.title}</p>
              <span className="text-2xl">{item.icon}</span>
            </div>
            <h2 className="mt-4 text-3xl font-bold">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* Incoming Orders */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold">Incoming Kitchen Orders</h2>
        <span className="text-xs text-gray-500">
          {activeOrders.length} active orders
        </span>
      </div>

      {activeOrders.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <div className="text-5xl">🍽️</div>
          <h3 className="mt-4 text-xl font-bold">
            No Active Orders
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            New customer orders will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {activeOrders.map((order) => (
            <div
              key={order.orderNumber}
              className="rounded-2xl border border-[#e8e5dc] bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <span className="rounded-full bg-orange-100 px-4 py-2 text-xs font-bold text-orange-800">
                  {order.status}
                </span>
              </div>

              <div className="my-5 rounded-xl bg-[#faf8f2] p-4">
                <p className="text-xs text-gray-400">CUSTOMER</p>
                <p className="mt-1 font-semibold">{order.customerName}</p>
                <p className="text-sm text-gray-500">
                  {order.orderType} · {order.phone}
                </p>
              </div>

              <h4 className="mb-3 font-bold">Food Items</h4>

              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={`${order.orderNumber}-${item.dish.id}-${index}`}
                    className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3"
                  >
                    <div>
                      <p className="font-semibold">{item.dish.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.dish.category}
                      </p>
                    </div>

                    <span className="rounded-lg bg-[#f7f6f0] px-3 py-2 text-sm font-bold">
                      × {item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <p className="font-bold">Order Total</p>
                <p className="text-lg font-bold text-[#d77a39]">
                  ₹{order.total}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {order.status === "Received" && (
                  <button
                    onClick={() =>
                      updateStatus(order.orderNumber, "Preparing")
                    }
                    className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Start Preparing
                  </button>
                )}

                {order.status === "Preparing" && (
                  <button
                    onClick={() =>
                      updateStatus(order.orderNumber, "Ready")
                    }
                    className="flex-1 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700"
                  >
                    Mark as Ready
                  </button>
                )}

                {order.status === "Ready" && (
                  <button
                    onClick={() =>
                      updateStatus(order.orderNumber, "Completed")
                    }
                    className="flex-1 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <footer className="mt-10 text-center text-xs text-gray-400">
        © DineDesk Kitchen Management System.
      </footer>
    </main>
  );
}
