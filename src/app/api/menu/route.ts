
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";

// GET: Public menu access
export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Menu fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

// POST: Add a new dish (Admin only)
export async function POST(request: Request) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin login required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (
      !body.name?.trim() ||
      !body.description?.trim() ||
      !body.category?.trim() ||
      !body.image?.trim() ||
      !Number.isFinite(Number(body.price)) ||
      Number(body.price) <= 0
    ) {
      return NextResponse.json(
        { error: "Please provide valid dish details." },
        { status: 400 }
      );
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name: body.name.trim(),
        description: body.description.trim(),
        category: body.category.trim(),
        price: Number(body.price),
        image: body.image.trim(),
        rating: body.rating || "4.5",
        available: body.available ?? true,
      },
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error("Menu creation error:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}

// PATCH: Update a dish (Admin only)
export async function PATCH(request: Request) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin login required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Dish ID is required." },
        { status: 400 }
      );
    }

    const updatedDish = await prisma.menuItem.update({
      where: { id: String(body.id) },
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        price: Number(body.price),
        image: body.image,
        available: body.available,
      },
    });

    return NextResponse.json(updatedDish);
  } catch (error) {
    console.error("Menu update error:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a dish (Admin only)
export async function DELETE(request: Request) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin login required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Dish ID is required." },
        { status: 400 }
      );
    }

    await prisma.menuItem.delete({
      where: { id: String(body.id) },
    });

    return NextResponse.json({
      message: "Dish deleted successfully",
    });
  } catch (error) {
    console.error("Menu deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
