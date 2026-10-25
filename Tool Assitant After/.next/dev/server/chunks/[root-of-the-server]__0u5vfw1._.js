module.exports = [
"[externals]/node:fs [external] (node:fs, cjs, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/[externals]_node_fs_1t1l-4-._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[externals]/node:fs [external] (node:fs, cjs)");
    });
});
}),
"[externals]/node:path [external] (node:path, cjs, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/[externals]_node_path_1pmhwj3._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[externals]/node:path [external] (node:path, cjs)");
    });
});
}),
"[project]/node_modules/@anthropic-ai/sdk/tools/agent-toolset/node.mjs [app-route] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/node_modules_@anthropic-ai_sdk_0jv6x-v._.js",
  "server/chunks/[externals]__0dapc89._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/node_modules/@anthropic-ai/sdk/tools/agent-toolset/node.mjs [app-route] (ecmascript)");
    });
});
}),
];