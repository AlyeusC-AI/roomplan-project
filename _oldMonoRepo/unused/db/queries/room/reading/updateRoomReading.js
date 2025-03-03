"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.calculateGpp = void 0;
var __1 = require("../../../");
var node_html_parser_1 = require("node-html-parser");
var getUser_1 = require("../../user/getUser");
var getProjectForOrg_1 = require("../../project/getProjectForOrg");
var calculateGpp = function (temperature, relativeHumidity) { return __awaiter(void 0, void 0, void 0, function () {
    var temperatureMeasurement, pressure, pressureMeasurement, precision, response, text, root;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                temperatureMeasurement = "Fahrenheit";
                pressure = 1;
                pressureMeasurement = "atmosphere";
                precision = 2;
                return [4 /*yield*/, fetch("https://www.aqua-calc.com/calculate/humidity", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        body: "temperature=".concat(temperature, "&temperature-measurement=").concat(temperatureMeasurement, "&relative-humidity=").concat(relativeHumidity, "&pressure=").concat(pressure, "&pressure-measurement=").concat(pressureMeasurement, "&precision=").concat(precision, "&calculate=Calculate")
                    })];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.text()];
            case 2:
                text = _a.sent();
                root = (0, node_html_parser_1.parse)(text);
                return [2 /*return*/, root.querySelectorAll(".black_on_white.math>p>strong")[1].innerText];
        }
    });
}); };
exports.calculateGpp = calculateGpp;
var updateRoomReading = function (userId, projectPublicId, roomId, readingId, readingData) { return __awaiter(void 0, void 0, void 0, function () {
    var servicegeekUser, organizationId, project, room, reading, filteredData, updatedRoomReading, gpp, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, getUser_1["default"])(userId)];
            case 1:
                servicegeekUser = _b.sent();
                organizationId = (_a = servicegeekUser === null || servicegeekUser === void 0 ? void 0 : servicegeekUser.org) === null || _a === void 0 ? void 0 : _a.organization.id;
                if (!organizationId) {
                    console.error("No org");
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, (0, getProjectForOrg_1["default"])(projectPublicId, organizationId)];
            case 2:
                project = _b.sent();
                if (!project) {
                    console.error("No project");
                    return [2 /*return*/, null];
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
                    console.error("No room");
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, __1.prisma.roomReading.findFirst({
                        where: {
                            roomId: room.id,
                            isDeleted: false,
                            publicId: readingId
                        }
                    })];
            case 4:
                reading = _b.sent();
                if (!reading) {
                    console.error("No reading");
                    return [2 /*return*/, null];
                }
                filteredData = Object.keys(readingData)
                    .filter(function (key) { return readingData[key]; })
                    .reduce(function (prev, cur) {
                    var _a;
                    return (__assign(__assign({}, prev), (_a = {}, _a[cur] = readingData[cur], _a)));
                }, {});
                return [4 /*yield*/, __1.prisma.roomReading.update({
                        where: {
                            id: reading.id
                        },
                        data: __assign({}, filteredData)
                    })];
            case 5:
                updatedRoomReading = _b.sent();
                if (!(updatedRoomReading.humidity && updatedRoomReading.temperature)) return [3 /*break*/, 12];
                _b.label = 6;
            case 6:
                _b.trys.push([6, 10, , 12]);
                return [4 /*yield*/, (0, exports.calculateGpp)(updatedRoomReading.temperature, updatedRoomReading.humidity)];
            case 7:
                gpp = _b.sent();
                if (!!isNaN(parseFloat(gpp))) return [3 /*break*/, 9];
                return [4 /*yield*/, __1.prisma.roomReading.update({
                        where: {
                            id: reading.id
                        },
                        data: {
                            gpp: parseFloat(gpp).toFixed(2)
                        }
                    })];
            case 8:
                _b.sent();
                _b.label = 9;
            case 9: return [3 /*break*/, 12];
            case 10:
                error_1 = _b.sent();
                console.log(error_1);
                return [4 /*yield*/, __1.prisma.roomReading.update({
                        where: {
                            id: reading.id
                        },
                        data: {
                            gpp: ""
                        }
                    })];
            case 11:
                _b.sent();
                return [3 /*break*/, 12];
            case 12: return [2 /*return*/, { gpp: gpp }];
        }
    });
}); };
exports["default"] = updateRoomReading;
