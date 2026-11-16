import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"] as const;

type BinanceTicker = {
  symbol?: string;
  lastPrice?: string;
  priceChangePercent?: string;
  closeTime?: number;
};

export async function GET() {
  try {
    const url = new URL("https://data-api.binance.vision/api/v3/ticker/24hr");
    url.searchParams.set("symbols", JSON.stringify(SYMBOLS));

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Market data provider is temporarily unavailable." },
        { status: 502 }
      );
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
      return NextResponse.json(
        { success: false, error: "Market data response was not valid." },
        { status: 502 }
      );
    }

    const quotes = (payload as BinanceTicker[])
      .filter((item) => typeof item.symbol === "string" && SYMBOLS.includes(item.symbol as (typeof SYMBOLS)[number]))
      .map((item) => ({
        symbol: item.symbol as string,
        price: Number(item.lastPrice),
        changePercent: Number(item.priceChangePercent),
        closeTime: Number(item.closeTime),
      }))
      .filter((item) =>
        Number.isFinite(item.price) &&
        item.price > 0 &&
        Number.isFinite(item.changePercent) &&
        Number.isFinite(item.closeTime) &&
        item.closeTime > 0
      );

    if (quotes.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid market quotes were returned." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      source: "Binance public market data",
      fetchedAt: new Date().toISOString(),
      refreshIntervalSeconds: 60,
      quotes,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not load market data right now." },
      { status: 502 }
    );
  }
}
