"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
exports.__esModule = true;
exports.prisma = void 0;
var prisma_1 = require("./prisma/src/generated/prisma");
__exportStar(require("./prisma/src/generated/prisma"), exports);
var globalForPrisma = globalThis;
if (typeof window === "undefined") {
    if (process.env.NODE_ENV === "production") {
        console.log("setting production prisma");
        globalForPrisma.prisma = new prisma_1.PrismaClient();
    }
    else {
        if (!globalForPrisma.prisma) {
            console.log("setting development prisma");
            globalForPrisma.prisma = new prisma_1.PrismaClient();
        }
    }
}
exports.prisma = globalForPrisma.prisma;
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;
exports["default"] = exports.prisma;
__exportStar(require("./types/access-link"), exports);
