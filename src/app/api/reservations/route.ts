
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";

// GET: Fetch all reservations
export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Reservation fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

// POST: Create a new reservation
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !body.name?.trim() ||
      !body.phone?.trim() ||
      !body.date ||
      !body.time ||
      !Number.isInteger(Number(body.guests)) ||
      Number(body.guests) < 1
    ) {
      return NextResponse.json(
        { error: "Please provide valid reservation details." },
        { status: 400 }
      );
    }

    const reservationDate = new Date(body.date);

    if (Number.isNaN(reservationDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid reservation date." },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        name: body.name.trim(),
        phone: body.phone.trim(),
        date: reservationDate,
        time: String(body.time),
        guests: Number(body.guests),
        seating: String(body.seating || "Any"),
        specialRequest: body.specialRequest?.trim() || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("Reservation creation error:", error);

    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}

// PATCH: Update reservation status
export async function PATCH(request: Request) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin login required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const statusMap: Record<string, string> = {
      Pending: "PENDING",
      Confirmed: "CONFIRMED",
      Rejected: "REJECTED",
      Cancelled: "CANCELLED",
    };

    const status = statusMap[body.status];

    if (!body.id || !status) {
      return NextResponse.json(
        { error: "Valid reservation ID and status are required." },
        { status: 400 }
      );
    }

    const updatedReservation = await prisma.reservation.update({
      where: {
        id: String(body.id),
      },
      data: {
        status: status as
          | "PENDING"
          | "CONFIRMED"
          | "REJECTED"
          | "CANCELLED",
      },
    });

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error("Reservation update error:", error);

    return NextResponse.json(
      { error: "Failed to update reservation" },
      { status: 500 }
    );
  }
}
