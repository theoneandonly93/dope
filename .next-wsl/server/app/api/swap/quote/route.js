"use strict";
(() => {
var exports = {};
exports.id = 717;
exports.ids = [717];
exports.modules = {

/***/ 2037:
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ 7865:
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

// NAMESPACE OBJECT: ./app/api/swap/quote/route.ts
var route_namespaceObject = {};
__webpack_require__.r(route_namespaceObject);
__webpack_require__.d(route_namespaceObject, {
  GET: () => (GET),
  dynamic: () => (dynamic)
});

// EXTERNAL MODULE: ./node_modules/next/dist/server/node-polyfill-headers.js
var node_polyfill_headers = __webpack_require__(2394);
// EXTERNAL MODULE: ./node_modules/next/dist/server/future/route-modules/app-route/module.js
var app_route_module = __webpack_require__(9692);
// EXTERNAL MODULE: ./node_modules/next/dist/server/future/route-kind.js
var route_kind = __webpack_require__(9513);
;// CONCATENATED MODULE: ./app/api/swap/quote/route.ts
const dynamic = "force-dynamic";
async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const inputMint = searchParams.get("in");
        const outputMint = searchParams.get("out");
        const amountStr = searchParams.get("amount") || "0";
        const amount = Number(amountStr);
        if (!inputMint || !outputMint) return Response.json({
            error: "in/out required"
        }, {
            status: 400
        });
        if (!(amount > 0)) return Response.json({
            error: "amount required"
        }, {
            status: 400
        });
        const url = `https://quote-api.jup.ag/v6/quote?inputMint=${encodeURIComponent(inputMint)}&outputMint=${encodeURIComponent(outputMint)}&amount=${encodeURIComponent(String(Math.floor(amount * 10 ** 9)))}`;
        const r = await fetch(url, {
            cache: "no-store"
        });
        const j = await r.json();
        if (!r.ok) return Response.json({
            error: j?.error || `HTTP ${r.status}`
        }, {
            status: r.status
        });
        const best = Array.isArray(j?.data) && j.data.length > 0 ? j.data[0] : null;
        return Response.json(best || {
            ok: true,
            empty: true
        });
    } catch (e) {
        return Response.json({
            error: e?.message || "quote failed"
        }, {
            status: 500
        });
    }
}

;// CONCATENATED MODULE: ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?page=%2Fapi%2Fswap%2Fquote%2Froute&name=app%2Fapi%2Fswap%2Fquote%2Froute&pagePath=private-next-app-dir%2Fapi%2Fswap%2Fquote%2Froute.ts&appDir=C%3A%5CUsers%5Cthisu%5Cdope%5Capp&appPaths=%2Fapi%2Fswap%2Fquote%2Froute&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!

// @ts-ignore this need to be imported from next/dist to be external


// @ts-expect-error - replaced by webpack/turbopack loader

const AppRouteRouteModule = app_route_module.AppRouteRouteModule;
// We inject the nextConfigOutput here so that we can use them in the route
// module.
const nextConfigOutput = ""
const routeModule = new AppRouteRouteModule({
    definition: {
        kind: route_kind.RouteKind.APP_ROUTE,
        page: "/api/swap/quote/route",
        pathname: "/api/swap/quote",
        filename: "route",
        bundlePath: "app/api/swap/quote/route"
    },
    resolvedPagePath: "C:\\Users\\thisu\\dope\\app\\api\\swap\\quote\\route.ts",
    nextConfigOutput,
    userland: route_namespaceObject
});
// Pull out the exports that we need to expose from the module. This should
// be eliminated when we've moved the other routes to the new format. These
// are used to hook into the route.
const { requestAsyncStorage , staticGenerationAsyncStorage , serverHooks , headerHooks , staticGenerationBailout  } = routeModule;
const originalPathname = "/api/swap/quote/route";


//# sourceMappingURL=app-route.js.map

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [478,501], () => (__webpack_exec__(7865)));
module.exports = __webpack_exports__;

})();