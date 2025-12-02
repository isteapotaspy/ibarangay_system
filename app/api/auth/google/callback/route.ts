import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect("/login"); 

  const tokenResponse = await axios.post(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT!,
      grant_type: "authorization_code",
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  const { id_token, access_token } = tokenResponse.data;


  const userResponse = await axios.get(
    `https://www.googleapis.com/oauth2/v3/userinfo`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  );

  const user = userResponse.data;

  // TODO: create session / cookie
  console.log("Logged in user:", user)

  return NextResponse.redirect("/");