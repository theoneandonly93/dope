"use strict";
(() => {
var exports = {};
exports.id = 479;
exports.ids = [479];
exports.modules = {

/***/ 2037:
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ 535:
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

// NAMESPACE OBJECT: ./app/api/rpc/route.ts
var route_namespaceObject = {};
__webpack_require__.r(route_namespaceObject);
__webpack_require__.d(route_namespaceObject, {
  GET: () => (GET),
  POST: () => (POST),
  dynamic: () => (dynamic)
});

// EXTERNAL MODULE: ./node_modules/next/dist/server/node-polyfill-headers.js
var node_polyfill_headers = __webpack_require__(2394);
// EXTERNAL MODULE: ./node_modules/next/dist/server/future/route-modules/app-route/module.js
var app_route_module = __webpack_require__(9692);
// EXTERNAL MODULE: ./node_modules/next/dist/server/future/route-kind.js
var route_kind = __webpack_require__(9513);
;// CONCATENATED MODULE: ./app/api/rpc/route.ts
const dynamic = "force-dynamic";
function endpointFromNet(net) {
    const n = (net || "").toLowerCase();
    if (n === "devnet") return "https://api.devnet.solana.com";
    if (n === "testnet") return "https://api.testnet.solana.com";
    // mainnet (default) honors env override
    return process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com";
}
function extraHeaders() {
    try {
        return JSON.parse(process.env.RPC_HEADERS || "{}");
    } catch  {
        return {};
    }
}
async function POST(req) {
    const url = new URL(req.url);
    const net = url.searchParams.get("net");
    const rpc = endpointFromNet(net);
    const extra = extraHeaders();
    try {
        const body = await req.text();
        const upstream = await fetch(rpc, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                ...extra
            },
            body,
            cache: "no-store",
            redirect: "follow"
        });
        const headers = new Headers({
            "content-type": upstream.headers.get("content-type") || "application/json"
        });
        return new Response(upstream.body, {
            status: upstream.status,
            headers
        });
    } catch (e) {
        return Response.json({
            error: e?.message || "RPC proxy error"
        }, {
            status: 502
        });
    }
}
async function GET(req) {
    const url = new URL(req.url);
    const net = url.searchParams.get("net");
    return Response.json({
        ok: true,
        rpc: endpointFromNet(net)
    });
}

;// CONCATENATED MODULE: ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?page=%2Fapi%2Frpc%2Froute&name=app%2Fapi%2Frpc%2Froute&pagePath=private-next-app-dir%2Fapi%2Frpc%2Froute.ts&appDir=C%3A%5CUsers%5Cthisu%5Cdope%5Capp&appPaths=%2Fapi%2Frpc%2Froute&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!

// @ts-ignore this need to be imported from next/dist to be external


// @ts-expect-error - replaced by webpack/turbopack loader

const AppRouteRouteModule = app_route_module.AppRouteRouteModule;
// We inject the nextConfigOutput here so that we can use them in the route
// module.
const nextConfigOutput = ""
const routeModule = new AppRouteRouteModule({
    definition: {
        kind: route_kind.RouteKind.APP_ROUTE,
        page: "/api/rpc/route",
        pathname: "/api/rpc",
        filename: "route",
        bundlePath: "app/api/rpc/route"
    },
    resolvedPagePath: "C:\\Users\\thisu\\dope\\app\\api\\rpc\\route.ts",
    nextConfigOutput,
    userland: route_namespaceObject
});
// Pull out the exports that we need to expose from the module. This should
// be eliminated when we've moved the other routes to the new format. These
// are used to hook into the route.
const { requestAsyncStorage , staticGenerationAsyncStorage , serverHooks , headerHooks , staticGenerationBailout  } = routeModule;
const originalPathname = "/api/rpc/route";


//# sourceMappingURL=app-route.js.map

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [478,501], () => (__webpack_exec__(535)));
module.exports = __webpack_exports__;

})();