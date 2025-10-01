exports.id = 659;
exports.ids = [659];
exports.modules = {

/***/ 9590:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 679:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

Promise.resolve(/* import() eager */).then(__webpack_require__.bind(__webpack_require__, 5473))

/***/ }),

/***/ 6980:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

Promise.resolve(/* import() eager */).then(__webpack_require__.bind(__webpack_require__, 8003))

/***/ }),

/***/ 4844:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 1232, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 831, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 2987, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 6926, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 4282, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 6505, 23))

/***/ }),

/***/ 5473:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ GlobalError)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6786);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8038);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* __next_internal_client_entry_do_not_use__ default auto */ 

function GlobalError({ error, reset }) {
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("html", {
        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("body", {
            style: {
                background: "#0b0c10",
                color: "#fff",
                fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
            },
            children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                style: {
                    maxWidth: 560,
                    margin: "20vh auto 0",
                    padding: 24
                },
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h1", {
                        style: {
                            fontSize: 22,
                            fontWeight: 700,
                            marginBottom: 12
                        },
                        children: "Something went wrong"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        style: {
                            opacity: 0.8,
                            fontSize: 14,
                            marginBottom: 16
                        },
                        children: error.message || "Unhandled error"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                        onClick: ()=>reset(),
                        style: {
                            padding: "10px 14px",
                            borderRadius: 9999,
                            background: "#fff",
                            color: "#000"
                        },
                        children: "Try again"
                    })
                ]
            })
        })
    });
}


/***/ }),

/***/ 8003:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ RootLayout)
});

// EXTERNAL MODULE: external "next/dist/compiled/react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(6786);
// EXTERNAL MODULE: external "buffer"
var external_buffer_ = __webpack_require__(4300);
;// CONCATENATED MODULE: ./polyfills.ts
// Ensure Buffer is available globally in the browser before any libs run
// Some libraries (e.g. @solana/web3.js) expect global Buffer

try {
    const g = typeof globalThis !== "undefined" ? globalThis : window;
    if (!g.Buffer) {
        g.Buffer = external_buffer_.Buffer;
    }
} catch  {
// no-op
}

// EXTERNAL MODULE: ./styles/globals.css
var globals = __webpack_require__(2307);
// EXTERNAL MODULE: external "next/dist/compiled/react"
var react_ = __webpack_require__(8038);
// EXTERNAL MODULE: ./components/WalletProvider.tsx
var WalletProvider = __webpack_require__(1730);
// EXTERNAL MODULE: ./node_modules/next/link.js
var next_link = __webpack_require__(1440);
var link_default = /*#__PURE__*/__webpack_require__.n(next_link);
// EXTERNAL MODULE: ./node_modules/next/navigation.js
var navigation = __webpack_require__(7114);
;// CONCATENATED MODULE: ./components/BottomNav.tsx
/* __next_internal_client_entry_do_not_use__ default auto */ 



const items = [
    {
        href: "/",
        label: "Home",
        icon: (active)=>/*#__PURE__*/ jsx_runtime_.jsx("svg", {
                width: "22",
                height: "22",
                viewBox: "0 0 24 24",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                children: /*#__PURE__*/ jsx_runtime_.jsx("path", {
                    d: "M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5z",
                    fill: active ? "#ffffff" : "#9aa0a6"
                })
            })
    },
    {
        href: "/card",
        label: "Card",
        icon: (active)=>/*#__PURE__*/ (0,jsx_runtime_.jsxs)("svg", {
                width: "22",
                height: "22",
                viewBox: "0 0 24 24",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx("rect", {
                        x: "3",
                        y: "6",
                        width: "18",
                        height: "12",
                        rx: "2",
                        stroke: active ? "#ffffff" : "#9aa0a6",
                        strokeWidth: "2"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("rect", {
                        x: "6",
                        y: "12",
                        width: "6",
                        height: "2",
                        fill: active ? "#ffffff" : "#9aa0a6"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("rect", {
                        x: "14",
                        y: "12",
                        width: "4",
                        height: "2",
                        fill: active ? "#ffffff" : "#9aa0a6"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("rect", {
                        x: "3",
                        y: "8",
                        width: "18",
                        height: "2",
                        fill: active ? "#ffffff" : "#9aa0a6"
                    })
                ]
            })
    },
    {
        href: "/transactions",
        label: "Activity",
        icon: (active)=>/*#__PURE__*/ (0,jsx_runtime_.jsxs)("svg", {
                width: "22",
                height: "22",
                viewBox: "0 0 24 24",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx("path", {
                        d: "M4 12l4 4 8-8",
                        stroke: active ? "#ffffff" : "#9aa0a6",
                        strokeWidth: "2",
                        strokeLinecap: "round",
                        strokeLinejoin: "round"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("path", {
                        d: "M20 7v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7",
                        stroke: active ? "#ffffff" : "#9aa0a6",
                        strokeWidth: "2",
                        strokeLinecap: "round",
                        strokeLinejoin: "round"
                    })
                ]
            })
    },
    {
        href: "/wallet/chat",
        label: "Chat",
        icon: (active)=>/*#__PURE__*/ (0,jsx_runtime_.jsxs)("svg", {
                width: "22",
                height: "22",
                viewBox: "0 0 24 24",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx("path", {
                        d: "M20 12c0 4-3.582 7-8 7-0.69 0-1.36-0.07-2-0.2L6 20l1.2-3C5.85 15.9 4 14.17 4 12 4 8 7.582 5 12 5s8 3 8 7z",
                        stroke: active ? "#ffffff" : "#9aa0a6",
                        strokeWidth: "2",
                        strokeLinejoin: "round",
                        fill: "none"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("circle", {
                        cx: "10",
                        cy: "12",
                        r: "1",
                        fill: active ? "#ffffff" : "#9aa0a6"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("circle", {
                        cx: "13",
                        cy: "12",
                        r: "1",
                        fill: active ? "#ffffff" : "#9aa0a6"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("circle", {
                        cx: "16",
                        cy: "12",
                        r: "1",
                        fill: active ? "#ffffff" : "#9aa0a6"
                    })
                ]
            })
    }
];
function BottomNav() {
    const pathname = (0,navigation.usePathname)();
    return /*#__PURE__*/ jsx_runtime_.jsx("nav", {
        className: "fixed bottom-0 inset-x-0 z-40",
        children: /*#__PURE__*/ jsx_runtime_.jsx("div", {
            className: "mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl",
            style: {
                paddingBottom: "env(safe-area-inset-bottom)"
            },
            children: /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: "m-3 rounded-2xl glass border border-white/5 backdrop-blur px-4 py-2 flex items-center justify-between bg-white/5",
                children: items.map((it)=>{
                    const active = pathname === it.href;
                    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)((link_default()), {
                        href: it.href,
                        className: "flex flex-col items-center gap-1 py-1 px-2",
                        children: [
                            it.icon(active),
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                className: `text-[10px] ${active ? "text-white" : "text-white/60"}`,
                                children: it.label
                            })
                        ]
                    }, it.href);
                })
            })
        })
    });
}

// EXTERNAL MODULE: ./lib/wallet.ts
var wallet = __webpack_require__(5943);
;// CONCATENATED MODULE: ./components/SideMenu.tsx
/* __next_internal_client_entry_do_not_use__ default auto */ 




function SideMenu({ open, onClose }) {
    const router = (0,navigation.useRouter)();
    const ctx = (0,WalletProvider/* useWalletOptional */.Ek)();
    const address = ctx?.address || null;
    const logout = ctx?.logout || (()=>{});
    const [tab, setTab] = (0,react_.useState)("profile");
    const [scheme, setScheme] = (0,react_.useState)("");
    const [currentPwd, setCurrentPwd] = (0,react_.useState)("");
    const [newPwd, setNewPwd] = (0,react_.useState)("");
    const [confirm, setConfirm] = (0,react_.useState)("");
    const [msg, setMsg] = (0,react_.useState)("");
    const [err, setErr] = (0,react_.useState)("");
    const [wallets, setWallets] = (0,react_.useState)([]);
    (0,react_.useEffect)(()=>{
        if (!open) return;
        setWallets((0,wallet/* getWallets */.MX)());
        const stored = (0,wallet/* getStoredWallet */.MI)();
        setScheme(stored?.scheme || "");
    }, [
        open
    ]);
    const doCopy = async ()=>{
        try {
            await navigator.clipboard.writeText(address || "");
            setMsg("Address copied");
            setTimeout(()=>setMsg(""), 1500);
        } catch  {}
    };
    const applyPasswordChange = async ()=>{
        setErr("");
        setMsg("");
        try {
            if (scheme === "password") {
                if (!currentPwd || !newPwd || newPwd !== confirm) throw new Error("Check passwords");
                await (0,wallet/* changePassword */.Cp)(currentPwd, newPwd);
                setMsg("Password updated");
            } else if (scheme === "device") {
                if (!newPwd || newPwd !== confirm) throw new Error("Enter and confirm new password");
                await (0,wallet/* setPasswordForDeviceWallet */.AG)(newPwd);
                setMsg("Password set for wallet");
                setScheme("password");
            }
            setCurrentPwd("");
            setNewPwd("");
            setConfirm("");
        } catch (e) {
            setErr(e?.message || "Failed to update password");
        }
    };
    const onSelectWallet = (id)=>{
        (0,wallet/* selectWallet */.sm)(id);
        setWallets((0,wallet/* getWallets */.MX)());
        onClose();
        router.replace("/");
    };
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: `fixed inset-0 ${open ? "" : "pointer-events-none"} z-50`,
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: `absolute inset-0 bg-black/60 transition-opacity ${open ? "opacity-100" : "opacity-0"}`,
                onClick: onClose
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("aside", {
                className: `absolute inset-y-0 left-0 w-[82vw] max-w-[340px] bg-[#12131a] border-r border-white/10 transform transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`,
                children: [
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: "p-4 border-b border-white/10 flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ jsx_runtime_.jsx("img", {
                                        src: "/logo-192.png",
                                        alt: "logo",
                                        className: "w-6 h-6"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                        className: "font-semibold",
                                        children: "Menu"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                onClick: onClose,
                                className: "text-white/70",
                                "aria-label": "Close",
                                children: "\xd7"
                            })
                        ]
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                        className: "px-4 pt-3 text-sm",
                        children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                            className: "scroll-x-invisible flex gap-3 pr-1",
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                    className: `px-3 py-2 rounded-lg ${tab === "profile" ? "bg-white/10" : ""}`,
                                    onClick: ()=>setTab("profile"),
                                    children: "Profile"
                                }),
                                /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                    className: `px-3 py-2 rounded-lg ${tab === "wallets" ? "bg-white/10" : ""}`,
                                    onClick: ()=>setTab("wallets"),
                                    children: "Wallets"
                                }),
                                /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                    className: `px-3 py-2 rounded-lg ${tab === "settings" ? "bg-white/10" : ""}`,
                                    onClick: ()=>setTab("settings"),
                                    children: "Settings"
                                }),
                                /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                    className: `px-3 py-2 rounded-lg ${tab === "developer" ? "bg-white/10" : ""}`,
                                    onClick: ()=>setTab("developer"),
                                    children: "Developer"
                                })
                            ]
                        })
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: "p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]",
                        children: [
                            tab === "profile" && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                className: "text-xs text-white/60",
                                                children: "Active Address"
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                className: "font-mono text-sm break-all",
                                                children: address
                                            }),
                                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                                className: "mt-2 flex gap-2",
                                                children: [
                                                    /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                                        className: "btn",
                                                        onClick: doCopy,
                                                        children: "Copy"
                                                    }),
                                                    /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                                        className: "btn",
                                                        onClick: ()=>{
                                                            logout();
                                                            onClose();
                                                        },
                                                        children: "Logout"
                                                    })
                                                ]
                                            }),
                                            msg && /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                className: "text-xs text-green-400 mt-2",
                                                children: msg
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                        className: "glass rounded-xl p-3 border border-white/10",
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                className: "font-semibold mb-2",
                                                children: scheme === "password" ? "Change Password" : "Set Password"
                                            }),
                                            scheme === "password" && /*#__PURE__*/ jsx_runtime_.jsx("input", {
                                                type: "password",
                                                placeholder: "Current password",
                                                value: currentPwd,
                                                onChange: (e)=>setCurrentPwd(e.target.value),
                                                className: "w-full mb-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("input", {
                                                type: "password",
                                                placeholder: "New password",
                                                value: newPwd,
                                                onChange: (e)=>setNewPwd(e.target.value),
                                                className: "w-full mb-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("input", {
                                                type: "password",
                                                placeholder: "Confirm new password",
                                                value: confirm,
                                                onChange: (e)=>setConfirm(e.target.value),
                                                className: "w-full mb-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"
                                            }),
                                            err && /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                className: "text-xs text-red-400 mb-2",
                                                children: err
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                                className: "btn w-full",
                                                onClick: applyPasswordChange,
                                                children: scheme === "password" ? "Update Password" : "Set Password"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            tab === "wallets" && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                className: "font-semibold",
                                                children: "Wallets"
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                                className: "btn",
                                                onClick: ()=>{
                                                    onClose();
                                                    router.push("/wallet/add");
                                                },
                                                children: "+ Add"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                        className: "space-y-2",
                                        children: wallets.map((w)=>/*#__PURE__*/ (0,jsx_runtime_.jsxs)("button", {
                                                onClick: ()=>onSelectWallet(w.id),
                                                className: `w-full text-left p-3 rounded-lg border ${address === w.pubkey ? "border-white/40 bg-white/5" : "border-white/10 bg-white/0"}`,
                                                children: [
                                                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                        className: "text-xs text-white/60",
                                                        children: w.name || "Wallet"
                                                    }),
                                                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                        className: "font-mono text-sm break-all",
                                                        children: w.pubkey
                                                    })
                                                ]
                                            }, w.id))
                                    })
                                ]
                            }),
                            tab === "settings" && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                        className: "text-sm text-white/80",
                                        children: "Manage your wallet preferences."
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                        className: "btn",
                                        onClick: ()=>{
                                            onClose();
                                            router.push("/settings");
                                        },
                                        children: "Open Settings"
                                    })
                                ]
                            }),
                            tab === "developer" && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                        className: "text-sm text-white/80",
                                        children: "Developer options for network selection."
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                        className: "btn",
                                        onClick: ()=>{
                                            onClose();
                                            router.push("/settings/developer");
                                        },
                                        children: "Open Developer Settings"
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });
}

;// CONCATENATED MODULE: ./app/layout.tsx
/* __next_internal_client_entry_do_not_use__ default auto */ 
// Load polyfills (Buffer) before any other imports use it








function RootLayout({ children }) {
    const [menuOpen, setMenuOpen] = (0,react_.useState)(false);
    (0,react_.useEffect)(()=>{
        // Register service worker for PWA (production only, after load)
        if (false) {}
    }, []);
    function HeaderBar() {
        const w = (0,WalletProvider/* useWalletOptional */.Ek)();
        // Header stays clean; Unlock is only shown contextually on pages (e.g., DOPE Sync row)
        return /*#__PURE__*/ jsx_runtime_.jsx("header", {
            className: "sticky top-0 z-30 backdrop-blur glass px-4 py-3 border-b border-white/5",
            children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: "mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("button", {
                        onClick: ()=>setMenuOpen(true),
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("img", {
                                src: "/logo-192.png",
                                alt: "logo",
                                className: "w-6 h-6 rounded"
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                className: "font-semibold tracking-wide",
                                children: "DOPE"
                            })
                        ]
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                        className: "flex items-center gap-3",
                        children: /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                            href: "/wallet/add",
                            className: "btn",
                            children: "+ Add"
                        })
                    })
                ]
            })
        });
    }
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("html", {
        lang: "en",
        children: [
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("head", {
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx("meta", {
                        name: "viewport",
                        content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("meta", {
                        name: "theme-color",
                        content: "#2a2b3a"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("link", {
                        rel: "manifest",
                        href: "/manifest.json"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("link", {
                        rel: "apple-touch-icon",
                        href: "/logo-192.png"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("meta", {
                        name: "apple-mobile-web-app-capable",
                        content: "yes"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("meta", {
                        name: "apple-mobile-web-app-status-bar-style",
                        content: "black-translucent"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("title", {
                        children: "DOPE"
                    })
                ]
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("body", {
                className: "min-h-[100dvh] bg-[#0b0c10] text-white",
                children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)(WalletProvider/* WalletProvider */.nS, {
                    children: [
                        /*#__PURE__*/ jsx_runtime_.jsx(HeaderBar, {}),
                        /*#__PURE__*/ jsx_runtime_.jsx("main", {
                            className: "mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl pb-20 px-4 pt-4",
                            style: {
                                paddingBottom: "calc(6rem + env(safe-area-inset-bottom))"
                            },
                            children: children
                        }),
                        /*#__PURE__*/ jsx_runtime_.jsx(BottomNav, {}),
                        /*#__PURE__*/ jsx_runtime_.jsx(SideMenu, {
                            open: menuOpen,
                            onClose: ()=>setMenuOpen(false)
                        })
                    ]
                })
            })
        ]
    });
}


/***/ }),

/***/ 1730:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ek: () => (/* binding */ useWalletOptional),
/* harmony export */   Os: () => (/* binding */ useWallet),
/* harmony export */   nS: () => (/* binding */ WalletProvider)
/* harmony export */ });
/* unused harmony export WalletContext */
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6786);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8038);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var bs58__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8806);
/* harmony import */ var bs58__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(bs58__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _lib_wallet__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5943);
/* __next_internal_client_entry_do_not_use__ WalletContext,WalletProvider,useWallet,useWalletOptional auto */ 



const WalletContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)(null);
function WalletProvider({ children }) {
    const [address, setAddress] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    const [keypair, setKeypair] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    const [unlocked, setUnlocked] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)( false ? 0 : false);
    const [bioAvailable, setBioAvailable] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [hasWallet, setHasWallet] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [ready, setReady] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        const stored = (0,_lib_wallet__WEBPACK_IMPORTED_MODULE_3__/* .getStoredWallet */ .MI)();
        if (stored) {
            setAddress(stored.pubkey);
            setHasWallet(true);
        } else {
            setHasWallet(false);
        }
        setUnlocked((0,_lib_wallet__WEBPACK_IMPORTED_MODULE_3__/* .isUnlocked */ .Ru)());
        (0,_lib_wallet__WEBPACK_IMPORTED_MODULE_3__/* .isBiometricAvailable */ .SX)().then(setBioAvailable).catch(()=>setBioAvailable(false));
        // Auto-unlock device-scheme wallets
        (async ()=>{
            try {
                if (stored?.scheme === "device") {
                    const kp = await (0,_lib_wallet__WEBPACK_IMPORTED_MODULE_3__/* .unlockWithDevice */ .s6)();
                    setKeypair(kp);
                    setUnlocked(true);
                }
            } catch  {
            // ignore, user can still use unlock page
            }
        })();
        const onStore = ()=>{
            const s = (0,_lib_wallet__WEBPACK_IMPORTED_MODULE_3__/* .getStoredWallet */ .MI)();
            if (s) {
                setAddress(s.pubkey);
                setHasWallet(true);
            }
        };
        if (false) {}
        return ()=>{
            if (false) {}
        };
    }, []);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        // mark provider initialized so pages can gate redirects until state is hydrated
        setReady(true);
    }, []);
    const createWallet = async (password)=>{
        const res = await (0,_lib_wallet__WEBPACK_IMPORTED_MODULE_3__/* .createNewWallet */ .Z9)(password);
        setAddress(res.address);
        setHasWallet(true);
        return res;
    };
    const importWallet = async (mnemonic, password, derivationKeyOrPath = "phantom", bip39Passphrase)=>{
        const isPath = typeof derivationKeyOrPath === "string" && derivationKeyOrPath.startsWith("m/");
        const res = isPath ? await (0,_lib_wallet__WEBPACK_IMPORTED_MODULE_3__/* .importWalletWithPath */ .ir)(mnemonic, password, derivationKeyOrPath, bip39Passphrase) : await (0,_lib_wallet__WEBPACK_IMPORTED_MODULE_3__/* .importWalletFromMnemonic */ .o4)(mnemonic, password, derivationKeyOrPath, bip39Passphrase);
        setAddress(res.address);
        setHasWallet(true);
        return res;
    };
    const importKeypair = async (secretInput, password)=>{
        let secret = null;
        const s = secretInput.trim();
        try {
            if (s.startsWith("[")) {
                const arr = JSON.parse(s);
                if (Array.isArray(arr)) secret = new Uint8Array(arr.map((x)=>Number(x)));
            } else if (/^[A-Za-z0-9+/=]+$/.test(s) && s.includes("=")) {
                // base64
                const bin = atob(s);
                const u8 = new Uint8Array(bin.length);
                for(let i = 0; i < bin.length; i++)u8[i] = bin.charCodeAt(i);
                secret = u8;
            } else if (/^[1-9A-HJ-NP-Za-km-z]+$/.test(s)) {
                // base58
                secret = bs58__WEBPACK_IMPORTED_MODULE_2___default().decode(s);
            }
        } catch  {}
        if (!secret) throw new Error("Invalid keypair input. Paste JSON array, base58, or base64 secret key.");
        const { importWalletFromSecretKey } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 5943));
        const res = await importWalletFromSecretKey(secret, password);
        setAddress(res.address);
        setHasWallet(true);
        return res;
    };
    const unlock = async (password)=>{
        const kp = await (0,_lib_wallet__WEBPACK_IMPORTED_MODULE_3__/* .unlockWithPassword */ .fK)(password);
        setKeypair(kp);
        setUnlocked(true);
    };
    const tryBiometricUnlock = async ()=>{
        if (!bioAvailable) return false;
        const ok = await (0,_lib_wallet__WEBPACK_IMPORTED_MODULE_3__/* .biometricGate */ .B9)();
        // Biometric is used as a quick gate; actual key is still password-based.
        // For convenience, if a session is already considered unlocked by prior password use,
        // biometric alone will allow re-entry on return to app while session storage persists.
        if (ok && (0,_lib_wallet__WEBPACK_IMPORTED_MODULE_3__/* .isUnlocked */ .Ru)()) {
            setUnlocked(true);
            return true;
        }
        return false;
    };
    const lock = ()=>{
        setKeypair(null);
        // keep session flag to allow biometric quick re-entry unless user logs out
        setUnlocked(false);
    };
    const logout = ()=>{
        setKeypair(null);
        (0,_lib_wallet__WEBPACK_IMPORTED_MODULE_3__/* .clearStoredWallet */ .QD)();
        setUnlocked(false);
        setAddress(null);
        setHasWallet(false);
    };
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(WalletContext.Provider, {
        value: {
            address,
            unlocked,
            keypair,
            hasWallet,
            ready,
            createWallet,
            importWallet,
            importKeypair,
            unlock,
            tryBiometricUnlock,
            lock,
            logout
        },
        children: children
    });
}
function useWallet() {
    const ctx = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(WalletContext);
    if (!ctx) throw new Error("useWallet must be used within WalletProvider");
    return ctx;
}
function useWalletOptional() {
    return (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(WalletContext);
}


/***/ }),

/***/ 2344:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Fz: () => (/* binding */ DOPE_MINT)
/* harmony export */ });
/* unused harmony exports USDC_MINT, quoteDopeToUsdc, executeSwapDopeToUsdc */
// Swap helper (stub): DOPE -> USDC quoting and placeholders for execution
const DOPE_MINT = process.env.NEXT_PUBLIC_DOPE_MINT || "FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
function quoteDopeToUsdc(amountDope, opts) {
    const feeBps = opts?.feeBps ?? 50; // 0.5%
    const slippageBps = opts?.slippageBps ?? 50; // 0.5%
    const price = 1.0; // stub rate
    const gross = amountDope * price;
    const fee = gross * feeBps / 10000;
    const slippage = gross * slippageBps / 10000;
    const usdcOut = Math.max(0, gross - fee - slippage);
    return {
        dopeIn: amountDope,
        usdcOut,
        price,
        fee,
        slippage
    };
}
async function executeSwapDopeToUsdc(dopeAmount) {
    // Stub execution: return quote and a fake signature
    const q = quoteDopeToUsdc(dopeAmount);
    const sig = Math.random().toString(36).slice(2) + Date.now().toString(36);
    return {
        usdcOut: q.usdcOut,
        signature: sig
    };
}


/***/ }),

/***/ 5943:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $p: () => (/* binding */ sendEncryptedChatMessage),
/* harmony export */   AG: () => (/* binding */ setPasswordForDeviceWallet),
/* harmony export */   B5: () => (/* binding */ getConnection),
/* harmony export */   B9: () => (/* binding */ biometricGate),
/* harmony export */   BD: () => (/* binding */ getPublishedChatKeyB64),
/* harmony export */   Cp: () => (/* binding */ changePassword),
/* harmony export */   EJ: () => (/* binding */ setSelectedNetwork),
/* harmony export */   IC: () => (/* binding */ deriveChatKeypairFromMnemonic),
/* harmony export */   KR: () => (/* binding */ getSelectedNetwork),
/* harmony export */   LJ: () => (/* binding */ setActiveWalletName),
/* harmony export */   MI: () => (/* binding */ getStoredWallet),
/* harmony export */   MX: () => (/* binding */ getWallets),
/* harmony export */   QD: () => (/* binding */ clearStoredWallet),
/* harmony export */   Ru: () => (/* binding */ isUnlocked),
/* harmony export */   SX: () => (/* binding */ isBiometricAvailable),
/* harmony export */   Tf: () => (/* binding */ mnemonicToKeypairFromPath),
/* harmony export */   Vx: () => (/* binding */ sendSol),
/* harmony export */   Z9: () => (/* binding */ createNewWallet),
/* harmony export */   _f: () => (/* binding */ getDopeTokenBalance),
/* harmony export */   cc: () => (/* binding */ getConversation),
/* harmony export */   e$: () => (/* binding */ publishChatKey),
/* harmony export */   fK: () => (/* binding */ unlockWithPassword),
/* harmony export */   h8: () => (/* binding */ getActiveWallet),
/* harmony export */   iB: () => (/* binding */ subscribeBalance),
/* harmony export */   importWalletFromSecretKey: () => (/* binding */ importWalletFromSecretKey),
/* harmony export */   ir: () => (/* binding */ importWalletWithPath),
/* harmony export */   lv: () => (/* binding */ getMnemonicForActiveWallet),
/* harmony export */   n5: () => (/* binding */ DERIVATION_PRESETS),
/* harmony export */   o4: () => (/* binding */ importWalletFromMnemonic),
/* harmony export */   q7: () => (/* binding */ getActiveWalletSecrets),
/* harmony export */   ql: () => (/* binding */ createWalletImmediateSave),
/* harmony export */   s6: () => (/* binding */ unlockWithDevice),
/* harmony export */   sm: () => (/* binding */ selectWallet),
/* harmony export */   tU: () => (/* binding */ getRecentTransactions),
/* harmony export */   vw: () => (/* binding */ getRpcEndpoint),
/* harmony export */   yZ: () => (/* binding */ getSolBalance)
/* harmony export */ });
/* unused harmony exports encryptMnemonic, decryptMnemonic, generateMnemonic, mnemonicToKeypair, setStoredWallet, addWalletRecord, markUnlocked, getWsEndpoint, LAMPORTS_PER_DOPE, lamportsToDope */
/* harmony import */ var bip39__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4261);
/* harmony import */ var tweetnacl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3459);
/* harmony import */ var tweetnacl__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(tweetnacl__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var ed25519_hd_key__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(310);
/* harmony import */ var _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5766);
/* harmony import */ var _swap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2344);
/* harmony import */ var buffer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(4300);
/* harmony import */ var buffer__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(buffer__WEBPACK_IMPORTED_MODULE_5__);






const STORAGE_KEY = "dope_wallet_v1"; // keep same key; migrate single -> multi in-place
const DEVICE_SECRET_KEY = "dope_wallet_device_secret"; // base64 random 32 bytes
const SESSION_UNLOCK_KEY = "dope_wallet_session_unlocked";
const enc = new TextEncoder();
const dec = new TextDecoder();
// Ensure WebCrypto BufferSource typing compatibility across TS targets
function abFromU8(u8) {
    // Create a standalone ArrayBuffer and copy bytes to avoid SAB typing issues
    const out = new ArrayBuffer(u8.byteLength);
    new Uint8Array(out).set(u8);
    return out;
}
function toB64(d) {
    const bytes = d instanceof ArrayBuffer ? new Uint8Array(d) : d;
    let str = "";
    bytes.forEach((b)=>str += String.fromCharCode(b));
    return btoa(str);
}
function fromB64(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for(let i = 0; i < bin.length; i++)bytes[i] = bin.charCodeAt(i);
    return bytes;
}
async function deriveAesKey(password, salt, iterations) {
    const baseKey = await crypto.subtle.importKey("raw", abFromU8(enc.encode(password)), "PBKDF2", false, [
        "deriveKey"
    ]);
    return crypto.subtle.deriveKey({
        name: "PBKDF2",
        hash: "SHA-256",
        salt: abFromU8(salt),
        iterations
    }, baseKey, {
        name: "AES-GCM",
        length: 256
    }, false, [
        "encrypt",
        "decrypt"
    ]);
}
async function encryptMnemonic(mnemonic, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const iterations = 250000;
    const key = await deriveAesKey(password, salt, iterations);
    const ct = await crypto.subtle.encrypt({
        name: "AES-GCM",
        iv: abFromU8(iv)
    }, key, abFromU8(enc.encode(mnemonic)));
    return {
        algo: "AES-GCM",
        iv: toB64(iv),
        salt: toB64(salt),
        iterations,
        cipherText: toB64(ct)
    };
}
async function decryptMnemonic(ed, password) {
    const salt = fromB64(ed.salt);
    const iv = fromB64(ed.iv);
    const key = await deriveAesKey(password, salt, ed.iterations);
    const pt = await crypto.subtle.decrypt({
        name: "AES-GCM",
        iv: abFromU8(iv)
    }, key, abFromU8(fromB64(ed.cipherText)));
    return dec.decode(pt);
}
function generateMnemonic(strength = 128) {
    const entropyBytes = strength / 8;
    const bytes = crypto.getRandomValues(new Uint8Array(entropyBytes));
    const hex = Array.from(bytes).map((b)=>b.toString(16).padStart(2, "0")).join("");
    return bip39__WEBPACK_IMPORTED_MODULE_0__/* .entropyToMnemonic */ .JJ(hex);
}
const DERIVATION_PRESETS = [
    {
        key: "phantom",
        label: "Phantom / Backpack (m/44'/501'/0'/0')",
        path: "m/44'/501'/0'/0'"
    },
    {
        key: "sollet",
        label: "Sollet (m/44'/501'/0')",
        path: "m/44'/501'/0'"
    },
    {
        key: "ledger_alt",
        label: "Ledger/Backpack Alt (m/44'/501'/0'/0'/0')",
        path: "m/44'/501'/0'/0'/0'"
    }
];
async function mnemonicToKeypairFromPath(mnemonic, path, bip39Passphrase) {
    if (!bip39__WEBPACK_IMPORTED_MODULE_0__/* .validateMnemonic */ ._I(mnemonic)) throw new Error("Invalid mnemonic");
    const seed = await bip39__WEBPACK_IMPORTED_MODULE_0__/* .mnemonicToSeed */ .OI(mnemonic, bip39Passphrase || "");
    const derived = (0,ed25519_hd_key__WEBPACK_IMPORTED_MODULE_2__.derivePath)(path, buffer__WEBPACK_IMPORTED_MODULE_5__.Buffer.from(seed).toString("hex"));
    const kp = tweetnacl__WEBPACK_IMPORTED_MODULE_1___default().sign.keyPair.fromSeed(new Uint8Array(derived.key));
    return _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .Keypair */ .RG.fromSecretKey(kp.secretKey);
}
// Back-compat helper using prior account index scheme (maps to Phantom path for account=0)
async function mnemonicToKeypair(mnemonic, account = 0, bip39Passphrase) {
    const path = `m/44'/501'/${account}'/0'`;
    return mnemonicToKeypairFromPath(mnemonic, path, bip39Passphrase);
}
function makeId() {
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    return Array.from(bytes).map((b)=>b.toString(16).padStart(2, "0")).join("");
}
function emptyStore() {
    return {
        version: 2,
        wallets: []
    };
}
function isSingleWalletShape(o) {
    return o && typeof o === "object" && "encMnemonic" in o && "pubkey" in o;
}
function loadStore() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    try {
        const parsed = JSON.parse(raw);
        // v2 store
        if (parsed && parsed.version === 2 && Array.isArray(parsed.wallets)) {
            return parsed;
        }
        // v1 single -> migrate to v2
        if (isSingleWalletShape(parsed)) {
            const id = makeId();
            const store = {
                version: 2,
                wallets: [
                    {
                        ...parsed,
                        id
                    }
                ],
                selectedId: id
            };
            saveStore(store);
            return store;
        }
    } catch  {
    // fallthrough
    }
    return emptyStore();
}
function saveStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    if (false) {}
}
function getWallets() {
    return loadStore().wallets;
}
function getActiveWallet() {
    const store = loadStore();
    if (store.wallets.length === 0) return null;
    const active = store.wallets.find((w)=>w.id === store.selectedId) || store.wallets[0];
    return active || null;
}
function selectWallet(id) {
    const store = loadStore();
    if (!store.wallets.find((w)=>w.id === id)) return;
    store.selectedId = id;
    saveStore(store);
}
function updateActiveWallet(mut) {
    const store = loadStore();
    const idx = store.wallets.findIndex((w)=>w.id === store.selectedId);
    const i = idx >= 0 ? idx : 0;
    if (!store.wallets[i]) return;
    mut(store.wallets[i]);
    saveStore(store);
}
// Update the active wallet's display name
function setActiveWalletName(name) {
    updateActiveWallet((w)=>{
        w.name = name.trim() || undefined;
    });
}
function getStoredWallet() {
    const aw = getActiveWallet();
    if (!aw) return null;
    return {
        encMnemonic: aw.encMnemonic,
        pubkey: aw.pubkey,
        createdAt: aw.createdAt,
        biometricEnabled: aw.biometricEnabled,
        scheme: aw.scheme,
        derivationPath: aw.derivationPath,
        bip39PassphraseEnc: aw.bip39PassphraseEnc,
        encSecretKey: aw.encSecretKey
    };
}
function setStoredWallet(w) {
    // Back-compat: replace store with a single active wallet
    const store = {
        version: 2,
        wallets: [
            {
                ...w,
                id: makeId()
            }
        ],
        selectedId: undefined
    };
    store.selectedId = store.wallets[0].id;
    saveStore(store);
}
function addWalletRecord(w, name) {
    const store = loadStore();
    const withMeta = {
        ...w,
        id: makeId(),
        name
    };
    store.wallets.push(withMeta);
    store.selectedId = withMeta.id;
    saveStore(store);
}
function clearStoredWallet() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_UNLOCK_KEY);
}
function isUnlocked() {
    return sessionStorage.getItem(SESSION_UNLOCK_KEY) === "1";
}
function markUnlocked() {
    sessionStorage.setItem(SESSION_UNLOCK_KEY, "1");
}
async function createNewWallet(password, derivationKey = "phantom") {
    const mnemonic = generateMnemonic(128);
    const selected = DERIVATION_PRESETS.find((d)=>d.key === derivationKey) || DERIVATION_PRESETS[0];
    const kp = await mnemonicToKeypairFromPath(mnemonic, selected.path);
    const enc = await encryptMnemonic(mnemonic, password);
    const record = {
        encMnemonic: enc,
        pubkey: kp.publicKey.toBase58(),
        createdAt: Date.now(),
        scheme: "password",
        derivationPath: selected.path
    };
    addWalletRecord(record);
    return {
        mnemonic,
        address: record.pubkey
    };
}
async function importWalletFromMnemonic(mnemonic, password, derivationKey = "phantom", bip39Passphrase) {
    const selected = DERIVATION_PRESETS.find((d)=>d.key === derivationKey) || DERIVATION_PRESETS[0];
    const kp = await mnemonicToKeypairFromPath(mnemonic, selected.path, bip39Passphrase);
    const enc = await encryptMnemonic(mnemonic, password);
    const record = {
        encMnemonic: enc,
        pubkey: kp.publicKey.toBase58(),
        createdAt: Date.now(),
        scheme: "password",
        derivationPath: selected.path,
        bip39PassphraseEnc: bip39Passphrase ? await encryptMnemonic(bip39Passphrase, password) : undefined
    };
    addWalletRecord(record);
    return {
        address: record.pubkey
    };
}
async function importWalletWithPath(mnemonic, password, path, bip39Passphrase) {
    const kp = await mnemonicToKeypairFromPath(mnemonic, path, bip39Passphrase);
    const enc = await encryptMnemonic(mnemonic, password);
    const record = {
        encMnemonic: enc,
        pubkey: kp.publicKey.toBase58(),
        createdAt: Date.now(),
        scheme: "password",
        derivationPath: path,
        bip39PassphraseEnc: bip39Passphrase ? await encryptMnemonic(bip39Passphrase, password) : undefined
    };
    addWalletRecord(record);
    return {
        address: record.pubkey
    };
}
// Import a raw CLI keypair (secret key bytes) and encrypt the secret with a password
async function importWalletFromSecretKey(secret, password) {
    const sk = secret instanceof Uint8Array ? secret : new Uint8Array(secret);
    const kp = _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .Keypair */ .RG.fromSecretKey(sk);
    const secretB64 = toB64(sk);
    const encSk = await encryptMnemonic(secretB64, password); // reuse encrypt helper
    // store an empty encMnemonic for type compatibility
    const fakeEnc = {
        algo: "AES-GCM",
        iv: toB64(new Uint8Array(12)),
        salt: toB64(new Uint8Array(16)),
        iterations: 0,
        cipherText: toB64(new Uint8Array(0))
    };
    const record = {
        encMnemonic: fakeEnc,
        encSecretKey: encSk,
        pubkey: kp.publicKey.toBase58(),
        createdAt: Date.now(),
        scheme: "raw"
    };
    addWalletRecord(record);
    return {
        address: record.pubkey
    };
}
async function unlockWithPassword(password) {
    const stored = getStoredWallet();
    if (!stored) throw new Error("No wallet on this device");
    let kp;
    if (stored.scheme === "raw" && stored.encSecretKey) {
        // decrypt raw secret key
        const skB64 = await decryptMnemonic(stored.encSecretKey, password);
        const bin = atob(skB64);
        const sk = new Uint8Array(bin.length);
        for(let i = 0; i < bin.length; i++)sk[i] = bin.charCodeAt(i);
        kp = _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .Keypair */ .RG.fromSecretKey(sk);
    } else {
        const mnemonic = await decryptMnemonic(stored.encMnemonic, password);
        let passphrase = undefined;
        if (stored.bip39PassphraseEnc) {
            try {
                passphrase = await decryptMnemonic(stored.bip39PassphraseEnc, password);
            } catch  {}
        }
        kp = stored.derivationPath ? await mnemonicToKeypairFromPath(mnemonic, stored.derivationPath, passphrase) : await mnemonicToKeypair(mnemonic, 0, passphrase);
    }
    markUnlocked();
    return kp;
}
async function changePassword(oldPassword, newPassword) {
    const aw = getActiveWallet();
    if (!aw) throw new Error("No active wallet");
    if (aw.scheme !== "password") throw new Error("Wallet does not use password");
    const mnemonic = await decryptMnemonic(aw.encMnemonic, oldPassword);
    const enc = await encryptMnemonic(mnemonic, newPassword);
    updateActiveWallet((w)=>{
        w.encMnemonic = enc;
        w.scheme = "password";
    });
}
async function setPasswordForDeviceWallet(newPassword) {
    const aw = getActiveWallet();
    if (!aw) throw new Error("No active wallet");
    if (aw.scheme !== "device") throw new Error("Wallet already has password");
    const mnemonic = await decryptWithDeviceSecret(aw.encMnemonic);
    const enc = await encryptMnemonic(mnemonic, newPassword);
    updateActiveWallet((w)=>{
        w.encMnemonic = enc;
        w.scheme = "password";
    });
}
const NET_KEY = "dope_network"; // 'mainnet' | 'devnet' | 'testnet'
function getSelectedNetwork() {
    try {
        if (false) {}
    } catch  {}
    return "mainnet";
}
function setSelectedNetwork(n) {
    try {
        localStorage.setItem(NET_KEY, n);
    } catch  {}
}
function getRpcEndpoint() {
    if (true) {
        return process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com";
    }
    const net = getSelectedNetwork();
    // web3.js Connection requires an absolute http/https URL in the browser
    const origin =  false ? 0 : "";
    return `${origin}/api/rpc?net=${net}`; // proxy through Next API with selected network
}
function getWsEndpoint() {
    // Disable WebSocket on the client to avoid rpc-websockets compatibility issues;
    // Connection will use HTTP with polling and fallbacks in subscribeBalance.
    if (false) {}
    return process.env.RPC_WS_URL || process.env.NEXT_PUBLIC_RPC_WS_URL;
}
function getConnection() {
    const http = getRpcEndpoint();
    const ws = getWsEndpoint();
    const commitment = "confirmed";
    if (ws) {
        return new _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .Connection */ .ew(http, {
            commitment,
            wsEndpoint: ws
        });
    }
    return new _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .Connection */ .ew(http, commitment);
}
const LAMPORTS_PER_DOPE = 1000000000; // align with Solana-style precision
function lamportsToDope(lamports) {
    return lamports / LAMPORTS_PER_DOPE;
}
// Read DOPE SPL token balance (using parsed token accounts)
async function getDopeTokenBalance(ownerAddress) {
    try {
        const conn = getConnection();
        const owner = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .PublicKey */ .nh(ownerAddress);
        const mint = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .PublicKey */ .nh(_swap__WEBPACK_IMPORTED_MODULE_4__/* .DOPE_MINT */ .Fz);
        const parsed = await conn.getParsedTokenAccountsByOwner(owner, {
            mint
        });
        if (!parsed || parsed.value.length === 0) return 0;
        const acc = parsed.value[0].account.data;
        const ui = acc?.parsed?.info?.tokenAmount?.uiAmount;
        return typeof ui === "number" ? ui : 0;
    } catch  {
        return 0;
    }
}
async function getSolBalance(pubkey) {
    const conn = getConnection();
    try {
        const lamports = await conn.getBalance(new _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .PublicKey */ .nh(pubkey));
        return lamportsToDope(lamports);
    } catch  {
        return 0;
    }
}
async function sendSol(from, toAddress, amountSol) {
    const conn = getConnection();
    const tx = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .Transaction */ .YW().add(_solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .SystemProgram */ .yc.transfer({
        fromPubkey: from.publicKey,
        toPubkey: new _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .PublicKey */ .nh(toAddress),
        lamports: Math.round(amountSol * LAMPORTS_PER_DOPE)
    }));
    const sig = await conn.sendTransaction(tx, [
        from
    ]);
    return sig;
}
function subscribeBalance(pubkey, cb) {
    const conn = getConnection();
    try {
        const id = conn.onAccountChange(new _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .PublicKey */ .nh(pubkey), (accInfo)=>{
            cb(lamportsToDope(accInfo.lamports));
        }, "confirmed");
        return ()=>{
            try {
                conn.removeAccountChangeListener(id);
            } catch  {}
        };
    } catch  {
        return ()=>{};
    }
}
async function getRecentTransactions(address, limit = 10) {
    const conn = getConnection();
    const pk = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .PublicKey */ .nh(address);
    let sigs = [];
    try {
        sigs = await conn.getSignaturesForAddress(pk, {
            limit
        });
    } catch  {
        return [];
    }
    if (sigs.length === 0) return [];
    let parsed = [];
    try {
        parsed = await conn.getParsedTransactions(sigs.map((s)=>s.signature), {
            maxSupportedTransactionVersion: 0
        });
    } catch  {
        return [];
    }
    const results = [];
    for(let i = 0; i < sigs.length; i++){
        const sig = sigs[i];
        const tx = parsed[i];
        let change = null;
        let status = "unknown";
        let time = sig.blockTime || null;
        if (tx && tx.meta) {
            const accountIndex = tx.transaction.message.accountKeys.findIndex((k)=>("pubkey" in k ? k.pubkey.toBase58?.() : k.toBase58?.()) === address);
            if (accountIndex >= 0 && tx.meta.preBalances && tx.meta.postBalances) {
                const pre = tx.meta.preBalances[accountIndex];
                const post = tx.meta.postBalances[accountIndex];
                change = lamportsToDope(post - pre);
            }
            const err = tx.meta.err;
            status = err ? "error" : "success";
            if (time == null && tx.blockTime) time = tx.blockTime;
        }
        results.push({
            signature: sig.signature,
            slot: sig.slot,
            time,
            change,
            status
        });
    }
    return results;
}
// ---- Encrypted chat helpers (MVP on-chain via memo) ----
const DOPECHAT_PREFIX_PUB = "dopechat:pub:";
const DOPECHAT_PREFIX_MSG = "dopechat:msg:";
const MEMO_PROGRAM_ID = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .PublicKey */ .nh("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
async function sha256Bytes(input) {
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(input));
    return new Uint8Array(buf);
}
async function deriveChatKeypairFromMnemonic(mnemonic) {
    const seed = await sha256Bytes("dope-chat-v1|" + mnemonic);
    const sk = seed.slice(0, 32);
    const kp = tweetnacl__WEBPACK_IMPORTED_MODULE_1___default().box.keyPair.fromSecretKey(sk);
    return kp; // {publicKey: Uint8Array, secretKey: Uint8Array}
}
async function getMnemonicForActiveWallet(password) {
    const stored = getStoredWallet();
    if (!stored) throw new Error("No wallet on this device");
    if (stored.scheme === "device") {
        // device-encrypted
        // @ts-ignore - use internal helper
        return await decryptWithDeviceSecret(stored.encMnemonic);
    }
    if (stored.scheme === "password") {
        if (!password) throw new Error("Password required for chat");
        return await decryptMnemonic(stored.encMnemonic, password);
    }
    throw new Error("Unsupported wallet scheme");
}
// Helper to fetch the mnemonic and derived secret key (base64) for the active wallet
async function getActiveWalletSecrets(password) {
    const mnemonic = await getMnemonicForActiveWallet(password);
    const kp = await mnemonicToKeypair(mnemonic);
    // Convert secretKey (Uint8Array) to base64
    let s = "";
    const u8 = kp.secretKey;
    for(let i = 0; i < u8.length; i++)s += String.fromCharCode(u8[i]);
    const secretKeyB64 = btoa(s);
    return {
        mnemonic,
        secretKeyB64
    };
}
function buildMemoInstruction(text) {
    return new _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .TransactionInstruction */ .Sl({
        keys: [],
        programId: MEMO_PROGRAM_ID,
        data: buffer__WEBPACK_IMPORTED_MODULE_5__.Buffer.from(text, "utf8")
    });
}
async function publishChatKey(from, chatPubB64) {
    const conn = getConnection();
    const memo = `${DOPECHAT_PREFIX_PUB}${chatPubB64}`;
    const tx = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .Transaction */ .YW().add(buildMemoInstruction(memo));
    return await conn.sendTransaction(tx, [
        from
    ]);
}
async function getPublishedChatKeyB64(address) {
    const conn = getConnection();
    const pk = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .PublicKey */ .nh(address);
    const sigs = await conn.getSignaturesForAddress(pk, {
        limit: 50
    });
    if (sigs.length === 0) return null;
    const parsed = await conn.getParsedTransactions(sigs.map((s)=>s.signature), {
        maxSupportedTransactionVersion: 0
    });
    for(let i = 0; i < parsed.length; i++){
        const tx = parsed[i];
        if (!tx) continue;
        // scan instructions for memo content
        const ix = tx.transaction.message.instructions || [];
        for (const ins of ix){
            // parsed form may include 'program' or 'programId'
            const pid = ins.programId || undefined;
            const program = ins.program;
            const dataField = ins.parsed?.params?.[0] || ins.data || undefined;
            // Fallback: log messages often contain memo text
            if (program === "spl-memo") {
                const memoText = ins.parsed || dataField;
                if (typeof memoText === "string" && memoText.startsWith(DOPECHAT_PREFIX_PUB)) {
                    return memoText.slice(DOPECHAT_PREFIX_PUB.length);
                }
            }
            if (pid && pid.toBase58 && pid.toBase58() === MEMO_PROGRAM_ID.toBase58()) {
            // data is base58 in parsed form; skip for simplicity
            // rely on logs as better source
            }
        }
        const logs = tx.meta?.logMessages || undefined;
        if (logs) {
            for (const l of logs){
                const idx = l.indexOf(DOPECHAT_PREFIX_PUB);
                if (idx >= 0) {
                    return l.slice(idx + DOPECHAT_PREFIX_PUB.length).trim();
                }
            }
        }
    }
    return null;
}
async function sendEncryptedChatMessage(fromWallet, senderChatSk, senderChatPkB64, recipientWalletAddress, plaintext) {
    if (plaintext.length > 220) throw new Error("Message too long (max 220 chars)");
    const recipientChatB64 = await getPublishedChatKeyB64(recipientWalletAddress);
    if (!recipientChatB64) throw new Error("Recipient has not published chat key");
    const recipientChatPk = fromB64(recipientChatB64);
    const nonce = crypto.getRandomValues(new Uint8Array(24));
    const msgBytes = enc.encode(plaintext);
    const box = tweetnacl__WEBPACK_IMPORTED_MODULE_1___default().box(msgBytes, nonce, recipientChatPk, senderChatSk);
    const payload = {
        v: 1,
        to: recipientChatB64,
        from: senderChatPkB64,
        nonce: toB64(nonce),
        box: toB64(box)
    };
    const payloadB64 = btoa(JSON.stringify(payload));
    const memo = `${DOPECHAT_PREFIX_MSG}${payloadB64}`;
    const conn = getConnection();
    const tx = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .Transaction */ .YW().add(buildMemoInstruction(memo));
    const sig = await conn.sendTransaction(tx, [
        fromWallet
    ]);
    return sig;
}
async function getConversation(myAddress, theirAddress, myChatSk, myChatPkB64, limit = 40) {
    const conn = getConnection();
    const a = await conn.getSignaturesForAddress(new _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .PublicKey */ .nh(myAddress), {
        limit
    });
    const b = await conn.getSignaturesForAddress(new _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__/* .PublicKey */ .nh(theirAddress), {
        limit
    });
    const sigSet = new Map();
    for (const s of [
        ...a,
        ...b
    ])sigSet.set(s.signature, s.slot);
    const sigs = Array.from(sigSet.keys());
    if (sigs.length === 0) return [];
    const parsed = await conn.getParsedTransactions(sigs, {
        maxSupportedTransactionVersion: 0
    });
    const out = [];
    for(let i = 0; i < parsed.length; i++){
        const tx = parsed[i];
        if (!tx) continue;
        const logs = tx.meta?.logMessages || undefined;
        let found = null;
        if (logs) {
            for (const l of logs){
                const idx = l.indexOf(DOPECHAT_PREFIX_MSG);
                if (idx >= 0) {
                    found = l.slice(idx + DOPECHAT_PREFIX_MSG.length).trim();
                    break;
                }
            }
        }
        if (!found) continue;
        try {
            const payload = JSON.parse(atob(found));
            if (!payload || payload.to !== myChatPkB64) continue;
            const nonce = fromB64(payload.nonce);
            const box = fromB64(payload.box);
            // Try decrypt with my secret; sender can be anyone with payload.from
            const senderPk = fromB64(payload.from);
            const plain = tweetnacl__WEBPACK_IMPORTED_MODULE_1___default().box.open(box, nonce, senderPk, myChatSk);
            if (!plain) continue;
            const text = dec.decode(plain);
            const fromThem = payload.from !== myChatPkB64;
            out.push({
                id: tx.transaction.signatures[0],
                from: fromThem ? "them" : "me",
                text,
                time: tx.blockTime || null
            });
        } catch  {}
    }
    // sort by time asc
    out.sort((x, y)=>(x.time || 0) - (y.time || 0));
    return out;
}
async function isBiometricAvailable() {
    try {
        // @ts-ignore
        if (!window.PublicKeyCredential) return false;
        // @ts-ignore
        const supported = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.();
        return !!supported;
    } catch  {
        return false;
    }
}
async function biometricGate(credentialId) {
    try {
        // @ts-ignore
        if (!window.PublicKeyCredential) return false;
        const challenge = crypto.getRandomValues(new Uint8Array(32));
        const pubKey = {
            challenge,
            userVerification: "required"
        };
        if (credentialId) {
            pubKey.allowCredentials = [
                {
                    id: credentialId,
                    type: "public-key"
                }
            ];
        }
        const cred = await navigator.credentials.get({
            publicKey: pubKey
        });
        return !!cred;
    } catch  {
        return false;
    }
}
// Device-secret helpers (passwordless local encryption)
function ensureDeviceSecret() {
    let b64 = localStorage.getItem(DEVICE_SECRET_KEY);
    if (!b64) {
        const bytes = crypto.getRandomValues(new Uint8Array(32));
        b64 = toB64(bytes);
        localStorage.setItem(DEVICE_SECRET_KEY, b64);
    }
    return fromB64(b64);
}
async function encryptWithDeviceSecret(plaintext) {
    const secret = ensureDeviceSecret();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await crypto.subtle.importKey("raw", abFromU8(secret), "AES-GCM", false, [
        "encrypt"
    ]);
    const ct = await crypto.subtle.encrypt({
        name: "AES-GCM",
        iv: abFromU8(iv)
    }, key, abFromU8(enc.encode(plaintext)));
    return {
        algo: "AES-GCM",
        iv: toB64(iv),
        salt: toB64(new Uint8Array(0)),
        iterations: 0,
        cipherText: toB64(ct)
    };
}
async function decryptWithDeviceSecret(ed) {
    const secret = ensureDeviceSecret();
    const iv = fromB64(ed.iv);
    const key = await crypto.subtle.importKey("raw", abFromU8(secret), "AES-GCM", false, [
        "decrypt"
    ]);
    const pt = await crypto.subtle.decrypt({
        name: "AES-GCM",
        iv: abFromU8(iv)
    }, key, abFromU8(fromB64(ed.cipherText)));
    return dec.decode(pt);
}
async function createWalletImmediateSave() {
    const mnemonic = generateMnemonic(128);
    const defaultPath = DERIVATION_PRESETS[0].path; // phantom/backpack
    const kp = await mnemonicToKeypairFromPath(mnemonic, defaultPath);
    const enc = await encryptWithDeviceSecret(mnemonic);
    const record = {
        encMnemonic: enc,
        pubkey: kp.publicKey.toBase58(),
        createdAt: Date.now(),
        scheme: "device",
        derivationPath: defaultPath
    };
    addWalletRecord(record);
    markUnlocked();
    return {
        mnemonic,
        address: record.pubkey,
        keypair: kp
    };
}
async function unlockWithDevice() {
    const stored = getStoredWallet();
    if (!stored) throw new Error("No wallet on this device");
    const mnemonic = await decryptWithDeviceSecret(stored.encMnemonic);
    const kp = stored.derivationPath ? await mnemonicToKeypairFromPath(mnemonic, stored.derivationPath) : await mnemonicToKeypair(mnemonic);
    markUnlocked();
    return kp;
}


/***/ }),

/***/ 9710:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $$typeof: () => (/* binding */ $$typeof),
/* harmony export */   __esModule: () => (/* binding */ __esModule),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var next_dist_build_webpack_loaders_next_flight_loader_module_proxy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1363);

const proxy = (0,next_dist_build_webpack_loaders_next_flight_loader_module_proxy__WEBPACK_IMPORTED_MODULE_0__.createProxy)(String.raw`C:\Users\thisu\dope\app\error.tsx`)

// Accessing the __esModule property and exporting $$typeof are required here.
// The __esModule getter forces the proxy target to create the default export
// and the $$typeof value is for rendering logic to determine if the module
// is a client boundary.
const { __esModule, $$typeof } = proxy;
const __default__ = proxy.default;


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__default__);

/***/ }),

/***/ 1921:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $$typeof: () => (/* binding */ $$typeof),
/* harmony export */   __esModule: () => (/* binding */ __esModule),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var next_dist_build_webpack_loaders_next_flight_loader_module_proxy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1363);

const proxy = (0,next_dist_build_webpack_loaders_next_flight_loader_module_proxy__WEBPACK_IMPORTED_MODULE_0__.createProxy)(String.raw`C:\Users\thisu\dope\app\layout.tsx`)

// Accessing the __esModule property and exporting $$typeof are required here.
// The __esModule getter forces the proxy target to create the default export
// and the $$typeof value is for rendering logic to determine if the module
// is a client boundary.
const { __esModule, $$typeof } = proxy;
const __default__ = proxy.default;


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__default__);

/***/ }),

/***/ 2307:
/***/ (() => {



/***/ })

};
;