import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    const supabaseUrl = "https://buspmwcnkqlyqzgcexdr.supabase.co";
    const supabaseKey = "sb_publishable_pNsJYYPvHe8SywW76UupvA_pjaVGsdy";

    // Create server-side Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // 1. Check if email already exists in subscribers table
    const { data: existing, error: selectError } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", email.trim())
      .maybeSingle();

    if (selectError) {
      console.error("Supabase select error:", selectError.message);
      return NextResponse.json({ success: false, error: selectError.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ success: true, message: "Already subscribed!" });
    }

    // 2. Insert the new email
    const { error: insertError } = await supabase
      .from("subscribers")
      .insert([{ email: email.trim() }]);

    if (insertError) {
      console.error("Supabase insert error:", insertError.message);
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (err: any) {
    console.error("API catch error:", err);
    return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
  }
}
