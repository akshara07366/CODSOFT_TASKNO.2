
"use client";

import { useEffect, useMemo, useState } from "react";

type ReservationStatus =
  | "Pending"
  | "Confirmed"
  | "Rejected"
  | "Cancelled";

type Reservation = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  seating: string;
  specialRequest?: string;
  status: ReservationStatus;
  createdAt?: string;
};

const statusStyles: Record<ReservationStatus, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Confirmed: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  Cancelled: "bg-gray-200 text-gray-700",
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState<"All" | ReservationStatus>("All");
  const [loaded, setLoaded] = useState(false);

  
// Load reservations from PostgreSQL
useEffect(() => {
  async function loadReservations() {
    try {
      const response = await fetch("/api/reservations");

      if (!response.ok) {
        throw new Error("Failed to load reservations");
      }

      const data = await response.json();

      const formattedReservations: Reservation[] = data.map(
        (booking: {
          id: string;
          name: string;
          phone: string;
          date: string;
          time: string;
          guests: number;
          seating: string;
          specialRequest: string | null;
          status: string;
          createdAt: string;
        }) => ({
          id: booking.id,
          name: booking.name,
          phone: booking.phone,
          date: booking.date.slice(0, 10),
          time: booking.time,
          guests: booking.guests,
          seating: booking.seating,
          specialRequest: booking.specialRequest || "",
          status:
            booking.status === "CONFIRMED"
              ? "Confirmed"
              : booking.status === "REJECTED"
                ? "Rejected"
                : booking.status === "CANCELLED"
                  ? "Cancelled"
                  : "Pending",
          createdAt: booking.createdAt,
        })
      );

      setReservations(formattedReservations);
    } catch (error) {
      console.error("Unable to load reservations:", error);
    } finally {
      setLoaded(true);
    }
  }

  loadReservations();

  const interval = window.setInterval(loadReservations, 5000);

  return () => window.clearInterval(interval);
}, []);


  
async function updateStatus(
  id: string,
  status: ReservationStatus
) {
  try {
    const response = await fetch("/api/reservations", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        status,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update reservation");
    }

    setReservations((previousReservations) =>
      previousReservations.map((reservation) =>
        reservation.id === id
          ? { ...reservation, status }
          : reservation
      )
    );
  } catch (error) {
    console.error("Reservation status update error:", error);
    alert("Could not update reservation. Please try again.");
  }
}


  // Filter reservations
  const visibleReservations = useMemo(() => {
    if (filter === "All") {
      return reservations;
    }

    return reservations.filter(
      (reservation) => reservation.status === filter
    );
  }, [filter, reservations]);

  // Dashboard statistics
  const counts = {
    total: reservations.length,
    pending: reservations.filter(
      (r) => r.status === "Pending"
    ).length,
    confirmed: reservations.filter(
      (r) => r.status === "Confirmed"
    ).length,
    rejected: reservations.filter(
      (r) => r.status === "Rejected"
    ).length,
    cancelled: reservations.filter(
      (r) => r.status === "Cancelled"
    ).length,
  };

  const filters: Array<"All" | ReservationStatus> = [
    "All",
    "Pending",
    "Confirmed",
    "Rejected",
    "Cancelled",
  ];

  return (
    <main className="min-h-screen bg-[#f7f6f0] px-4 py-8 text-[#26372b] sm:px-8">

      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#d77a39]">
              DineDesk Admin
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Table Reservations
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Review customer bookings and update their reservation status.
            </p>
          </div>

          <a
            href="/"
            className="w-fit rounded-xl border border-[#26372b] px-5 py-3 text-sm font-semibold hover:bg-[#26372b] hover:text-white"
          >
            Back to Website
          </a>

        </header>

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">

          {[
            {
              label: "Total bookings",
              value: counts.total,
              color: "bg-white",
            },
            {
              label: "Pending",
              value: counts.pending,
              color: "bg-amber-50",
            },
            {
              label: "Confirmed",
              value: counts.confirmed,
              color: "bg-green-50",
            },
            {
              label: "Rejected",
              value: counts.rejected,
              color: "bg-red-50",
            },
            {
              label: "Cancelled",
              value: counts.cancelled,
              color: "bg-gray-100",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`${item.color} rounded-2xl p-4 shadow-sm`}
            >
              <p className="text-xs font-medium text-gray-600">
                {item.label}
              </p>

              <p className="mt-2 text-3xl font-bold">
                {item.value}
              </p>
            </div>
          ))}

        </section>

        {/* Booking List */}
        <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Booking Requests
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select a status filter to find specific bookings.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">

              {filters.map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                    filter === item
                      ? "bg-[#26372b] text-white"
                      : "bg-[#f1f0e9] text-[#26372b] hover:bg-[#e6e4d9]"
                  }`}
                >
                  {item}
                </button>
              ))}

            </div>
          </div>

          {!loaded ? (
            <p className="py-12 text-center text-gray-500">
              Loading reservations...
            </p>
          ) : visibleReservations.length === 0 ? (

            <div className="rounded-xl bg-[#f7f6f0] px-4 py-12 text-center">

              <p className="text-lg font-semibold">
                No reservations found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Customer table bookings will appear here.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {visibleReservations.map((reservation) => (

                <article
                  key={reservation.id}
                  className="rounded-xl border border-[#e9e7de] p-4 sm:p-5"
                >

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="text-lg font-bold">
                          {reservation.name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            statusStyles[reservation.status] ??
                            statusStyles.Pending
                          }`}
                        >
                          {reservation.status}
                        </span>

                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        Booking ID: {reservation.id}
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        Phone: {reservation.phone}
                      </p>

                    </div>

                    <div className="rounded-lg bg-[#f7f6f0] px-4 py-3 text-sm">

                      <p className="font-semibold">
                        {reservation.date}
                      </p>

                      <p className="text-gray-600">
                        {reservation.time}
                      </p>

                    </div>

                  </div>

                  {/* Booking Details */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">

                    <div>
                      <p className="text-gray-500">Guests</p>
                      <p className="font-semibold">
                        {reservation.guests}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Seating</p>
                      <p className="font-semibold">
                        {reservation.seating || "No preference"}
                      </p>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-gray-500">
                        Special Request
                      </p>

                      <p className="font-semibold">
                        {reservation.specialRequest?.trim() || "None"}
                      </p>
                    </div>

                  </div>

                  {/* Admin Actions */}
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-[#eee] pt-4">

                    {reservation.status === "Pending" && (
                      <>
                        <button
                          onClick={() =>
                            updateStatus(reservation.id, "Confirmed")
                          }
                          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
                        >
                          Confirm Booking
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(reservation.id, "Rejected")
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Reject Booking
                        </button>
                      </>
                    )}

                    {reservation.status !== "Cancelled" && (
                      <button
                        onClick={() =>
                          updateStatus(reservation.id, "Cancelled")
                        }
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        Cancel Reservation
                      </button>
                    )}

                    {reservation.status !== "Pending" && (
                      <button
                        onClick={() =>
                          updateStatus(reservation.id, "Pending")
                        }
                        className="rounded-lg border border-[#d77a39] px-4 py-2 text-sm font-semibold text-[#a95620] hover:bg-orange-50"
                      >
                        Mark as Pending
                      </button>
                    )}

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

        <p className="mt-6 text-center text-xs leading-5 text-gray-500">
          Demo version: reservations are stored in this browser's local storage.
          This page is not yet connected to a shared database or protected by admin login.
        </p>

      </div>

    </main>
  );
}
