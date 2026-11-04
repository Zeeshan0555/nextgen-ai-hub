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
    const supabaseKey = "sb_publishable_pNsJYYPvHe8SywW76UupvA_pjaVGsdy";

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // Use Supabase Official Auth SignUp (Handles new publishable keys perfectly)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password || "NeuroWire2026!", // Fallback password if not provided
    });

    if (error) {
      // If user already registered, try to sign in them automatically!
      if (error.message.includes("already registered")) {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password || "NeuroWire2026!",
        });

        if (loginError) {
          return NextResponse.json({ success: false, error: "Incorrect password for existing account." }, { status: 400 });
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
