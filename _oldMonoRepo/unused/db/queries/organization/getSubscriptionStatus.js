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
exports.getSubcriptionStatusFromOrganizationId = void 0;
var __1 = require("../../");
var __2 = require("../../");
var date_fns_1 = require("date-fns");
var getUser_1 = require("../user/getUser");
var getSubcriptionStatusFromOrganizationId = function (organizationId, createdAt) { return __awaiter(void 0, void 0, void 0, function () {
    var imageCount, subscription;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, __1.prisma.image.count({
                    where: {
                        organizationId: organizationId
                    }
                })];
            case 1:
                imageCount = _a.sent();
                return [4 /*yield*/, __1.prisma.subscriptions.findFirst({
                        where: {
                            organizationId: organizationId
                        }
                    })];
            case 2:
                subscription = _a.sent();
                if (subscription && (subscription === null || subscription === void 0 ? void 0 : subscription.status) === __2.SubscriptionStatus.canceled) {
                    if ((0, date_fns_1.differenceInDays)(subscription.currentPeriodStart, new Date(Date.now())) >
                        31) {
                        return [2 /*return*/, __2.SubscriptionStatus.past_due];
                    }
                    else {
                        return [2 /*return*/, __2.SubscriptionStatus.active];
                    }
                }
                if (!subscription || subscription.status != __2.SubscriptionStatus.active) {
                    if (imageCount >= 500) {
                        return [2 /*return*/, __2.SubscriptionStatus.past_due];
                    }
                    if ((0, date_fns_1.differenceInBusinessDays)(createdAt, Date.now()) > 30) {
                        return [2 /*return*/, __2.SubscriptionStatus.past_due];
                    }
                    return [2 /*return*/, __2.SubscriptionStatus.trialing];
                }
                return [2 /*return*/, subscription.status];
        }
    });
}); };
exports.getSubcriptionStatusFromOrganizationId = getSubcriptionStatusFromOrganizationId;
var getSubcriptionStatus = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var haloUser, organizationId;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, (0, getUser_1["default"])(userId)];
            case 1:
                haloUser = _c.sent();
                organizationId = (_a = haloUser === null || haloUser === void 0 ? void 0 : haloUser.org) === null || _a === void 0 ? void 0 : _a.organization.id;
                console.log(organizationId);
                if (!organizationId)
                    return [2 /*return*/, __2.SubscriptionStatus.incomplete];
                return [2 /*return*/, (0, exports.getSubcriptionStatusFromOrganizationId)(organizationId, (_b = haloUser.org) === null || _b === void 0 ? void 0 : _b.organization.createdAt)];
        }
    });
}); };
exports["default"] = getSubcriptionStatus;
