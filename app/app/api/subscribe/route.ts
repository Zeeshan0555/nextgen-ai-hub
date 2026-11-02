import { NextResponse } from "next/server";
import { supabase } from "@/app/supabase";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: "Already subscribed!" });
    }

    // Insert new subscriber
    const { error } = await supabase.from("subscribers").insert([{ email }]);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
