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
var stripe_1 = require("stripe");
var stripe = new stripe_1["default"](process.env.STRIPE_SECRET_KEY || "", {
    // @ts-expect-error
    apiVersion: "2020-08-27"
});
var toDateTime = function (secs) {
    var t = new Date("1970-01-01T00:30:00Z"); // Unix epoch start.
    t.setSeconds(secs);
    return t;
};
/**
 * Copies the billing details from the payment method to the customer object.
 */
var copyBillingDetailsToCustomer = function (id, payment_method) { return __awaiter(void 0, void 0, void 0, function () {
    var customer, _a, name, phone, address, paymentMethod;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                customer = payment_method.customer;
                _a = payment_method.billing_details, name = _a.name, phone = _a.phone, address = _a.address;
                if (!name || !phone || !address)
                    return [2 /*return*/];
                //@ts-ignore
                return [4 /*yield*/, stripe.customers.update(customer, { name: name, phone: phone, address: address })];
            case 1:
                //@ts-ignore
                _b.sent();
                paymentMethod = payment_method[payment_method.type];
                return [4 /*yield*/, __1.prisma.customers.update({
                        where: {
                            id: id
                        },
                        data: {
                            billingAddress: __assign({}, address),
                            paymentMethod: paymentMethod ? paymentMethod : undefined
                        }
                    })];
            case 2:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
var manageSubscriptionStatusChange = function (subscriptionId, customerId, createAction) {
    if (createAction === void 0) { createAction = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var customer, uuid, organizationId, subscription, subscriptionData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.prisma.customers.findUnique({
                        where: {
                            customerId: customerId
                        }
                    })];
                case 1:
                    customer = _a.sent();
                    if (!customer)
                        throw "No Customer Found!";
                    uuid = customer.id, organizationId = customer.organizationId;
                    return [4 /*yield*/, stripe.subscriptions.retrieve(subscriptionId, {
                            expand: ["default_payment_method"]
                        })];
                case 2:
                    subscription = _a.sent();
                    subscriptionData = {
                        organizationId: organizationId,
                        metadata: subscription.metadata,
                        status: subscription.status,
                        pricesId: subscription.items.data[0].price.id,
                        //TODO check quantity on subscription
                        // @ts-ignore
                        quantity: subscription.quantity,
                        cancelAtPeriodEnd: subscription.cancel_at_period_end,
                        cancelAt: subscription.cancel_at
                            ? toDateTime(subscription.cancel_at)
                            : null,
                        canceledAt: subscription.canceled_at
                            ? toDateTime(subscription.canceled_at)
                            : null,
                        currentPeriodStart: toDateTime(subscription.current_period_start),
                        currentPeriodEnd: toDateTime(subscription.current_period_end),
                        created: toDateTime(subscription.created),
                        endedAt: subscription.ended_at ? toDateTime(subscription.ended_at) : null,
                        trialStart: subscription.trial_start
                            ? toDateTime(subscription.trial_start)
                            : null,
                        trialEnd: subscription.trial_end
                            ? toDateTime(subscription.trial_end)
                            : null
                    };
                    return [4 /*yield*/, __1.prisma.subscriptions.upsert({
                            where: {
                                id: subscription.id
                            },
                            // @ts-ignore
                            update: __assign({}, subscriptionData),
                            // @ts-ignore
                            create: __assign({ id: subscription.id }, subscriptionData)
                        })];
                case 3:
                    _a.sent();
                    if (!(createAction && subscription.default_payment_method && uuid)) return [3 /*break*/, 5];
                    //@ts-ignore
                    return [4 /*yield*/, copyBillingDetailsToCustomer(uuid, subscription.default_payment_method)];
                case 4:
                    //@ts-ignore
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
};
exports["default"] = manageSubscriptionStatusChange;
