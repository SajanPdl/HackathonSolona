"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { api } from "@/utils/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import gsap from "gsap";
import {
  Wallet,
  CheckCircle,
  MapPin,
  Loader2,
  ChevronRight,
  Shield,
  Clock,
  DollarSign,
  Users,
  Receipt,
  AlertCircle,
  Copy,
  ArrowRight,
} from "lucide-react";

export default function ClaimPage() {
  const { connected, publicKey } = useWallet();
  const [claimCode, setClaimCode] = useState("");
  const [step, setStep] = useState<"connect" | "enter" | "verify" | "success">(
    "connect",
  );
  const [verifiedTx, setVerifiedTx] = useState<any>(null);

  const verifyMutation = useMutation({
    mutationFn: (data: { claimCode: string }) =>
      api.claims.verify(data) as Promise<any>,
    onSuccess: (data: any) => {
      if (data.valid) {
        setVerifiedTx(data.transaction);
        setStep("verify");
      }
    },
    onError: () => {
      toast.error("Invalid or expired claim code");
    },
  });

  const redeemMutation = useMutation({
    mutationFn: (data: { claimCode: string; agentId: string }) =>
      api.claims.redeem(
        data,
        localStorage.getItem("aamapay_token")!,
      ) as Promise<any>,
    onSuccess: () => {
      setStep("success");
      toast.success("Money received successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to redeem");
    },
  });

  useEffect(() => {
    if (connected && publicKey) {
      const token = localStorage.getItem("aamapay_token");
      if (token) {
        setStep("enter");
      }
    }
  }, [connected, publicKey]);

  const handleConnect = async () => {
    if (connected && publicKey) {
      try {
        const token = localStorage.getItem("aamapay_token");
        if (!token) {
          const res = (await api.auth.login({
            walletAddress: publicKey.toString(),
          })) as { token: string };
          localStorage.setItem("aamapay_token", res.token);
        }
        setStep("enter");
      } catch (error) {
        try {
          const res = (await api.auth.register({
            walletAddress: publicKey.toString(),
          })) as { token: string };
          localStorage.setItem("aamapay_token", res.token);
          setStep("enter");
        } catch (err) {
          toast.error("Failed to connect wallet");
        }
      }
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (claimCode.length >= 6) {
      verifyMutation.mutate({ claimCode });
    }
  };

  const handleRedeem = async () => {
    try {
      const token = localStorage.getItem("aamapay_token");
      if (!token) {
        toast.error("Please connect your wallet");
        return;
      }
      await api.claims.redeem({ claimCode, agentId: "default-agent" }, token);
      setStep("success");
    } catch (error: any) {
      toast.error(error.message || "Failed to redeem");
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20 pb-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#16A34A]" />
            </div>

            <h1 className="text-2xl font-bold text-[#111827] mb-2">
              Money Received!
            </h1>
            <p className="text-[#6B7280] mb-8">
              Your transfer has been completed successfully
            </p>

            <div className="bg-[#16A34A]/5 rounded-2xl p-6 mb-6">
              <p className="text-sm text-[#6B7280] mb-1">You received</p>
              <p className="text-3xl font-bold text-[#16A34A]">
                {verifiedTx?.amount} SOLONA
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full bg-[#B91C1C] text-white py-4 rounded-xl font-medium hover:bg-[#991B1B] transition-colors flex items-center justify-center gap-2"
              >
                Back to Home
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-[#F5F5F5] text-[#111827] py-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Claim Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20">
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-8 h-8 text-[#B91C1C]" />
            </div>

            <h1 className="text-2xl font-bold text-[#111827] mb-3">
              Connect Wallet to Claim
            </h1>
            <p className="text-[#6B7280] mb-8 max-w-sm mx-auto">
              Connect your Phantom wallet to verify and claim your transfer
            </p>

            <WalletMultiButton className="!bg-[#B91C1C] !hover:bg-[#991B1B] !rounded-xl !w-full !justify-center !py-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pt-20 pb-12">
      <Toaster position="top-center" />

      <div className="max-w-lg mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/"
            className="text-[#6B7280] hover:text-[#111827] text-sm flex items-center gap-1"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#16A34A] to-[#15803D] p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Claim Money</h1>
                <p className="text-green-100 text-sm">
                  Enter your claim code to receive
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {step === "connect" && (
              <div className="text-center py-8">
                <button
                  onClick={handleConnect}
                  className="bg-[#B91C1C] text-white px-8 py-4 rounded-xl font-medium hover:bg-[#991B1B] transition-colors"
                >
                  Connect & Continue
                </button>
              </div>
            )}

            {step === "enter" && (
              <form onSubmit={handleVerify}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#111827] mb-2">
                    Claim Code
                  </label>
                  <input
                    type="text"
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                    placeholder="Enter your claim code"
                    className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent text-center text-xl font-mono tracking-widest"
                  />
                  <p className="text-xs text-[#6B7280] mt-2">
                    Ask the sender for the claim code they received
                  </p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[#F5F5F5] rounded-xl mb-6">
                  <Shield className="w-5 h-5 text-[#16A34A]" />
                  <p className="text-sm text-[#6B7280]">
                    Your code is encrypted and secure
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={verifyMutation.isPending || claimCode.length < 6}
                  className="w-full bg-[#B91C1C] text-white py-4 rounded-xl font-medium hover:bg-[#991B1B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {verifyMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Claim Code
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {step === "verify" && verifiedTx && (
              <div className="animate-fade-in">
                <div className="bg-[#16A34A]/5 border-2 border-[#16A34A]/20 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-[#16A34A]" />
                    <span className="font-semibold text-[#16A34A]">
                      Code Verified!
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-[#111827] mb-1">
                    {verifiedTx.amount} SOLONA
                  </p>
                  <p className="text-sm text-[#6B7280]">
                    Transfer confirmed • Sender: {verifiedTx.senderAddress}
                  </p>
                </div>

                <div className="bg-[#F5F5F5] rounded-2xl p-5 mb-6">
                  <h3 className="font-semibold text-[#111827] mb-3">
                    How to receive?
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#B91C1C]/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-[#B91C1C]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#111827]">
                          Cash Pickup
                        </p>
                        <p className="text-sm text-[#6B7280]">
                          Visit a nearby agent and get cash
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#16A34A]/10 flex items-center justify-center shrink-0">
                        <Wallet className="w-4 h-4 text-[#16A34A]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#111827]">
                          Wallet Deposit
                        </p>
                        <p className="text-sm text-[#6B7280]">
                          Instant transfer to your wallet
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRedeem}
                  disabled={redeemMutation.isPending}
                  className="w-full bg-[#16A34A] text-white py-4 rounded-xl font-medium hover:bg-[#15803D] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {redeemMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Receive to My Wallet
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-[#6B7280] text-center">
                    By claiming, you agree to the transfer terms. Funds will be
                    deposited instantly.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-6">
          <h3 className="font-semibold text-[#111827] mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#B91C1C]" />
            Claim Code Info
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">Valid for</span>
              <span className="font-medium text-[#111827]">24 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">Can be claimed once</span>
              <span className="font-medium text-[#111827]">Yes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">No hidden fees</span>
              <span className="font-medium text-[#16A34A]">Always</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
