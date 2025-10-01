"use strict";
(() => {
var exports = {};
exports.id = 298;
exports.ids = [298];
exports.modules = {

/***/ 2037:
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ 8178:
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

// NAMESPACE OBJECT: ./app/api/card/spend/route.ts
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
// EXTERNAL MODULE: ./backend/card-service.ts + 1 modules
var card_service = __webpack_require__(3212);
;// CONCATENATED MODULE: ./app/api/card/spend/route.ts
const dynamic = "force-dynamic";

async function POST(req) {
    try {
        const body = await req.json();
        const pubkey = String(body?.pubkey || "");
        const amount = Number(body?.amount || 0);
        const desc = body?.desc ? String(body.desc) : undefined;
        if (!pubkey) return Response.json({
            error: "pubkey required"
        }, {
            status: 400
        });
        if (!Number.isFinite(amount) || amount <= 0) return Response.json({
            error: "invalid amount"
        }, {
            status: 400
        });
        const res = await (0,card_service/* spendFromCard */.YT)(pubkey, amount, desc);
        return Response.json({
            ok: true,
            ...res
        });
    } catch (e) {
        return Response.json({
            error: e?.message || "spend failed"
        }, {
            status: 500
        });
    }
}

;// CONCATENATED MODULE: ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?page=%2Fapi%2Fcard%2Fspend%2Froute&name=app%2Fapi%2Fcard%2Fspend%2Froute&pagePath=private-next-app-dir%2Fapi%2Fcard%2Fspend%2Froute.ts&appDir=C%3A%5CUsers%5Cthisu%5Cdope%5Capp&appPaths=%2Fapi%2Fcard%2Fspend%2Froute&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!

// @ts-ignore this need to be imported from next/dist to be external


// @ts-expect-error - replaced by webpack/turbopack loader

const AppRouteRouteModule = app_route_module.AppRouteRouteModule;
// We inject the nextConfigOutput here so that we can use them in the route
// module.
const nextConfigOutput = ""
const routeModule = new AppRouteRouteModule({
    definition: {
        kind: route_kind.RouteKind.APP_ROUTE,
        page: "/api/card/spend/route",
        pathname: "/api/card/spend",
        filename: "route",
        bundlePath: "app/api/card/spend/route"
    },
    resolvedPagePath: "C:\\Users\\thisu\\dope\\app\\api\\card\\spend\\route.ts",
    nextConfigOutput,
    userland: route_namespaceObject
});
// Pull out the exports that we need to expose from the module. This should
// be eliminated when we've moved the other routes to the new format. These
// are used to hook into the route.
const { requestAsyncStorage , staticGenerationAsyncStorage , serverHooks , headerHooks , staticGenerationBailout  } = routeModule;
const originalPathname = "/api/card/spend/route";


//# sourceMappingURL=app-route.js.map

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [478,501,212], () => (__webpack_exec__(8178)));
module.exports = __webpack_exports__;

})();