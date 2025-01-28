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
var __1 = require("../../");
var __2 = require("../../");
var uuid_1 = require("uuid");
var getProjectForOrg_1 = require("../project/getProjectForOrg");
var getUser_1 = require("../user/getUser");
var createNotification = function (_a) {
    var userId = _a.userId, title = _a.title, content = _a.content, notify = _a.notify, link = _a.link, projectPublicId = _a.projectPublicId, _b = _a.excludeCreator, excludeCreator = _b === void 0 ? true : _b;
    return __awaiter(void 0, void 0, void 0, function () {
        var servicegeekUser, organizationId, project, assignes, userIds, userIds;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, (0, getUser_1["default"])(userId)];
                case 1:
                    servicegeekUser = _e.sent();
                    organizationId = (_c = servicegeekUser === null || servicegeekUser === void 0 ? void 0 : servicegeekUser.org) === null || _c === void 0 ? void 0 : _c.organization.id;
                    if (!organizationId)
                        return [2 /*return*/, null];
                    if (!(projectPublicId && notify === "assignees")) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, getProjectForOrg_1["default"])(projectPublicId, organizationId)];
                case 2:
                    project = _e.sent();
                    if (!project) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, __1.prisma.project.findFirst({
                            where: {
                                id: project.id
                            },
                            select: {
                                projectAssignees: true
                            }
                        })];
                case 3:
                    assignes = _e.sent();
                    if (!assignes) {
                        return [2 /*return*/, null];
                    }
                    userIds = assignes.projectAssignees.map(function (assigne) { return assigne.userId; });
                    if (excludeCreator) {
                        userIds = userIds.filter(function (id) { return userId !== id; });
                    }
                    return [2 /*return*/, __1.prisma.notification.createMany({
                            data: userIds.map(function (id) { return ({
                                publicId: (0, uuid_1.v4)(),
                                type: __2.NotificationType.notification,
                                title: title,
                                content: content,
                                link: link,
                                isSeen: false,
                                userId: id
                            }); })
                        })];
                case 4:
                    // Create Notifications for every assignee of a organization
                    if (notify === "everyone") {
                        userIds = (_d = servicegeekUser === null || servicegeekUser === void 0 ? void 0 : servicegeekUser.org) === null || _d === void 0 ? void 0 : _d.organization.users.map(function (member) { return member.user.id; });
                        if (!userIds)
                            return [2 /*return*/, null];
                        if (excludeCreator) {
                            userIds = userIds.filter(function (id) { return userId !== id; });
                        }
                        console.log("Creating notifications for", userIds);
                        return [2 /*return*/, __1.prisma.notification.createMany({
                                data: userIds.map(function (id) { return ({
                                    publicId: (0, uuid_1.v4)(),
                                    type: __2.NotificationType.notification,
                                    title: title,
                                    content: content,
                                    link: link,
                                    isSeen: false,
                                    userId: id
                                }); })
                            })];
                    }
                    return [2 /*return*/];
            }
        });
    });
};
exports["default"] = createNotification;
