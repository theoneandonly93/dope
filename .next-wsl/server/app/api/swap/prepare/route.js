"use strict";
(() => {
var exports = {};
exports.id = 151;
exports.ids = [151];
exports.modules = {

/***/ 2037:
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ 6374:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  headerHooks: () => (/* binding */ headerHooks),
  originalPathname: () => (/* binding */ originalPathname),
  requestAsyncStorage: () => (/* binding */ requestAsyncStorage),
  routeModule: () => (/* binding */ routeModule),
  serverHooks: () => (/* binding */ serverHooks),
  staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),
  staticGenerationBailout: () => (/* binding */ staticGenerationBailout)
});

// NAMESPACE OBJECT: ./app/api/swap/prepare/route.ts
var route_namespaceObject = {};
__webpack_require__.r(route_namespaceObject);
__webpack_require__.d(route_namespaceObject, {
  POST: () => (POST),
  dynamic: () => (dynamic)
});

// EXTERNAL MODULE: ./node_modules/next/dist/server/node-polyfill-headers.js
var node_polyfill_headers = __webpack_require__(2394);
// EXTERNAL MODULE: ./node_modules/next/dist/server/future/route-modules/app-route/module.js
var app_route_module = __webpack_require__(9692);
// EXTERNAL MODULE: ./node_modules/next/dist/server/future/route-kind.js
var route_kind = __webpack_require__(9513);
;// CONCATENATED MODULE: ./app/api/swap/prepare/route.ts
const dynamic = "force-dynamic";
const DECIMALS = {
    // Common mints
    So11111111111111111111111111111111111111112: 9,
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 6
};
function getDecimals(mint) {
    return DECIMALS[mint] ?? 9; // default to 9 if unknown
}
async function POST(req) {
    try {
        const b = await req.json();
        const { inputMint, outputMint, amount, userPublicKey } = b;
        const slippageBps = typeof b.slippageBps === "number" ? b.slippageBps : 50;
        if (!inputMint || !outputMint || !userPublicKey) return Response.json({
            error: "inputMint/outputMint/userPublicKey required"
        }, {
            status: 400
        });
        if (!(amount > 0)) return Response.json({
            error: "amount required"
        }, {
            status: 400
        });
        const inDec = getDecimals(inputMint);
        const ui = Math.max(0, amount);
        const atomic = Math.floor(ui * Math.pow(10, inDec));
        // 1) Quote
        const qUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${encodeURIComponent(inputMint)}&outputMint=${encodeURIComponent(outputMint)}&amount=${atomic}&slippageBps=${slippageBps}`;
        const qr = await fetch(qUrl, {
            cache: "no-store"
        });
        const quote = await qr.json();
        if (!qr.ok || !quote?.data || !Array.isArray(quote.data) || quote.data.length === 0) {
            return Response.json({
                error: quote?.error || "no route found"
            }, {
                status: 400
            });
        }
        const route = quote.data[0];
        // 2) Swap transaction
        const sr = await fetch("https://quote-api.jup.ag/v6/swap", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                quoteResponse: route,
                userPublicKey,
                wrapAndUnwrapSol: true,
                dynamicComputeUnitLimit: true,
                prioritizationFeeLamports: 0
            })
        });
        const swap = await sr.json();
        if (!sr.ok) return Response.json({
            error: swap?.error || `swap failed ${sr.status}`
        }, {
            status: 400
        });
        const tx = swap?.swapTransaction;
        if (!tx) return Response.json({
            error: "no swapTransaction"
        }, {
            status: 400
        });
        return Response.json({
            swapTransaction: tx,
            route
        });
    } catch (e) {
        return Response.json({
            error: e?.message || "prepare failed"
        }, {
            status: 500
        });
    }
}

;// CONCATENATED MODULE: ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?page=%2Fapi%2Fswap%2Fprepare%2Froute&name=app%2Fapi%2Fswap%2Fprepare%2Froute&pagePath=private-next-app-dir%2Fapi%2Fswap%2Fprepare%2Froute.ts&appDir=C%3A%5CUsers%5Cthisu%5Cdope%5Capp&appPaths=%2Fapi%2Fswap%2Fprepare%2Froute&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!

// @ts-ignore this need to be imported from next/dist to be external


// @ts-expect-error - replaced by webpack/turbopack loader

const AppRouteRouteModule = app_route_module.AppRouteRouteModule;
// We inject the nextConfigOutput here so that we can use them in the route
// module.
const nextConfigOutput = ""
const routeModule = new AppRouteRouteModule({
    definition: {
        kind: route_kind.RouteKind.APP_ROUTE,
        page: "/api/swap/prepare/route",
        pathname: "/api/swap/prepare",
        filename: "route",
        bundlePath: "app/api/swap/prepare/route"
    },
    resolvedPagePath: "C:\\Users\\thisu\\dope\\app\\api\\swap\\prepare\\route.ts",
    nextConfigOutput,
    userland: route_namespaceObject
});
// Pull out the exports that we need to expose from the module. This should
// be eliminated when we've moved the other routes to the new format. These
// are used to hook into the route.
const { requestAsyncStorage , staticGenerationAsyncStorage , serverHooks , headerHooks , staticGenerationBailout  } = routeModule;
const originalPathname = "/api/swap/prepare/route";


//# sourceMappingURL=app-route.js.map

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [478,501], () => (__webpack_exec__(6374)));
module.exports = __webpack_exports__;

})();