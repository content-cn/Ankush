module.exports = [
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[project]/app/api/login/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "POST",
    ()=>POST,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/session.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const runtime = "nodejs";
const GENERIC_ERROR = "Invalid phone number or OTP.";
/** Constant-time string compare, safe for unequal lengths (no early exit on length). */ function timingSafeStringEqual(a, b) {
    const bufA = Buffer.from(a, "utf-8");
    const bufB = Buffer.from(b, "utf-8");
    const length = Math.max(bufA.length, bufB.length, 1);
    const paddedA = Buffer.concat([
        bufA
    ], length);
    const paddedB = Buffer.concat([
        bufB
    ], length);
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].timingSafeEqual(paddedA, paddedB) && bufA.length === bufB.length;
}
async function POST(request) {
    const expectedOtp = process.env.FOODLY_DEMO_OTP;
    if (!expectedOtp || !process.env.SESSION_SECRET) {
        console.error("Login is not configured: missing FOODLY_DEMO_OTP and/or SESSION_SECRET.");
        return Response.json({
            error: "Login is not configured."
        }, {
            status: 500
        });
    }
    let body;
    try {
        body = await request.json();
    } catch  {
        return Response.json({
            error: "Invalid JSON body."
        }, {
            status: 400
        });
    }
    const record = body ?? {};
    const phone = typeof record.phone === "string" ? record.phone.trim() : "";
    const otp = typeof record.otp === "string" ? record.otp.trim() : "";
    // Demo mode: any phone number can log in with this single fixed OTP —
    // there's no real SMS provider wired up. The phone must still match a
    // seeded customer below, so only known demo accounts can sign in.
    if (!phone || !otp || !timingSafeStringEqual(otp, expectedOtp)) {
        return Response.json({
            error: GENERIC_ERROR
        }, {
            status: 401
        });
    }
    let customers;
    try {
        customers = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("select id, name, phone from customers where phone = $1", [
            phone
        ]);
    } catch (error) {
        console.error("Login lookup failed:", error);
        return Response.json({
            error: "Login is temporarily unavailable."
        }, {
            status: 502
        });
    }
    const customer = customers[0];
    if (!customer) {
        return Response.json({
            error: GENERIC_ERROR
        }, {
            status: 401
        });
    }
    try {
        const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSessionToken"])(customer);
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        cookieStore.set(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SESSION_COOKIE_NAME"], token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SESSION_MAX_AGE_SECONDS"]
        });
    } catch (error) {
        console.error("Failed to create session:", error);
        return Response.json({
            error: "Login is temporarily unavailable."
        }, {
            status: 500
        });
    }
    return Response.json({
        ok: true
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "query",
    ()=>query,
    "resolveConnectionString",
    ()=>resolveConnectionString
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
// Vercel's dashboard names the injected connection string differently
// depending on how Postgres storage was provisioned — check the project's
// Storage tab / environment variables to confirm which one is actually set.
// The STORAGE_-prefixed names are what Vercel's Supabase marketplace
// integration injects when a custom env var prefix ("STORAGE") is used.
const CONNECTION_STRING_ENV_VARS = [
    "POSTGRES_URL",
    "DATABASE_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL_NON_POOLING",
    "STORAGE_POSTGRES_URL",
    "STORAGE_POSTGRES_PRISMA_URL",
    "STORAGE_POSTGRES_URL_NON_POOLING"
];
// pg builds its final config as `Object.assign({}, config, parse(connectionString))`
// (see pg/lib/connection-parameters.js) — the *parsed connection string*
// wins over an `ssl` option passed alongside it. So a Pool config like
// `{ connectionString, ssl: { rejectUnauthorized: false } }` silently drops
// that `ssl` override whenever the string itself carries a `sslmode` param,
// which managed providers (Supabase, Neon, ...) always include. Those modes
// (`require`, `prefer`, `verify-ca`) require full chain verification, which
// fails against Node's default CA bundle with "self-signed certificate in
// certificate chain". `no-verify` is the one mode pg-connection-string maps
// directly to `rejectUnauthorized: false`, so force it in the string itself
// instead of fighting the merge order.
function withNoVerifySsl(connectionString) {
    if (connectionString.includes("localhost") || connectionString.includes("127.0.0.1")) {
        return connectionString;
    }
    if (/[?&]sslmode=/.test(connectionString)) {
        return connectionString.replace(/([?&])sslmode=[^&]*/, "$1sslmode=no-verify");
    }
    const separator = connectionString.includes("?") ? "&" : "?";
    return `${connectionString}${separator}sslmode=no-verify`;
}
function resolveConnectionString() {
    for (const name of CONNECTION_STRING_ENV_VARS){
        const value = process.env[name];
        if (value) return withNoVerifySsl(value);
    }
    throw new Error(`No database connection string found. Set one of: ${CONNECTION_STRING_ENV_VARS.join(", ")}.`);
}
let pool;
function getPool() {
    if (!pool) {
        pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["Pool"]({
            connectionString: resolveConnectionString()
        });
    }
    return pool;
}
async function query(text, params) {
    const result = await getPool().query(text, params);
    return result.rows;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/session.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SESSION_COOKIE_NAME",
    ()=>SESSION_COOKIE_NAME,
    "SESSION_MAX_AGE_SECONDS",
    ()=>SESSION_MAX_AGE_SECONDS,
    "createSessionToken",
    ()=>createSessionToken,
    "getSession",
    ()=>getSession
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
const SESSION_COOKIE_NAME = "foodly_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 2; // 2 hours
function getSessionSecret() {
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
        throw new Error("Missing SESSION_SECRET environment variable.");
    }
    return secret;
}
function sign(encodedPayload) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHmac("sha256", getSessionSecret()).update(encodedPayload).digest("base64url");
}
function createSessionToken(customer) {
    const payload = {
        customerId: customer.id,
        phone: customer.phone,
        name: customer.name,
        exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
    };
    const encodedPayload = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
    const signature = sign(encodedPayload);
    return `${encodedPayload}.${signature}`;
}
function verifySessionToken(token) {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [encodedPayload, signature] = parts;
    const expectedSignature = sign(encodedPayload);
    const provided = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);
    if (provided.length !== expected.length || !__TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].timingSafeEqual(provided, expected)) {
        return null;
    }
    try {
        const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8"));
        if (typeof payload.customerId !== "number" || typeof payload.phone !== "string" || typeof payload.name !== "string" || typeof payload.exp !== "number") {
            return null;
        }
        if (payload.exp < Math.floor(Date.now() / 1000)) return null;
        return payload;
    } catch  {
        return null;
    }
}
async function getSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = verifySessionToken(token);
    if (!payload) return null;
    return {
        customerId: payload.customerId,
        phone: payload.phone,
        name: payload.name
    };
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__114889f._.js.map