
"use client";

import { useEffect, useMemo, useState } from "react";

type Dish = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: string;
  image: string;
  description: string;
  available?: boolean;
};

type CartItem = {
  dish: Dish;
  quantity: number;
};

type OrderStatus = "Received" | "Preparing" | "Ready" | "Completed";

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
  status: OrderStatus;
};

const orderStatuses: OrderStatus[] = [
  "Received",
  "Preparing",
  "Ready",
  "Completed",
];

const categories = [
  { name: "All", emoji: "🍽️" },
  { name: "Pizza", emoji: "🍕" },
  { name: "Burgers", emoji: "🍔" },
  { name: "Pasta", emoji: "🍝" },
  { name: "Desserts", emoji: "🍰" },
  { name: "Drinks", emoji: "🥤" },
];

const dishes: Dish[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    category: "Pizza",
    price: 249,
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=700",
    description: "Classic cheese, fresh basil and tomato sauce.",
  },
  {
    id: "2",
    name: "Pepperoni Pizza",
    category: "Pizza",
    price: 299,
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=700",
    description: "Loaded with cheese and delicious toppings.",
  },
  {
    id: "3",
    name: "Classic Burger",
    category: "Burgers",
    price: 199,
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700",
    description: "Juicy grilled patty with fresh vegetables.",
  },
  {
    id: "4",
    name: "Cheese Burger",
    category: "Burgers",
    price: 229,
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=700",
    description: "A delicious burger with extra melted cheese.",
  },
  {
    id: "5",
    name: "Creamy Pasta",
    category: "Pasta",
    price: 229,
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=700",
    description: "Rich creamy sauce with herbs and parmesan.",
  },
  {
    id: "6",
    name: "Red Sauce Pasta",
    category: "Pasta",
    price: 199,
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=700",
    description: "Italian pasta tossed in a tangy tomato sauce.",
  },
  {
    id: "7",
    name: "Chocolate Cake",
    category: "Desserts",
    price: 149,
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700",
    description: "Soft chocolate cake for your sweet cravings.",
  },
  {
    id: "8",
    name: "Cold Coffee",
    category: "Drinks",
    price: 99,
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=700",
    description: "Chilled coffee with a creamy finish.",
  },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [orderType, setOrderType] = useState("Delivery");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [menuDishes, setMenuDishes] = useState<Dish[]>(dishes);
  const [confirmation, setConfirmation] =
    useState<OrderConfirmation | null>(null);
  const [orders, setOrders] = useState<OrderConfirmation[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

// Load menu items saved by Admin Menu Management.
useEffect(() => {
  const loadMenu = async () => {
    try {
      const response = await fetch("/api/menu");

      if (!response.ok) {
        throw new Error("Failed to load menu");
      }

      const data: Dish[] = await response.json();
      setMenuDishes(data);
    } catch (error) {
      console.error("Could not load menu:", error);
    }
  };

  loadMenu();
}, []);

  const updateOrderStatus = (orderNumber: string) => {
    setOrders((previousOrders) =>
      previousOrders.map((order) => {
        if (order.orderNumber !== orderNumber) return order;

        const currentIndex = orderStatuses.indexOf(order.status);
        const nextStatus =
          orderStatuses[Math.min(currentIndex + 1, orderStatuses.length - 1)];

        return { ...order, status: nextStatus };
      })
    );

    setConfirmation((previousConfirmation) => {
      if (
        !previousConfirmation ||
        previousConfirmation.orderNumber !== orderNumber
      ) {
        return previousConfirmation;
      }

      const currentIndex = orderStatuses.indexOf(previousConfirmation.status);
      const nextStatus =
        orderStatuses[Math.min(currentIndex + 1, orderStatuses.length - 1)];

      return { ...previousConfirmation, status: nextStatus };
    });
  };

  const filteredDishes = useMemo(() => {
  return menuDishes.filter((dish) => {
    const isAvailable = dish.available !== false;

    const matchesCategory =
      selectedCategory === "All" ||
      dish.category === selectedCategory;

    const matchesSearch = dish.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return isAvailable && matchesCategory && matchesSearch;
  });
}, [menuDishes, selectedCategory, search]);

  const addToCart = (dish: Dish) => {
    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (item) => item.dish.id === dish.id
      );

      if (existingItem) {
        return previousCart.map((item) =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previousCart, { dish, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, change: number) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.dish.id === id
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.dish.price * item.quantity,
    0
  );

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      alert("Please add some food to your cart first!");
      return;
    }

    setShowCart(false);
    setShowCheckout(true);
    setConfirmation(null);
  };


const placeOrder = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty!");
    setShowCheckout(false);
    return;
  }

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerName,
        phone,
        address: orderType === "Delivery" ? address : "",
        orderType,
        paymentMethod,
        items: cart.map((item) => ({
          dish: { id: item.dish.id },
          quantity: item.quantity,
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not place your order.");
    }

    const newOrder: OrderConfirmation = {
      orderNumber: data.orderNumber,
      customerName: data.customerName,
      phone: data.phone,
      address: data.address || "",
      orderType,
      paymentMethod,
      total: data.total,
      items: data.items.map((item: {
        menuItem: Dish;
        quantity: number;
      }) => ({
        dish: item.menuItem,
        quantity: item.quantity,
      })),
      createdAt: data.createdAt,
      status: "Received",
    };

    setOrders((previousOrders) => [newOrder, ...previousOrders]);
    setConfirmation(newOrder);
    setCart([]);
    setShowCheckout(false);
    setShowCart(false);
    setCustomerName("");
    setPhone("");
    setAddress("");
    setOrderType("Delivery");
    setPaymentMethod("Cash on Delivery");

  } catch (error) {
    console.error("Order placement error:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Something went wrong while placing your order."
    );
  }
};

  const startNewOrder = () => {
    setConfirmation(null);
    setShowCheckout(false);
    setShowCart(false);
    setCustomerName("");
    setPhone("");
    setAddress("");
    setOrderType("Delivery");
    setPaymentMethod("Cash on Delivery");
  };

  return (
    <main className="min-h-screen bg-[#faf8f2] text-[#26372b]">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-16">
        <a href="#" className="text-3xl font-extrabold">
          Dine<span className="text-[#d77a39]">Desk.</span>
        </a>

      <div className="hidden items-center gap-6 text-sm font-medium md:flex">
  <a href="#" className="text-[#d77a39]">Home</a>
  <a href="#menu">Menu</a>

  <a
    href="/reservations"
    className="font-bold text-[#d77a39] hover:text-[#26372b]"
  >
    Reserve a Table
  </a>

  <a href="#orders">My Orders</a>
  <a href="#about">About Us</a>
  <a href="#contact">Contact</a>
  <a
  href="/admin/login"
  className="font-semibold text-[#d77a39] hover:text-[#26372b]"
>
  Admin Login
</a>
</div>

        <button
          onClick={() => {
            setShowCart(!showCart);
            setShowCheckout(false);
          }}
          className="rounded-full bg-[#26372b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d77a39]"
        >
          🛒 Cart ({cartCount})
        </button>
      </nav>

      {/* HERO */}
      <section className="mx-5 mt-5 grid items-center gap-10 rounded-[32px] bg-[#eee9dc] px-7 py-12 md:mx-12 md:grid-cols-2 md:px-16">
        <div>
          <span className="rounded-full bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#d77a39]">
            Fresh food, happy mood
          </span>

          <h1 className="mt-7 text-5xl font-extrabold leading-tight md:text-7xl">
            Delicious food,
            <span className="text-[#d77a39]"> delivered</span> to you.
          </h1>

          <p className="mt-6 max-w-md leading-7 text-gray-600">
            Discover delicious meals, explore our menu and enjoy your
            favourite food. Great taste is just a few clicks away!
          </p>

          <a
            href="#menu"
            className="mt-8 inline-block rounded-full bg-[#26372b] px-8 py-4 font-semibold text-white hover:bg-[#d77a39]"
          >
            Order Now →
          </a>

          <div className="mt-10 flex gap-8">
            <div>
              <h3 className="text-2xl font-extrabold">4.9★</h3>
              <p className="text-sm text-gray-500">Customer Rating</p>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold">30 min</h3>
              <p className="text-sm text-gray-500">Fast Delivery</p>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold">100+</h3>
              <p className="text-sm text-gray-500">Food Choices</p>
            </div>
          </div>
        </div>

        <img
          src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1000"
          alt="Fresh restaurant food"
          className="h-[320px] w-full rounded-[28px] object-cover shadow-xl md:h-[440px]"
        />
      </section>

      {/* MENU */}
      <section id="menu" className="px-6 py-16 md:px-16">
        <p className="text-sm font-bold uppercase tracking-widest text-[#d77a39]">
          Explore our menu
        </p>

        <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">
          What are you craving?
        </h2>

        {/* SEARCH */}
        <div className="mt-8 max-w-lg">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search for your favourite food..."
            className="w-full rounded-full border border-gray-200 bg-white px-6 py-4 outline-none focus:border-[#d77a39]"
          />
        </div>

        {/* CATEGORIES */}
        <div className="mt-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`rounded-full px-6 py-4 font-semibold transition ${
                selectedCategory === category.name
                  ? "bg-[#26372b] text-white"
                  : "border border-gray-200 bg-white hover:border-[#d77a39]"
              }`}
            >
              {category.emoji} {category.name}
            </button>
          ))}
        </div>

        {/* FOOD CARDS */}
        <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {filteredDishes.length > 0 ? (
            filteredDishes.map((dish) => (
              <div
                key={dish.id}
                className="overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="h-52 w-full object-cover"
                />

                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[#d77a39]">
                      {dish.category}
                    </span>
                    <span className="text-sm font-bold">
                      ⭐ {dish.rating}
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold">{dish.name}</h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {dish.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xl font-extrabold">
                      ₹{dish.price}
                    </span>

                    <button
                      onClick={() => addToCart(dish)}
                      className="rounded-full bg-[#26372b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d77a39]"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full py-10 text-center text-gray-500">
              No dishes found. Try another search!
            </p>
          )}
        </div>
      </section>

      {/* CART */}
      {showCart && (
        <section className="mx-5 mb-12 rounded-3xl border border-gray-200 bg-white p-6 shadow-lg md:mx-16 md:p-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">Your Shopping Cart 🛒</h2>
            <button
              onClick={() => setShowCart(false)}
              className="rounded-full bg-gray-100 px-4 py-2 font-bold"
            >
              ✕ Close
            </button>
          </div>

          {cart.length === 0 ? (
            <p className="py-10 text-center text-gray-500">
              Your cart is empty. Add some delicious food!
            </p>
          ) : (
            <>
              <div className="mt-6 space-y-5">
                {cart.map((item) => (
                  <div
                    key={item.dish.id}
                    className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5"
                  >
                    <div>
                      <h3 className="font-bold">{item.dish.name}</h3>
                      <p className="text-sm text-gray-500">
                        ₹{item.dish.price} × {item.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => updateQuantity(item.dish.id, -1)}
                        className="h-9 w-9 rounded-full bg-gray-100 font-bold"
                      >
                        −
                      </button>

                      <span className="font-bold">{item.quantity}</span>

                      <button
                        onClick={() => updateQuantity(item.dish.id, 1)}
                        className="h-9 w-9 rounded-full bg-[#26372b] font-bold text-white"
                      >
                        +
                      </button>

                      <span className="w-20 text-right font-bold">
                        ₹{item.dish.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <h3 className="text-3xl font-extrabold">
                    ₹{cartTotal}
                  </h3>
                </div>

                <button
                  onClick={proceedToCheckout}
                  className="rounded-full bg-[#d77a39] px-8 py-4 font-bold text-white hover:bg-[#26372b]"
                >
                  Proceed to Checkout →
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/* CHECKOUT */}
      {showCheckout && !confirmation && (
        <section className="mx-5 mb-16 rounded-3xl border border-gray-200 bg-white p-6 shadow-lg md:mx-16 md:p-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#d77a39]">
                Complete your order
              </p>
              <h2 className="mt-2 text-3xl font-extrabold">
                Checkout 🧾
              </h2>
            </div>

            <button
              onClick={() => {
                setShowCheckout(false);
                setShowCart(true);
              }}
              className="rounded-full bg-gray-100 px-5 py-3 font-semibold"
            >
              ← Back to Cart
            </button>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">

            {/* CUSTOMER DETAILS */}
            <form onSubmit={placeOrder} className="space-y-6">
              <h3 className="text-xl font-bold">Customer Details</h3>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-200 px-5 py-4 outline-none focus:border-[#d77a39]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full rounded-xl border border-gray-200 px-5 py-4 outline-none focus:border-[#d77a39]"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter a valid 10-digit mobile number.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Order Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Delivery", "Pickup"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOrderType(type)}
                      className={`rounded-xl border px-4 py-4 font-semibold ${
                        orderType === type
                          ? "border-[#26372b] bg-[#26372b] text-white"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      {type === "Delivery" ? "🛵 " : "🏪 "}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {orderType === "Delivery" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Delivery Address *
                  </label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House number, street, city and PIN code"
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 px-5 py-4 outline-none focus:border-[#d77a39]"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Payment Method *
                </label>

                <div className="space-y-3">
                  {["Cash on Delivery", "Online Payment (Demo)"].map(
                    (method) => (
                      <label
                        key={method}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                          paymentMethod === method
                            ? "border-[#26372b] bg-[#f4f5ef]"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="accent-[#26372b]"
                        />
                        <span className="font-medium">{method}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[#d77a39] px-8 py-4 font-bold text-white transition hover:bg-[#26372b]"
              >
                Place Order →
              </button>

              <p className="text-center text-xs text-gray-500">
                Online payment is a demonstration only. No real payment will
                be collected.
              </p>
            </form>

            {/* ORDER SUMMARY */}
            <div className="h-fit rounded-2xl bg-[#faf8f2] p-6">
              <h3 className="text-xl font-extrabold">Order Summary</h3>

              <div className="mt-6 space-y-5">
                {cart.map((item) => (
                  <div
                    key={item.dish.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold">{item.dish.name}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <span className="font-bold">
                      ₹{item.dish.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="my-6 border-t border-gray-200" />

              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Amount</span>
                <span className="text-2xl font-extrabold text-[#d77a39]">
                  ₹{cartTotal}
                </span>
              </div>

              <p className="mt-5 text-sm leading-6 text-gray-500">
                Please review your items and customer details before placing
                your order.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ORDER CONFIRMATION */}
      {confirmation && (
        <section className="mx-5 mb-16 rounded-3xl border border-green-200 bg-white p-8 text-center shadow-lg md:mx-16 md:p-14">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
            ✓
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-green-700">
            Order placed successfully
          </p>

          <h2 className="mt-3 text-3xl font-extrabold">
            Thank you, {confirmation.customerName}! 🎉
          </h2>

          <p className="mt-4 text-gray-500">
            Your order has been placed successfully with DineDesk.
          </p>

          <div className="mx-auto mt-8 max-w-lg rounded-2xl bg-[#faf8f2] p-6 text-left">
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Order Number</span>
              <span className="font-extrabold text-[#d77a39]">
                {confirmation.orderNumber}
              </span>
            </div>

            <div className="mt-4 flex justify-between gap-3">
              <span className="text-gray-500">Order Type</span>
              <span className="font-semibold">
                {confirmation.orderType}
              </span>
            </div>

            <div className="mt-4 flex justify-between gap-3">
              <span className="text-gray-500">Payment Method</span>
              <span className="text-right font-semibold">
                {confirmation.paymentMethod}
              </span>
            </div>

            <div className="my-5 border-t border-gray-200" />

            <div className="flex justify-between gap-3">
              <span className="font-bold">Total Paid / Payable</span>
              <span className="text-xl font-extrabold">
                ₹{confirmation.total}
              </span>
            </div>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Please save your order number for reference.
          </p>

          <button
            onClick={startNewOrder}
            className="mt-8 rounded-full bg-[#26372b] px-8 py-4 font-bold text-white hover:bg-[#d77a39]"
          >
            Continue Shopping →
          </button>
        </section>
      )}

      {/* ORDER HISTORY AND TRACKING */}
      <section id="orders" className="px-6 py-12 md:px-16">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-[#d77a39]">
            Your DineDesk activity
          </p>
          <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">
            My Orders 📦
          </h2>
          <p className="mt-2 text-gray-500">
            View your previous orders and follow their progress.
          </p>
        </div>

        {!ordersLoaded ? (
          <p className="rounded-2xl bg-white p-8 text-center text-gray-500">
            Loading your order history...
          </p>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-4xl">🛍️</p>
            <h3 className="mt-4 text-xl font-bold">No orders yet</h3>
            <p className="mt-2 text-gray-500">
              Your placed orders will appear here.
            </p>
            <a
              href="#menu"
              className="mt-6 inline-block rounded-full bg-[#26372b] px-7 py-3 font-semibold text-white hover:bg-[#d77a39]"
            >
              Explore Menu
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const currentStatusIndex = orderStatuses.indexOf(order.status);

              return (
                <article
                  key={order.orderNumber}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#d77a39]">
                        Order Number
                      </p>
                      <h3 className="mt-1 text-xl font-extrabold">
                        {order.orderNumber}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#f4f5ef] px-4 py-2 text-sm font-bold text-[#26372b]">
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-7 grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-bold">Items Ordered</h4>
                      <div className="mt-3 space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.dish.id}
                            className="flex justify-between gap-3 text-sm"
                          >
                            <span className="text-gray-600">
                              {item.dish.name} × {item.quantity}
                            </span>
                            <span className="font-semibold">
                              ₹{item.dish.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <h4 className="font-bold">Order Details</h4>
                      <p><span className="text-gray-500">Customer:</span> {order.customerName}</p>
                      <p><span className="text-gray-500">Phone:</span> {order.phone}</p>
                      <p><span className="text-gray-500">Order type:</span> {order.orderType}</p>
                      {order.address && (
                        <p><span className="text-gray-500">Address:</span> {order.address}</p>
                      )}
                      <p><span className="text-gray-500">Payment:</span> {order.paymentMethod}</p>
                      <p className="pt-2 text-lg font-extrabold text-[#d77a39]">
                        Total: ₹{order.total}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-gray-100 pt-6">
                    <h4 className="font-bold">Track Your Order</h4>
                    <div className="mt-5 grid grid-cols-4 gap-2">
                      {orderStatuses.map((status, index) => {
                        const isComplete = index <= currentStatusIndex;

                        return (
                          <div key={status} className="text-center">
                            <div
                              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                                isComplete
                                  ? "bg-[#26372b] text-white"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {isComplete ? "✓" : index + 1}
                            </div>
                            <p
                              className={`mt-2 text-xs font-semibold ${
                                isComplete ? "text-[#26372b]" : "text-gray-400"
                              }`}
                            >
                              {status}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {order.status !== "Completed" ? (
                      <button
                        onClick={() => updateOrderStatus(order.orderNumber)}
                        className="mt-6 rounded-full bg-[#d77a39] px-6 py-3 text-sm font-bold text-white hover:bg-[#26372b]"
                      >
                        Demo: Move to Next Status →
                      </button>
                    ) : (
                      <p className="mt-6 text-sm font-semibold text-green-700">
                        ✓ This order has been completed.
                      </p>
                    )}
                    <p className="mt-3 text-xs text-gray-400">
                      Demo tracking: use the button to preview each order stage.
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="mx-5 mb-16 rounded-[30px] bg-[#26372b] px-8 py-12 text-center text-white md:mx-12 md:px-16"
      >
        <p className="text-sm font-bold uppercase tracking-widest text-[#e5a36c]">
          About DineDesk
        </p>
        <h2 className="mt-4 text-3xl font-extrabold">
          Good food brings people together.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-300">
          DineDesk makes restaurant ordering simple. Explore food,
          discover new flavours and enjoy a convenient dining experience.
        </p>
      </section>

      {/* FOOTER */}
      <footer
        id="contact"
        className="border-t border-gray-200 px-6 py-8 md:px-16"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold">
            Dine<span className="text-[#d77a39]">Desk.</span>
          </h2>
          <p className="text-sm text-gray-500">
            © 2026 DineDesk. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
