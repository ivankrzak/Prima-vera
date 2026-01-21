"use client";

import { authClient } from "@/server/auth/client";
import { useState } from "react";


export function AuthButtons() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { data } = authClient.useSession();
  const handleSignUp = async () => {
    await authClient.signUp.email({
      email: email,
      name: "Test User",
      password: password,
      username: "test",
    });
  };

  return (
    <div>
      {data ? (
        <div>
          <p>Welcome, {data.user.email}</p>
          <button
            onClick={() => {
              void authClient.signOut();
            }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <>
          <button>Sign In with Google</button>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={async () => {
              await handleSignUp();
            }}
          >
            Sign up
          </button>
          <button
            onClick={async () => {
              await authClient.signIn.social({
                provider: "google",
                callbackURL: "/",
              });
            }}
          >
            Sign In with Google
          </button>
        </>
      )}
    </div>
  );
}
