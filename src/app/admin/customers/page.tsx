
"use client";

import { useEffect, useMemo, useState } from "react";

type Dish = {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: string;
  image: string;
  description?: string;
  available?: boolean;
};

type CartItem = {
  dish: Dish;
  quantity: number;
};

type OrderConfirmation = {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  orderType: string;
  paymentMethod: string;
  total: number;
  items: CartItem[];
  createdAt: string;
  status: string;
};

type Customer = {
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  recentOrder: string;
  lastOrderDate: string;
  orders: OrderConfirmation[];
};

export default function CustomersPage() {
  const [orders, setOrders] = useState<OrderConfirmation[]>([]);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);

  
useEffect(() => {
  async function loadOrders() {
    try {
      const response = await fetch("/api/orders");

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data as OrderConfirmation[]);
    } catch (error) {
      console.error("Could not load customer orders:", error);
    } finally {
      setLoaded(true);
    }
  }

  loadOrders();

  const interval = window.setInterval(loadOrders, 5000);

  return () => window.clearInterval(interval);
}, []);

  const customers = useMemo(() => {
    const customerMap = new Map<string, Customer>();

    orders.forEach((order) => {
      const key = order.phone || order.customerName.toLowerCase();

      const existing = customerMap.get(key);

      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += order.total;
        existing.orders.push(order);

        if (
          new Date(order.createdAt).getTime() >
          new Date(existing.lastOrderDate).getTime()
        ) {
          existing.lastOrderDate = order.createdAt;
          existing.recentOrder = order.orderNumber;
          existing.name = order.customerName;
        }
      } else {
        customerMap.set(key, {
          name: order.customerName,
          phone: order.phone,
          totalOrders: 1,
          totalSpent: order.total,
          recentOrder: order.orderNumber,
          lastOrderDate: order.createdAt,
          orders: [order],
        });
      }
    });

    return Array.from(customerMap.values()).sort(
      (a, b) =>
        new Date(b.lastOrderDate).getTime() -
        new Date(a.lastOrderDate).getTime()
    );
  }, [orders]);

  const filteredCustomers = customers.filter((customer) => {
    const searchText = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(searchText) ||
      customer.phone.toLowerCase().includes(searchText)
    );
  });

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0
  );

  return (
    <div className="min-h-screen bg-[#f7f6f0] text-[#26372b]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7e4d9] bg-white px-6 py-5">
        <div>
          <p className="text-sm text-gray-500">Admin / Customers</p>
          <h1 className="mt-1 text-2xl font-bold">Customer Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your restaurant customers.
          </p>
        </div>

        <a
          href="/admin"
          className="rounded-lg bg-[#26372b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3b5140]"
        >
          Back to Dashboard
        </a>
      </header>

      <main className="p-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-[#e7e4d9] bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Customers</p>
            <h2 className="mt-2 text-3xl font-bold">
              {customers.length}
            </h2>
          </div>

          <div className="rounded-xl border border-[#e7e4d9] bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Orders</p>
            <h2 className="mt-2 text-3xl font-bold">{orders.length}</h2>
          </div>

          <div className="rounded-xl border border-[#e7e4d9] bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Order Value</p>
            <h2 className="mt-2 text-3xl font-bold">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </h2>
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-[#e7e4d9] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">All Customers</h2>
              <p className="mt-1 text-sm text-gray-500">
                Customer details collected from placed orders.
              </p>
            </div>

            <input
              type="text"
              placeholder="Search name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[#d77a39] sm:w-72"
            />
          </div>

          {!loaded ? (
            <p className="py-12 text-center text-gray-500">
              Loading customers...
            </p>
          ) : filteredCustomers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg font-semibold">
                {search ? "No customers found" : "No customers yet"}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "Try searching with another name or phone number."
                  : "Customers will appear here when they place orders."}
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b bg-[#f7f6f0] text-gray-600">
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Total Orders</th>
                    <th className="px-4 py-3">Total Spent</th>
                    <th className="px-4 py-3">Recent Order</th>
                    <th className="px-4 py-3">Last Order</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.phone || customer.name}
                      className="border-b border-gray-100 hover:bg-[#faf9f5]"
                    >
                      <td className="px-4 py-4 font-semibold">
                        {customer.name}
                      </td>
                      <td className="px-4 py-4">{customer.phone || "—"}</td>
                      <td className="px-4 py-4">
                        {customer.totalOrders}
                      </td>
                      <td className="px-4 py-4 font-semibold">
                        ₹{customer.totalSpent.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-4">
                        {customer.recentOrder}
                      </td>
                      <td className="px-4 py-4">
                        {new Date(customer.lastOrderDate).toLocaleDateString(
                          "en-IN"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
