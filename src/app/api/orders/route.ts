
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";

// GET: Fetch all customer orders
export async function GET() {
  try {
        if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin login required." },
        { status: 401 }
      );
    }
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Order fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST: Create a new customer order
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !body.customerName?.trim() ||
      !body.phone?.trim() ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        { error: "Please provide valid customer and order details." },
        { status: 400 }
      );
    }

    const orderTypeMap: Record<string, string> = {
      Delivery: "DELIVERY",
      Pickup: "PICKUP",
      "Dine In": "DINE_IN",
    };

    const paymentMethodMap: Record<string, string> = {
      "Cash on Delivery": "CASH",
      Cash: "CASH",
      "Online Payment": "ONLINE",
      "Online Payment Demo": "ONLINE",
    };

    const orderType = orderTypeMap[body.orderType];
    const paymentMethod = paymentMethodMap[body.paymentMethod];

    if (!orderType || !paymentMethod) {
      return NextResponse.json(
        { error: "Invalid order type or payment method." },
        { status: 400 }
      );
    }

    if (
      orderType === "DELIVERY" &&
      !body.address?.trim()
    ) {
      return NextResponse.json(
        { error: "Delivery address is required." },
        { status: 400 }
      );
    }

    const requestedItems = body.items.map((item: {
      dish?: { id?: string };
      quantity?: number;
    }) => ({
      menuItemId: String(item.dish?.id ?? ""),
      quantity: Number(item.quantity),
    }));

    if (
      requestedItems.some(
        (item: { menuItemId: string; quantity: number }) =>
          !item.menuItemId ||
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0
      )
    ) {
      return NextResponse.json(
        { error: "Invalid dish or quantity." },
        { status: 400 }
      );
    }

    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: requestedItems.map(
            (item: { menuItemId: string }) => item.menuItemId
          ),
        },
        available: true,
      },
    });

    if (menuItems.length !== new Set(
      requestedItems.map(
        (item: { menuItemId: string }) => item.menuItemId
      )
    ).size) {
      return NextResponse.json(
        { error: "One or more dishes are unavailable." },
        { status: 400 }
      );
    }

    const total = requestedItems.reduce(
      (
        sum: number,
        item: { menuItemId: string; quantity: number }
      ) => {
        const dish = menuItems.find(
          (menuItem) => menuItem.id === item.menuItemId
        );

        return sum + (dish?.price ?? 0) * item.quantity;
      },
      0
    );

    const orderNumber =
      `DINE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: body.customerName.trim(),
        phone: body.phone.trim(),
        address: orderType === "DELIVERY"
          ? body.address.trim()
          : null,
        orderType: orderType as "DELIVERY" | "PICKUP" | "DINE_IN",
        paymentMethod: paymentMethod as "CASH" | "ONLINE",
        paymentStatus: "PENDING",
        total,
        status: "RECEIVED",
        items: {
          create: requestedItems.map(
            (item: { menuItemId: string; quantity: number }) => {
              const dish = menuItems.find(
                (menuItem) => menuItem.id === item.menuItemId
              )!;

              return {
                menuItemId: dish.id,
                quantity: item.quantity,
                price: dish.price,
              };
            }
          ),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}


 // PATCH: Update order status and payment status
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
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

    const statusMap: Record<string, 
      "RECEIVED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED"
    > = {
      Received: "RECEIVED",
      Preparing: "PREPARING",
      Ready: "READY",
      Completed: "COMPLETED",
      Cancelled: "CANCELLED",
    };

    const paymentStatusMap: Record<string,
      "PENDING" | "PAID" | "FAILED"
    > = {
      Pending: "PENDING",
      Paid: "PAID",
      Failed: "FAILED",
    };

    const data: {
      status?: "RECEIVED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
      paymentStatus?: "PENDING" | "PAID" | "FAILED";
    } = {};

    if (body.status !== undefined) {
      const status = statusMap[body.status];

      if (!status) {
        return NextResponse.json(
          { error: "Invalid order status." },
          { status: 400 }
        );
      }

      data.status = status;
    }

    if (body.paymentStatus !== undefined) {
      const paymentStatus = paymentStatusMap[body.paymentStatus];

      if (!paymentStatus) {
        return NextResponse.json(
          { error: "Invalid payment status." },
          { status: 400 }
        );
      }

      data.paymentStatus = paymentStatus;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid update details provided." },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: String(body.id),
      },
      data,
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Order update error:", error);

    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
