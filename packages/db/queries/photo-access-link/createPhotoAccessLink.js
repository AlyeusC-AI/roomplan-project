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
var _a;
exports.__esModule = true;
var __1 = require("../../");
var access_link_1 = require("../../types/access-link");
var date_fns_1 = require("date-fns");
var crypto = require("crypto");
var expirationMap = (_a = {},
    _a[access_link_1.AccessLinkExpiration.ONE_HOUR] = function () { return (0, date_fns_1.addHours)(Date.now(), 1); },
    _a[access_link_1.AccessLinkExpiration.ONE_DAY] = function () { return (0, date_fns_1.addDays)(Date.now(), 1); },
    _a[access_link_1.AccessLinkExpiration.SEVEN_DAYS] = function () { return (0, date_fns_1.addDays)(Date.now(), 7); },
    _a[access_link_1.AccessLinkExpiration.FOURTEEN_DAYS] = function () { return (0, date_fns_1.addDays)(Date.now(), 14); },
    _a[access_link_1.AccessLinkExpiration.THIRTY_DAYS] = function () { return (0, date_fns_1.addDays)(Date.now(), 30); },
    _a);
var createPhotoAccessLink = function (userId, _a) {
    var projectPublicId = _a.projectPublicId, email = _a.email, phoneNumber = _a.phoneNumber, expiresAt = _a.expiresAt;
    return __awaiter(void 0, void 0, void 0, function () {
        var user, project, accessId, expiresAtDate, dateFn;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, __1.prisma.user.findFirst({
                        where: {
                            id: userId
                        },
                        select: {
                            org: {
                                select: {
                                    organization: {
                                        select: {
                                            id: true
                                        }
                                    }
                                }
                            }
                        }
                    })];
                case 1:
                    user = _c.sent();
                    return [4 /*yield*/, __1.prisma.project.findFirst({
                            where: {
                                publicId: projectPublicId,
                                organizationId: (_b = user === null || user === void 0 ? void 0 : user.org) === null || _b === void 0 ? void 0 : _b.organization.id
                            }
                        })];
                case 2:
                    project = _c.sent();
                    if (!project)
                        return [2 /*return*/, null];
                    accessId = crypto.randomBytes(64).toString("hex");
                    if (expiresAt && expiresAt !== access_link_1.AccessLinkExpiration.NEVER) {
                        dateFn = expirationMap[expiresAt];
                        expiresAtDate = dateFn();
                    }
                    return [4 /*yield*/, __1.prisma.photoAccessLink.create({
                            data: {
                                projectId: project.id,
                                expiresAt: expiresAtDate,
                                accessId: accessId,
                                phoneNumber: phoneNumber,
                                email: email
                            }
                        })];
                case 3: return [2 /*return*/, _c.sent()];
            }
        });
    });
};
exports["default"] = createPhotoAccessLink;
