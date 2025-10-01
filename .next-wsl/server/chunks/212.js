"use strict";
exports.id = 212;
exports.ids = [212];
exports.modules = {

/***/ 3212:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  NY: () => (/* binding */ getCardBalance),
  zs: () => (/* binding */ listCardTransactions),
  vC: () => (/* binding */ quoteDopeToUsdc),
  YT: () => (/* binding */ spendFromCard),
  J$: () => (/* binding */ topupCard),
  $L: () => (/* binding */ topupCardFiat)
});

// UNUSED EXPORTS: __resetLedger, verifyDopeDeposit

;// CONCATENATED MODULE: ./backend/ledger.ts
// Pluggable card-ledger gateway (provider-agnostic scaffold)
function provider() {
    const p = (process.env.CARD_LEDGER_PROVIDER || "memory").toLowerCase();
    return p === "generic" ? "generic" : "memory";
}
function base() {
    const u = process.env.CARD_LEDGER_BASE_URL;
    if (!u) throw new Error("CARD_LEDGER_BASE_URL not set");
    return u.replace(/\/$/, "");
}
async function fetchJson(path, init) {
    const headers = new Headers(init?.headers || {});
    headers.set("content-type", "application/json");
    const key = process.env.CARD_LEDGER_API_KEY || "";
    if (key) headers.set("authorization", `Bearer ${key}`);
    const res = await fetch(`${base()}${path}`, {
        ...init,
        headers
    });
    const text = await res.text();
    let json = null;
    try {
        json = JSON.parse(text);
    } catch  {
        json = {
            raw: text
        };
    }
    if (!res.ok) throw new Error(json?.error || `ledger ${res.status}`);
    return json;
}
async function ledgerCredit(pubkey, usdc, meta) {
    if (provider() === "memory") return {
        ok: true
    };
    return await fetchJson("/ledger/credit", {
        method: "POST",
        body: JSON.stringify({
            pubkey,
            amount: usdc,
            currency: "USDC",
            meta
        })
    });
}
async function ledgerDebit(pubkey, usdc, meta) {
    if (provider() === "memory") return {
        ok: true
    };
    return await fetchJson("/ledger/debit", {
        method: "POST",
        body: JSON.stringify({
            pubkey,
            amount: usdc,
            currency: "USDC",
            meta
        })
    });
}
async function ledgerBalance(pubkey) {
    if (provider() === "memory") return null; // signal use of local
    return await fetchJson(`/ledger/balance?pubkey=${encodeURIComponent(pubkey)}`);
}
async function ledgerTransactions(pubkey) {
    if (provider() === "memory") return null;
    return await fetchJson(`/ledger/transactions?pubkey=${encodeURIComponent(pubkey)}`);
}

;// CONCATENATED MODULE: ./backend/card-service.ts
// Simple card ledger and top-up service
// Default: in-memory. If CARD_LEDGER_PROVIDER=generic, mirrors to external ledger via backend/ledger.ts

const ledgers = new Map();
function nowSec() {
    return Math.floor(Date.now() / 1000);
}
function makeId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function ensureLedger(pubkey) {
    let l = ledgers.get(pubkey);
    if (!l) {
        l = {
            balance: 0,
            txs: []
        };
        ledgers.set(pubkey, l);
    }
    return l;
}
async function getCardBalance(pubkey) {
    try {
        const r = await ledgerBalance(pubkey);
        if (r && typeof r.balance === "number") {
            ensureLedger(pubkey).balance = Number(r.balance);
            return Number(r.balance);
        }
    } catch  {}
    return ensureLedger(pubkey).balance;
}
async function listCardTransactions(pubkey) {
    try {
        const r = await ledgerTransactions(pubkey);
        if (r && Array.isArray(r.txs)) return r.txs;
    } catch  {}
    return ensureLedger(pubkey).txs.slice().sort((a, b)=>b.time - a.time);
}
// Naive on-chain verification stub; replace with RPC checks
async function verifyDopeDeposit(_pubkey, signature) {
    // Accept non-empty signature for dev; in prod, verify transfer to vault PDA.
    if (!signature || typeof signature !== "string" || signature.length < 16) return false;
    return true;
}
// Simple quoting: 1 DOPE ~= 1 USDC minus 0.5% fee, slippage 0.5% assumed
function quoteDopeToUsdc(amountDope) {
    const price = 1.0;
    const gross = amountDope * price;
    const fee = Math.max(0, gross * 0.005);
    const slip = Math.max(0, gross * 0.005);
    const usdcOut = Math.max(0, gross - fee - slip);
    return {
        dopeIn: amountDope,
        usdcOut,
        price,
        fee,
        slippage: slip
    };
}
async function topupCard(pubkey, amountDope, signature) {
    if (!pubkey) throw new Error("pubkey required");
    if (!Number.isFinite(amountDope) || amountDope <= 0) throw new Error("invalid amount");
    const ok = await verifyDopeDeposit(pubkey, signature);
    if (!ok) throw new Error("deposit not verified");
    const q = quoteDopeToUsdc(amountDope);
    const ledger = ensureLedger(pubkey);
    try {
        const rem = await ledgerCredit(pubkey, q.usdcOut, {
            source: "dope_swap",
            signature,
            quote: q
        });
        if (rem && typeof rem.balance === "number") ledger.balance = Number(rem.balance);
        else ledger.balance += q.usdcOut;
    } catch  {
        ledger.balance += q.usdcOut;
    }
    const tx = {
        id: makeId(),
        type: "topup",
        amount: q.usdcOut,
        currency: "USDC",
        time: nowSec(),
        desc: `Top-up ${amountDope} DOPE → ${q.usdcOut.toFixed(2)} USDC`,
        ref: signature,
        meta: {
            dopeIn: amountDope,
            quote: q
        }
    };
    ledger.txs.push(tx);
    return {
        credited: q.usdcOut,
        quote: q,
        tx
    };
}
async function spendFromCard(pubkey, amountUsdc, desc) {
    if (!pubkey) throw new Error("pubkey required");
    if (!Number.isFinite(amountUsdc) || amountUsdc <= 0) throw new Error("invalid amount");
    const ledger = ensureLedger(pubkey);
    if (ledger.balance < amountUsdc) throw new Error("insufficient balance");
    try {
        const rem = await ledgerDebit(pubkey, amountUsdc, {
            source: "spend",
            desc
        });
        if (rem && typeof rem.balance === "number") ledger.balance = Number(rem.balance);
        else ledger.balance -= amountUsdc;
    } catch  {
        ledger.balance -= amountUsdc;
    }
    const tx = {
        id: makeId(),
        type: "spend",
        amount: amountUsdc,
        currency: "USDC",
        time: nowSec(),
        desc
    };
    ledger.txs.push(tx);
    return {
        remaining: ledger.balance,
        tx
    };
}
// For tests/dev reset
function __resetLedger(pubkey) {
    if (pubkey) ledgers.delete(pubkey);
    else ledgers.clear();
}
// ---- Fiat top-up (Apple/Google Pay) stub ----
async function topupCardFiat(pubkey, amountUsd, provider, paymentToken) {
    if (!pubkey) throw new Error("pubkey required");
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) throw new Error("invalid amount");
    // Simulate fees for card rails (1.5%)
    const fee = Math.max(0, amountUsd * 0.015);
    const usdcOut = Math.max(0, amountUsd - fee); // 1 USD ~= 1 USDC
    const ledger = ensureLedger(pubkey);
    try {
        const rem = await ledgerCredit(pubkey, usdcOut, {
            source: "fiat",
            provider,
            paymentToken,
            usdIn: amountUsd,
            fee
        });
        if (rem && typeof rem.balance === "number") ledger.balance = Number(rem.balance);
        else ledger.balance += usdcOut;
    } catch  {
        ledger.balance += usdcOut;
    }
    const tx = {
        id: makeId(),
        type: "fiat_topup",
        amount: usdcOut,
        currency: "USDC",
        time: nowSec(),
        desc: `Fiat top-up ${amountUsd.toFixed(2)} USD → ${usdcOut.toFixed(2)} USDC (${provider})`,
        ref: paymentToken,
        meta: {
            usdIn: amountUsd,
            fee,
            provider
        }
    };
    ledger.txs.push(tx);
    return {
        credited: usdcOut,
        fee,
        tx
    };
}


/***/ })

};
;