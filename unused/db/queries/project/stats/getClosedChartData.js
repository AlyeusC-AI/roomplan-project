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
var date_fns_1 = require("date-fns");
var __1 = require("../../..");
var getClosedChartData = function (organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var windowInDays, intervals, queries, i, currentWindowStart, startWindow, closedProjectsArr;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                windowInDays = 7;
                intervals = 10;
                queries = [];
                for (i = 0; i < intervals; i++) {
                    currentWindowStart = windowInDays * i + 1;
                    startWindow = (0, date_fns_1.subDays)(Date.now(), currentWindowStart);
                    queries.push(__1.prisma.project.count({
                        where: {
                            organizationId: organizationId,
                            closedAt: {
                                gte: startWindow,
                                lte: (0, date_fns_1.addDays)(startWindow, windowInDays)
                            },
                            isDeleted: false
                        }
                    }));
                }
                return [4 /*yield*/, __1.prisma.$transaction(queries)];
            case 1:
                closedProjectsArr = _a.sent();
                return [2 /*return*/, closedProjectsArr.map(function (count, index) {
                        var currentWindowStart = windowInDays * index + 1;
                        var startWindow = (0, date_fns_1.subDays)(Date.now(), currentWindowStart);
                        return {
                            value: count,
                            dateStart: startWindow,
                            dateEnd: (0, date_fns_1.addDays)(startWindow, windowInDays)
                        };
                    })];
        }
    });
}); };
exports["default"] = getClosedChartData;
