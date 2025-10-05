"use client";
import Link from "next/link";
import React from "react";

export default function AddWallet() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Add Wallet</h1>
      <p className="text-white/70 text-sm">Create a new wallet or import an existing one.</p>
      <div className="grid grid-cols-1 gap-3">
        <Link href="/get-started" className="btn w-full text-center">Create (Immediate Save)</Link>
        <Link href="/wallet/create" className="btn w-full text-center">Create (with Password)</Link>
        <Link href="/wallet/create?multichain=1" className="btn w-full text-center">Create Multichain Wallet</Link>
        <Link href="/wallet/import" className="btn w-full text-center">Import from Seed</Link>
      </div>
    </div>
  );
}

