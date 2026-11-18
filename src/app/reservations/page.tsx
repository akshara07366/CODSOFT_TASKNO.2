"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Reservation = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  seating: string;
  specialRequest: string;
  status: "Pending" | "Confirmed" | "Rejected" | "Cancelled";
  createdAt: string;
};

const timeSlots = [
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [today, setToday] = useState("");
  const [guests, setGuests] = useState("2");
  const [seating, setSeating] = useState("Indoor");
  const [specialRequest, setSpecialRequest] = useState("");
  const [confirmation, setConfirmation] = useState<Reservation | null>(null);
  const [error, setError] = useState("");

 

useEffect(() => {
  setToday(new Date().toLocaleDateString("en-CA"));

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
    }
  }

  loadReservations();

  const interval = window.setInterval(loadReservations, 5000);

  return () => window.clearInterval(interval);
}, []);


  
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setError("");

  if (!/^[0-9]{10}$/.test(phone)) {
    setError("Please enter a valid 10-digit phone number.");
    return;
  }

  if (!date || date < new Date().toLocaleDateString("en-CA")) {
    setError("Please select today or a future date.");
    return;
  }

  if (!time) {
    setError("Please select a time slot.");
    return;
  }

  try {
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        phone,
        date,
        time,
        guests: Number(guests),
        seating,
        specialRequest: specialRequest.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create reservation");
    }

    const booking: Reservation = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      date: data.date.slice(0, 10),
      time: data.time,
      guests: data.guests,
      seating: data.seating,
      specialRequest: data.specialRequest || "",
      status: "Pending",
      createdAt: data.createdAt,
    };

    setReservations((previous) => [booking, ...previous]);
    setConfirmation(booking);

    setName("");
    setPhone("");
    setDate("");
    setTime("");
    setGuests("2");
    setSeating("Indoor");
    setSpecialRequest("");
  } catch (error) {
    console.error("Reservation submission error:", error);
    setError(
      error instanceof Error
        ? error.message
        : "Could not submit reservation. Please try again."
    );
  }
}


  return (
    <main className="min-h-screen bg-[#f8f7f2] text-[#203b2d]">
      <header className="border-b border-[#e7e4d9] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <a href="/" className="text-2xl font-extrabold tracking-tight text-[#244b36]">
            DineDesk<span className="text-[#d97736]">.</span>
          </a>
          <a
            href="/"
            className="rounded-full border border-[#d9e2d9] px-4 py-2 text-sm font-semibold text-[#315b40] transition hover:bg-[#edf3ed]"
          >
            Back to menu
          </a>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
        <div className="flex flex-col justify-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#d97736]">
            Your table is waiting
          </p>
          <h1 className="max-w-lg text-4xl font-black leading-tight sm:text-5xl">
            Make a reservation at DineDesk.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[#667568]">
            Plan a relaxed meal with family and friends. Choose your date,
            time, party size, and preferred seating. Your booking will be saved
            with a confirmation ID.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-2xl font-black text-[#d97736]">01</p>
              <p className="mt-1 text-sm font-semibold">Choose a time</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-2xl font-black text-[#d97736]">02</p>
              <p className="mt-1 text-sm font-semibold">Confirm your details</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-[#e8dfcf] bg-[#fffaf1] p-5 text-sm leading-6 text-[#76664f]">
            <strong className="text-[#4d422f]">Please note:</strong> Online
            reservations are currently demo bookings. Your request is marked
            Pending until restaurant staff confirm it.
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-[0_18px_60px_rgba(31,55,39,0.09)] sm:p-8">
          {confirmation ? (
            <div className="py-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f3e9] text-3xl text-[#2f7546]">
                ✓
              </div>
              <p className="mt-5 text-center text-sm font-bold uppercase tracking-widest text-[#d97736]">
                Reservation request sent
              </p>
              <h2 className="mt-2 text-center text-3xl font-black">
                Thank you, {confirmation.name}!
              </h2>
              <p className="mt-3 text-center text-[#68776b]">
                Your reservation request has been saved.
              </p>

              <div className="mt-7 rounded-2xl border border-[#e4eadf] bg-[#f8fbf6] p-5">
                <div className="flex items-center justify-between gap-3 border-b border-[#e4eadf] pb-4">
                  <span className="text-sm text-[#68776b]">Booking ID</span>
                  <strong className="text-lg">{confirmation.id}</strong>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#879187]">Date</p>
                    <p className="mt-1 font-bold">{confirmation.date}</p>
                  </div>
                  <div>
                    <p className="text-[#879187]">Time</p>
                    <p className="mt-1 font-bold">{confirmation.time}</p>
                  </div>
                  <div>
                    <p className="text-[#879187]">Guests</p>
                    <p className="mt-1 font-bold">{confirmation.guests}</p>
                  </div>
                  <div>
                    <p className="text-[#879187]">Seating</p>
                    <p className="mt-1 font-bold">{confirmation.seating}</p>
                  </div>
                </div>
                <p className="mt-5 rounded-xl bg-[#fff4e8] px-4 py-3 text-sm font-semibold text-[#9a5a25]">
                  Status: {confirmation.status}
                </p>
              </div>

              <button
                onClick={() => setConfirmation(null)}
                className="mt-6 w-full rounded-xl bg-[#244b36] px-5 py-3 font-bold text-white transition hover:bg-[#193a29]"
              >
                Make another reservation
              </button>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <p className="text-sm font-bold uppercase tracking-widest text-[#d97736]">
                  Book a table
                </p>
                <h2 className="mt-2 text-2xl font-black">Reservation details</h2>
                <p className="mt-2 text-sm text-[#7b887d]">
                  Fields marked * are required.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-semibold">
                    Full name *
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="mt-2 w-full rounded-xl border border-[#dce3dc] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#477b56] focus:ring-2 focus:ring-[#477b56]/15"
                    />
                  </label>
                  <label className="block text-sm font-semibold">
                    Phone number *
                    <input
                      required
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="10-digit mobile number"
                      className="mt-2 w-full rounded-xl border border-[#dce3dc] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#477b56] focus:ring-2 focus:ring-[#477b56]/15"
                    />
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-semibold">
                    Reservation date *
                    <input
                      required
                      type="date"
                      min={today || undefined}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-[#dce3dc] bg-white px-4 py-3 font-normal outline-none focus:border-[#477b56] focus:ring-2 focus:ring-[#477b56]/15"
                    />
                  </label>
                  <label className="block text-sm font-semibold">
                    Time slot *
                    <select
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-[#dce3dc] bg-white px-4 py-3 font-normal outline-none focus:border-[#477b56] focus:ring-2 focus:ring-[#477b56]/15"
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-semibold">
                    Number of guests *
                    <select
                      required
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-[#dce3dc] bg-white px-4 py-3 font-normal outline-none focus:border-[#477b56] focus:ring-2 focus:ring-[#477b56]/15"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                        <option key={count} value={count}>
                          {count} {count === 1 ? "guest" : "guests"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-semibold">
                    Seating preference *
                    <select
                      required
                      value={seating}
                      onChange={(e) => setSeating(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-[#dce3dc] bg-white px-4 py-3 font-normal outline-none focus:border-[#477b56] focus:ring-2 focus:ring-[#477b56]/15"
                    >
                      <option>Indoor</option>
                      <option>Outdoor</option>
                      <option>No preference</option>
                    </select>
                  </label>
                </div>

                <label className="block text-sm font-semibold">
                  Special request (optional)
                  <textarea
                    rows={3}
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    placeholder="Birthday setup, high chair, accessibility needs..."
                    className="mt-2 w-full resize-y rounded-xl border border-[#dce3dc] bg-white px-4 py-3 font-normal outline-none focus:border-[#477b56] focus:ring-2 focus:ring-[#477b56]/15"
                  />
                </label>

                {error && (
                  <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#244b36] px-5 py-4 font-bold text-white shadow-lg shadow-[#244b36]/15 transition hover:-translate-y-0.5 hover:bg-[#193a29]"
                >
                  Request a reservation
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      {reservations.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-14">
          <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black">Your saved reservations</h2>
            <p className="mt-1 text-sm text-[#7b887d]">
              Reservations saved in this browser.
            </p>
            <div className="mt-5 space-y-3">
              {reservations.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl border border-[#e8ece6] p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-bold">{booking.date} · {booking.time}</p>
                    <p className="mt-1 text-sm text-[#718073]">
                      {booking.guests} guests · {booking.seating} · {booking.id}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-[#fff2df] px-3 py-1 text-xs font-bold text-[#9a5a25]">
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-[#e7e4d9] bg-white px-5 py-6 text-center text-sm text-[#819084]">
       © DineDesk. Good food, good company.
      </footer>
    </main>
  );
}
