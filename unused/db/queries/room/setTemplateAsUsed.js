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
var templates_1 = require("@servicegeek/templates");
var uuid_1 = require("uuid");
var getProjectForOrg_1 = require("../project/getProjectForOrg");
var getUser_1 = require("../user/getUser");
var setTemplateAsUsed = function (userId, projectPublicId, roomId, templateCode, excludedItems) { return __awaiter(void 0, void 0, void 0, function () {
    var servicegeekUser, organizationId, project, room, existingTemplate, excluded, template, inferencePublicId, inference, newData, cleanData, i, item, detectionPublicId, detections;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, getUser_1["default"])(userId)];
            case 1:
                servicegeekUser = _b.sent();
                organizationId = (_a = servicegeekUser === null || servicegeekUser === void 0 ? void 0 : servicegeekUser.org) === null || _a === void 0 ? void 0 : _a.organization.id;
                if (!organizationId)
                    return [2 /*return*/, { failed: true, reason: "no-org" }];
                return [4 /*yield*/, (0, getProjectForOrg_1["default"])(projectPublicId, organizationId)];
            case 2:
                project = _b.sent();
                if (!project) {
                    return [2 /*return*/, { failed: true, reason: "no-project" }];
                }
                return [4 /*yield*/, __1.prisma.room.findFirst({
                        where: {
                            projectId: project.id,
                            publicId: roomId,
                            isDeleted: false
                        }
                    })];
            case 3:
                room = _b.sent();
                if (!room) {
                    return [2 /*return*/, { failed: true, reason: "no-project" }];
                }
                return [4 /*yield*/, __1.prisma.templatesUsed.findFirst({
                        where: {
                            roomId: room.id,
                            templateCode: templateCode
                        }
                    })];
            case 4:
                existingTemplate = _b.sent();
                excluded = excludedItems || [];
                template = templates_1["default"].find(function (t) { return t.id === templateCode; });
                if (!template) {
                    return [2 /*return*/, { failed: true, reason: "no-template" }];
                }
                inferencePublicId = (0, uuid_1.v4)();
                return [4 /*yield*/, __1.prisma.inference.create({
                        data: {
                            publicId: inferencePublicId,
                            projectId: project.id,
                            roomId: room.id
                        }
                    })];
            case 5:
                inference = _b.sent();
                newData = [];
                cleanData = [];
                for (i = 0; i < template.items.length; i++) {
                    if (excluded.indexOf(i) !== -1)
                        continue;
                    item = template.items[i];
                    detectionPublicId = (0, uuid_1.v4)();
                    newData.push({
                        projectId: inference.projectId,
                        publicId: detectionPublicId,
                        confidence: 1,
                        category: item.category,
                        code: item.selection,
                        quality: "",
                        item: item.description,
                        inferenceId: inference.id,
                        roomId: inference.roomId
                    });
                    cleanData.push({
                        publicId: detectionPublicId,
                        category: item.category,
                        code: item.selection,
                        item: item.description,
                        roomId: inference.roomId
                    });
                }
                return [4 /*yield*/, __1.prisma.detection.createMany({
                        data: newData,
                        skipDuplicates: true
                    })];
            case 6:
                detections = _b.sent();
                if (existingTemplate)
                    return [2 /*return*/, { inferenceId: inferencePublicId, detections: cleanData }];
                return [4 /*yield*/, __1.prisma.templatesUsed.create({
                        data: {
                            roomId: room.id,
                            templateCode: templateCode
                        }
                    })];
            case 7:
                _b.sent();
                return [2 /*return*/, { inferenceId: inferencePublicId, detections: cleanData }];
        }
    });
}); };
exports["default"] = setTemplateAsUsed;
