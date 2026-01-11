import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Check, Mail } from "lucide-react";
import { cn, springConfig } from "@/lib/utils";

type AuthState = "initial" | "loading" | "authenticated";

function App() {
  const [authState, setAuthState] = useState<AuthState>("initial");
  const [email, setEmail] = useState("");

  const handleGoogleAuth = async () => {
    setAuthState("loading");
    await new Promise((r) => setTimeout(r, 1500));
    setAuthState("authenticated");
  };

  const handleMagicLink = async () => {
    if (!email) return;
    setAuthState("loading");
    await new Promise((r) => setTimeout(r, 1500));
    setAuthState("authenticated");
  };

  return (
    <div className="w-[360px] min-h-[480px] bg-white overflow-hidden">
      <motion.div
        className="gradient-primary p-6 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="flex items-center justify-center mb-4"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={springConfig.bouncy}
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        <motion.h1
          className="text-2xl font-bold text-white text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Instagram AI Optimizer
        </motion.h1>

        <motion.p
          className="text-white/80 text-center mt-2 text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Transform your feed with AI-enhanced thumbnails
        </motion.p>
      </motion.div>

      <div className="p-6 -mt-4">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {authState === "initial" && (
              <motion.div
                key="auth-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <motion.button
                  className={cn(
                    "w-full p-4 rounded-xl",
                    "bg-white border-2 border-gray-200",
                    "flex items-center justify-center gap-3",
                    "font-medium text-gray-700",
                    "hover:border-gray-300 hover:shadow-md",
                    "transition-all duration-200"
                  )}
                  onClick={handleGoogleAuth}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </motion.button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(
                        "w-full pl-12 pr-4 py-3 rounded-xl",
                        "border-2 border-gray-200",
                        "focus:border-primary-400 focus:ring-2 focus:ring-primary-100",
                        "outline-none transition-all duration-200",
                        "text-gray-900 placeholder:text-gray-400"
                      )}
                    />
                  </div>

                  <motion.button
                    className={cn(
                      "w-full p-4 rounded-xl",
                      "gradient-primary text-white font-semibold",
                      "shadow-glow-md hover:shadow-glow-lg",
                      "flex items-center justify-center gap-2",
                      "transition-all duration-200",
                      !email && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={handleMagicLink}
                    disabled={!email}
                    whileHover={email ? { scale: 1.02 } : {}}
                    whileTap={email ? { scale: 0.98 } : {}}
                  >
                    Send Magic Link
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {authState === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 flex flex-col items-center"
              >
                <motion.div
                  className="w-12 h-12 rounded-full border-4 border-primary-200"
                  style={{ borderTopColor: "#a855f7" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="mt-4 text-gray-600">Signing you in...</p>
              </motion.div>
            )}

            {authState === "authenticated" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 flex flex-col items-center"
              >
                <motion.div
                  className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={springConfig.bouncy}
                >
                  <Check className="w-8 h-8 text-white" />
                </motion.div>

                <motion.h3
                  className="mt-4 text-lg font-semibold text-gray-900"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  You're all set!
                </motion.h3>

                <motion.p
                  className="mt-2 text-gray-600 text-center text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Navigate to your Instagram profile to start optimizing
                </motion.p>

                <motion.a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "mt-6 px-6 py-3 rounded-xl",
                    "gradient-primary text-white font-semibold",
                    "shadow-glow-md hover:shadow-glow-lg",
                    "flex items-center gap-2",
                    "transition-all duration-200"
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Open Instagram
                  <ArrowRight className="w-4 h-4" />
                </motion.a>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="mt-6 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            "AI-enhanced thumbnails",
            "Before/After comparison",
            "One-click optimization"
          ].map((feature, index) => (
            <motion.div
              key={feature}
              className="flex items-center gap-3 text-sm text-gray-600"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              {feature}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default App;
