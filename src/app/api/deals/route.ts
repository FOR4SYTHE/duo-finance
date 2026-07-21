import { NextResponse } from "next/server";

export async function GET() {
  const deals = [
    {
      id: "deal_1",
      brand: "Foodpanda",
      title: "₱100 off on minimum spend ₱499",
      code: "PANDANEW",
      expires: "2026-07-31T23:59:59Z",
      category: "Food",
      hot: true,
    },
    {
      id: "deal_2",
      brand: "Grab",
      title: "20% off GrabCar (max ₱80)",
      code: "GRABRIDES",
      expires: "2026-07-25T23:59:59Z",
      category: "Transport",
      hot: false,
    },
    {
      id: "deal_3",
      brand: "Shopee",
      title: "Free Shipping Vouchers - Min. Spend ₱199",
      code: "FREESHIP199",
      expires: "2026-07-31T23:59:59Z",
      category: "Shopping",
      hot: true,
    },
    {
      id: "deal_4",
      brand: "Lazada",
      title: "₱150 off on LazMall items",
      code: "LAZMALL150",
      expires: "2026-07-28T23:59:59Z",
      category: "Shopping",
      hot: false,
    },
    {
      id: "deal_5",
      brand: "Klook",
      title: "15% off Boracay Activities",
      code: "BORA15",
      expires: "2026-08-15T23:59:59Z",
      category: "Travel",
      hot: true,
    },
    {
      id: "deal_6",
      brand: "Agoda",
      title: "10% off Metro Manila Staycations",
      code: "MNLSTAY10",
      expires: "2026-08-30T23:59:59Z",
      category: "Travel",
      hot: false,
    },
    {
      id: "deal_7",
      brand: "Cheapflights",
      title: "Up to ₱500 off Domestic Flights",
      code: "FLYPH500",
      expires: "2026-07-30T23:59:59Z",
      category: "Travel",
      hot: false,
    }
  ];

  // Simulate network delay to show off a realistic loading state
  await new Promise((resolve) => setTimeout(resolve, 800));

  return NextResponse.json({ deals });
}
