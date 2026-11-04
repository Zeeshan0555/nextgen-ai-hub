import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    const supabaseUrl = "https://buspmwcnkqlyqzgcexdr.supabase.co";
    const supabaseKey = "sb_publishable_pNsJYYPvHe8SywW76UupvA_pjaVGsdy"; // Aapki key

    // Initialize client properly
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // 1. Check if subscriber already exists
    const { data: existing, error: selectError } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (selectError) {
      return NextResponse.json({ success: false, error: selectError.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ success: true, message: "Already subscribed!" });
    }

    // 2. Insert new subscriber into table
    const { error: insertError } = await supabase
      .from("subscribers")
      .insert([{ email }]);

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
  }
}
