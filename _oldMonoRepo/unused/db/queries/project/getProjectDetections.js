"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.getRoomListWithNotes = exports.getRoomList = exports.getInferenceList = void 0;
var __1 = require("../../");
var superjson_1 = require("superjson");
var getFilteredInferenceList_1 = require("./getFilteredInferenceList");
var getInferenceList = function (publicId, organizationId, rooms, onlySelected, sortDirection) { return __awaiter(void 0, void 0, void 0, function () {
    var inferences;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, getFilteredInferenceList_1["default"])(publicId, organizationId, rooms, onlySelected, sortDirection)];
            case 1:
                inferences = _a.sent();
                // @ts-ignore
                return [2 /*return*/, superjson_1["default"].serialize(inferences).json];
        }
    });
}); };
exports.getInferenceList = getInferenceList;
var getRoomList = function (publicId, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, __1.prisma.project.findFirst({
                    where: {
                        publicId: publicId,
                        organizationId: organizationId
                    },
                    select: {
                        rooms: {
                            select: {
                                name: true,
                                publicId: true,
                                isDeleted: true,
                                gpp: true,
                                temperature: true,
                                humidity: true,
                                dehuReading: true,
                                length: true,
                                width: true,
                                height: true,
                                totalSqft: true,
                                windows: true,
                                doors: true,
                                equipmentUsed: true,
                                areasAffected: {
                                    select: {
                                        type: true,
                                        publicId: true,
                                        material: true,
                                        totalAreaRemoved: true,
                                        totalAreaMicrobialApplied: true,
                                        cause: true,
                                        category: true,
                                        cabinetryRemoved: true,
                                        isDeleted: true
                                    }
                                }
                            },
                            where: {
                                isDeleted: false
                            },
                            orderBy: {
                                createdAt: "desc"
                            }
                        }
                    }
                })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.getRoomList = getRoomList;
var getRoomListWithNotes = function (publicId, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, __1.prisma.project.findFirst({
                    where: {
                        publicId: publicId,
                        organizationId: organizationId
                    },
                    select: {
                        rooms: {
                            select: {
                                name: true,
                                publicId: true,
                                isDeleted: true,
                                gpp: true,
                                temperature: true,
                                humidity: true,
                                dehuReading: true,
                                length: true,
                                width: true,
                                height: true,
                                totalSqft: true,
                                windows: true,
                                doors: true,
                                areasAffected: {
                                    select: {
                                        type: true,
                                        publicId: true,
                                        material: true,
                                        totalAreaRemoved: true,
                                        totalAreaMicrobialApplied: true,
                                        cause: true,
                                        category: true,
                                        cabinetryRemoved: true,
                                        isDeleted: true
                                    }
                                },
                                notes: {
                                    select: {
                                        publicId: true,
                                        body: true,
                                        date: true,
                                        updatedAt: true,
                                        notesAuditTrail: {
                                            select: {
                                                userName: true
                                            },
                                            orderBy: {
                                                createdAt: "desc"
                                            },
                                            take: 1
                                        }
                                    },
                                    where: {
                                        isDeleted: false
                                    },
                                    orderBy: {
                                        createdAt: "desc"
                                    }
                                }
                            },
                            where: {
                                isDeleted: false
                            },
                            orderBy: {
                                createdAt: "desc"
                            }
                        }
                    }
                })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.getRoomListWithNotes = getRoomListWithNotes;
var getProjectDetections = function (publicId, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, __1.prisma.project.findFirst({
                    where: { publicId: publicId, organizationId: organizationId },
                    select: {
                        images: {
                            where: {
                                inference: {
                                    isNot: undefined
                                }
                            },
                            select: {
                                key: true,
                                inference: {
                                    select: {
                                        publicId: true,
                                        imageKey: true,
                                        room: true,
                                        detections: {
                                            select: {
                                                publicId: true,
                                                category: true,
                                                code: true,
                                                item: true,
                                                quality: true,
                                                imageKey: true,
                                                xMinCord: true,
                                                yMinCord: true,
                                                xMaxCord: true,
                                                yMaxCord: true,
                                                confidence: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports["default"] = getProjectDetections;
