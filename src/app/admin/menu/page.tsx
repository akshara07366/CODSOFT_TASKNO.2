
"use client";

import { useEffect, useState } from "react";

type Dish = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: string;
  image: string;
  description: string;
  available: boolean;
};

const defaultDishes: Dish[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    category: "Pizza",
    price: 249,
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=700",
    description: "Classic cheese, fresh basil and tomato sauce.",
    available: true,
  },
  {
    id: "2",
    name: "Pepperoni Pizza",
    category: "Pizza",
    price: 299,
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=700",
    description: "Loaded with cheese and delicious toppings.",
    available: true,
  },
  {
    id: "3",
    name: "Classic Burger",
    category: "Burgers",
    price: 199,
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700",
    description: "Juicy grilled patty with fresh vegetables.",
    available: true,
  },
  {
    id: "4",
    name: "Cheese Burger",
    category: "Burgers",
    price: 229,
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=700",
    description: "A delicious burger with extra melted cheese.",
    available: true,
  },
  {
    id: "5",
    name: "Creamy Pasta",
    category: "Pasta",
    price: 229,
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=700",
    description: "Rich creamy sauce with herbs and parmesan.",
    available: true,
  },
  {
    id: "6",
    name: "Red Sauce Pasta",
    category: "Pasta",
    price: 199,
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=700",
    description: "Italian pasta tossed in a tangy tomato sauce.",
    available: true,
  },
  {
    id: "7",
    name: "Chocolate Cake",
    category: "Desserts",
    price: 149,
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700",
    description: "Soft chocolate cake for your sweet cravings.",
    available: true,
  },
  {
    id: "8",
    name: "Cold Coffee",
    category: "Drinks",
    price: 99,
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=700",
    description: "Chilled coffee with a creamy finish.",
    available: true,
  },
];

export default function MenuManagementPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Pizza");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    async function loadMenu() {
      try {
        const response = await fetch("/api/menu");

        if (!response.ok) {
          throw new Error("Failed to load menu");
        }

        let data: Dish[] = await response.json();

        if (data.length === 0) {
          for (const dish of defaultDishes) {
            const addResponse = await fetch("/api/menu", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(dish),
            });

            if (!addResponse.ok) {
              throw new Error(`Could not add ${dish.name}`);
            }
          }

          const updatedResponse = await fetch("/api/menu");

          if (!updatedResponse.ok) {
            throw new Error("Could not reload menu");
          }

          data = await updatedResponse.json();
        }

        setDishes(data);
      } catch (error) {
        console.error("Could not load menu:", error);
        alert("Could not load menu from database.");
      } finally {
        setLoaded(true);
      }
    }

    loadMenu();
  }, []);

  function resetForm() {
    setName("");
    setCategory("Pizza");
    setPrice("");
    setDescription("");
    setImage("");
    setEditingId(null);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const numericPrice = Number(price);

    if (
      !name.trim() ||
      !description.trim() ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      alert("Please enter a valid name, description and price.");
      return;
    }

    try {
      if (editingId !== null) {
        const existingDish = dishes.find(
          (dish) => dish.id === editingId
        );

        if (!existingDish) return;

        const response = await fetch("/api/menu", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingId,
            name: name.trim(),
            category,
            price: numericPrice,
            description: description.trim(),
            image: image.trim() || existingDish.image,
            rating: existingDish.rating,
            available: existingDish.available,
          }),
        });

        if (!response.ok) {
          throw new Error("Update failed");
        }

        const updatedDish: Dish = await response.json();

        setDishes((previous) =>
          previous.map((dish) =>
            dish.id === editingId ? updatedDish : dish
          )
        );

        alert("Dish updated successfully!");
      } else {
        const response = await fetch("/api/menu", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            category,
            price: numericPrice,
            description: description.trim(),
            image:
              image.trim() ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700",
            rating: "New",
            available: true,
          }),
        });

        if (!response.ok) {
          throw new Error("Dish creation failed");
        }

        const newDish: Dish = await response.json();

        setDishes((previous) => [...previous, newDish]);

        alert("New dish added successfully!");
      }

      resetForm();
    } catch (error) {
      console.error("Menu save error:", error);
      alert("Could not save dish to database.");
    }
  }

  function editDish(dish: Dish) {
    setEditingId(dish.id);
    setName(dish.name);
    setCategory(dish.category);
    setPrice(String(dish.price));
    setDescription(dish.description);
    setImage(dish.image);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteDish(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this dish?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/menu", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setDishes((previous) =>
        previous.filter((dish) => dish.id !== id)
      );

      if (editingId === id) {
        resetForm();
      }

      alert("Dish deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Could not delete this dish.");
    }
  }

  async function toggleAvailability(id: string) {
    const dish = dishes.find((item) => item.id === id);

    if (!dish) return;

    try {
      const response = await fetch("/api/menu", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...dish,
          available: !dish.available,
        }),
      });

      if (!response.ok) {
        throw new Error("Availability update failed");
      }

      const updatedDish: Dish = await response.json();

      setDishes((previous) =>
        previous.map((item) =>
          item.id === id ? updatedDish : item
        )
      );
    } catch (error) {
      console.error("Availability error:", error);
      alert("Could not update dish availability.");
    }
  }

  const filteredDishes = dishes.filter(
    (dish) =>
      dish.name.toLowerCase().includes(search.toLowerCase()) ||
      dish.category.toLowerCase().includes(search.toLowerCase())
  );

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#f7f6f0] p-10">
        Loading menu...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6f0] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-[#d77a39]">
            DINEDESK ADMIN
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#26372b]">
            Menu Management
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Add, edit and manage your restaurant dishes.
          </p>
        </div>

        <div className="mb-9 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Dishes</p>
            <h2 className="mt-2 text-3xl font-bold">
              {dishes.length}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Available Dishes</p>
            <h2 className="mt-2 text-3xl font-bold">
              {dishes.filter((dish) => dish.available).length}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Unavailable Dishes</p>
            <h2 className="mt-2 text-3xl font-bold">
              {dishes.filter((dish) => !dish.available).length}
            </h2>
          </div>
        </div>

        <section className="mb-9 rounded-2xl border border-[#e8e5dc] bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">
            {editingId !== null ? "Edit Dish" : "Add New Dish"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Dish Name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter dish name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#d77a39]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
              >
                <option>Pizza</option>
                <option>Burgers</option>
                <option>Pasta</option>
                <option>Desserts</option>
                <option>Drinks</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Price (₹)
              </label>
              <input
                required
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#d77a39]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Food Image URL (optional)
              </label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Paste image URL"
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the dish"
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
              />
            </div>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-[#26372b] px-6 py-3 font-semibold text-white hover:bg-[#354a39]"
              >
                {editingId !== null ? "Update Dish" : "Add Dish"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-gray-200 px-6 py-3 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-[#26372b]">
              All Menu Items
            </h2>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 sm:w-72"
            />
          </div>

          {filteredDishes.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center text-gray-500">
              No dishes found.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="overflow-hidden rounded-2xl border border-[#e8e5dc] bg-white shadow-sm"
                >
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="h-44 w-full object-cover"
                  />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold">{dish.name}</h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {dish.category}
                        </p>
                      </div>

                      <span className="font-bold text-[#d77a39]">
                        ₹{dish.price}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-gray-500">
                      {dish.description}
                    </p>

                    <div className="mt-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          dish.available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {dish.available ? "Available" : "Unavailable"}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        onClick={() => editDish(dish)}
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => toggleAvailability(dish.id)}
                        className="flex-1 rounded-lg bg-[#f7f6f0] px-3 py-2 text-sm font-semibold hover:bg-gray-200"
                      >
                        {dish.available ? "Disable" : "Enable"}
                      </button>

                      <button
                        onClick={() => deleteDish(dish.id)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-10 text-center text-xs text-gray-400">
          © DineDesk. Restaurant Management System.
        </footer>
      </div>
    </main>
  );
}
