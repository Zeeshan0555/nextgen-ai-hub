import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    const supabaseUrl = "https://buspmwcnkqlyqzgcexdr.supabase.co";
    const supabaseKey = "sb_publishable_pNsJYYPvHe8SywW76UupvA_pjaVGsdy";

    // 1. Check if email already exists using Supabase REST API
    const checkRes = await fetch(`${supabaseUrl}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}&select=id`, {
      method: "GET",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
    });

    const existingData = await checkRes.json();

    if (existingData && existingData.length > 0) {
      return NextResponse.json({ success: true, message: "Already subscribed!" });
    }

    // 2. Insert new subscriber using Supabase REST API
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ email }),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      throw new Error(errText || "Failed to insert");
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
  }
}
