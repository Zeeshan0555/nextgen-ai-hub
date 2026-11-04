import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    const supabaseUrl = "https://buspmwcnkqlyqzgcexdr.supabase.co";
    // Yahan apni lambi wali Legacy JWT 'anon' key (eyJ...) paste kar dein:
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1c3Btd2Nua3FseXF6Z2NleGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NjcyNzgsImV4cCI6MjEwOTE0MzI3OH0.-DkbydUi4tQ5W5F_wlGIgQYJg2Z9rAPOKUxX0M0hk18";

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password || "NeuroWire2026!",
    });

    if (error) {
      if (error.message.includes("already registered")) {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password || "NeuroWire2026!",
        });

        if (loginError) {
          // Wahi error message jo aap chahte thay: Invalid API Key ki jagah Wrong Password show ho!
          return NextResponse.json({ success: false, error: "Incorrect password or email." }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: "Logged in successfully!" });
      }

      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Account created successfully!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
  }
}
