import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import crystalBall from "../assets/crystalball.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Signed in successfully.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <header className="sticky top-0 z-20 border-b border-[#1DCD9F]/30 bg-[#222222]/95 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
          <div className="flex items-center">
            <Link to="/">
              <img
                src={crystalBall}
                alt="Crystal Ball"
                className="h-9 w-9 object-contain sm:h-10 sm:w-10 md:h-11 md:w-11"
              />
            </Link>
          </div>

          <div className="flex justify-center">
            <Link
              to="/"
              className="rounded-full px-3 py-1 shadow-[0_0_24px_rgba(29,205,159,0.14)]"
            >
              <img
                src={logo}
                alt="Papa Predictions"
                className="h-8 w-auto object-contain sm:h-10 md:h-12"
              />
            </Link>
          </div>

          <div className="w-[84px] sm:w-[92px]" />
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-81px)] items-center justify-center px-4 py-8 sm:min-h-[calc(100vh-89px)]">
        <div className="w-full max-w-md rounded-2xl border border-[#1DCD9F] bg-[#222222] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              Sign In
            </h1>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">
              Enter your account credentials to access Papa Predictions.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSignIn}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-xl border border-[#1DCD9F]/30 bg-black px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#1DCD9F]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Password
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-[#1DCD9F]/30 bg-black px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#1DCD9F]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#1DCD9F] px-5 py-3 font-semibold text-black transition hover:shadow-[0_0_18px_rgba(29,205,159,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {message && (
              <div className="rounded-xl border border-[#1DCD9F]/20 bg-black/40 px-4 py-3 text-sm text-slate-200">
                {message}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}

export default Login;
