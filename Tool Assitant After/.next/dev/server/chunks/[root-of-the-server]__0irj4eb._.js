module.exports = [
"[externals]/async_hooks [external] (async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("async_hooks", () => require("async_hooks"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/instrumentation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "langfuseSpanProcessor",
    ()=>langfuseSpanProcessor,
    "register",
    ()=>register
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langfuse$2f$otel$2f$dist$2f$index$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langfuse/otel/dist/index.mjs [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$node$2f$build$2f$src$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-node/build/src/index.js [instrumentation] (ecmascript)");
;
;
const hasLangfuseKeys = Boolean(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY);
console.log(`[instrumentation] module loaded — hasLangfuseKeys=${hasLangfuseKeys}, NEXT_RUNTIME=${("TURBOPACK compile-time value", "nodejs")}`);
const langfuseSpanProcessor = hasLangfuseKeys ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langfuse$2f$otel$2f$dist$2f$index$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["LangfuseSpanProcessor"]({
    exportMode: "immediate"
}) : undefined;
function register() {
    console.log(`[instrumentation] register() called, NEXT_RUNTIME=${("TURBOPACK compile-time value", "nodejs")}`);
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (!langfuseSpanProcessor) {
        console.warn("Langfuse tracing disabled: LANGFUSE_PUBLIC_KEY and/or LANGFUSE_SECRET_KEY are not set.");
        return;
    }
    const tracerProvider = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$node$2f$build$2f$src$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["NodeTracerProvider"]({
        spanProcessors: [
            langfuseSpanProcessor
        ]
    });
    tracerProvider.register();
    console.log("[instrumentation] Langfuse tracer provider registered.");
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0irj4eb._.js.map