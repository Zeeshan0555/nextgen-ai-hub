import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Direct client initialization to avoid any missing module path issues
const supabaseUrl = "https://buspmwcnkqlyqzgcexdr.supabase.co";
const supabaseKey = "sb_publishable_pNsJYYPvHe8SywW76UupvA_pjaVGsdy";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: "Already subscribed!" });
    }

    const { error } = await supabase.from("subscribers").insert([{ email }]);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
