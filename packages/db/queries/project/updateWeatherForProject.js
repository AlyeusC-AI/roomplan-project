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
var __1 = require("../../");
var getUser_1 = require("../user/getUser");
var getProjectForOrg_1 = require("./getProjectForOrg");
var updateTempAndHumidity = function (project) { return __awaiter(void 0, void 0, void 0, function () {
    var lat, lng, latLng, weatherData, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                lat = project.lat;
                lng = project.lng;
                if (!(!lat || !lng)) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, getProjectForOrg_1.getLatLng)(project.location)];
            case 1:
                latLng = _a.sent();
                if (latLng) {
                    lat = latLng.lat;
                    lng = latLng.lng;
                }
                _a.label = 2;
            case 2: return [4 /*yield*/, (0, getProjectForOrg_1.getWeatherData)(lat, lng)];
            case 3:
                weatherData = _a.sent();
                if (!weatherData)
                    return [2 /*return*/, {}];
                return [4 /*yield*/, __1.prisma.project.update({
                        where: {
                            publicId: project.publicId
                        },
                        data: __assign(__assign({}, weatherData), { lat: "".concat(lat), lng: "".concat(lng) })
                    })];
            case 4:
                _a.sent();
                return [2 /*return*/, weatherData];
            case 5:
                error_1 = _a.sent();
                console.error(error_1);
                return [2 /*return*/, {}];
            case 6: return [2 /*return*/];
        }
    });
}); };
var updateWeatherForProject = function (userId, publicId) { return __awaiter(void 0, void 0, void 0, function () {
    var haloUser, organizationId, project, lastTimeWeatherFetched;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, getUser_1["default"])(userId)];
            case 1:
                haloUser = _b.sent();
                organizationId = (_a = haloUser === null || haloUser === void 0 ? void 0 : haloUser.org) === null || _a === void 0 ? void 0 : _a.organization.id;
                if (!organizationId) {
                    console.error("No organization Id");
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, __1.prisma.project.findFirst({
                        where: { publicId: publicId, organizationId: organizationId }
                    })];
            case 2:
                project = _b.sent();
                if (!project) return [3 /*break*/, 4];
                lastTimeWeatherFetched = project.lastTimeWeatherFetched;
                return [4 /*yield*/, updateTempAndHumidity(project)];
            case 3: return [2 /*return*/, _b.sent()];
            case 4: return [2 /*return*/, {}];
        }
    });
}); };
exports["default"] = updateWeatherForProject;
