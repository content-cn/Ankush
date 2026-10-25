(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push(["chunks/[root-of-the-server]__0qp7_di._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[project]/instrumentation.ts [instrumentation-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "langfuseSpanProcessor",
    ()=>langfuseSpanProcessor,
    "register",
    ()=>register
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langfuse$2f$otel$2f$dist$2f$index$2e$mjs__$5b$instrumentation$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langfuse/otel/dist/index.mjs [instrumentation-edge] (ecmascript)");
;
;
const hasLangfuseKeys = Boolean(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY);
console.log(`[instrumentation] module loaded — hasLangfuseKeys=${hasLangfuseKeys}, NEXT_RUNTIME=${("TURBOPACK compile-time value", "edge")}`);
const langfuseSpanProcessor = hasLangfuseKeys ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langfuse$2f$otel$2f$dist$2f$index$2e$mjs__$5b$instrumentation$2d$edge$5d$__$28$ecmascript$29$__["LangfuseSpanProcessor"]({
    exportMode: "immediate"
}) : undefined;
function register() {
    console.log(`[instrumentation] register() called, NEXT_RUNTIME=${("TURBOPACK compile-time value", "edge")}`);
    if ("TURBOPACK compile-time truthy", 1) {
        console.log("[instrumentation] skipping — not the nodejs runtime");
        return;
    }
    //TURBOPACK unreachable
    ;
    const tracerProvider = undefined;
}
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__0qp7_di._.js.map