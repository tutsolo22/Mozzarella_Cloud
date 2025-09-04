"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.PaymentMethod = exports.OrderType = void 0;
var OrderType;
(function (OrderType) {
    OrderType["Delivery"] = "delivery";
    OrderType["Pickup"] = "pickup";
    OrderType["DineIn"] = "dine_in";
})(OrderType || (exports.OrderType = OrderType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["Cash"] = "cash";
    PaymentMethod["Transfer"] = "transfer";
    PaymentMethod["DebitCard"] = "debit_card";
    PaymentMethod["CreditCard"] = "credit_card";
    PaymentMethod["MercadoPago"] = "mercado_pago";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["Pending"] = "pending";
    PaymentStatus["Paid"] = "paid";
    PaymentStatus["Failed"] = "failed";
    PaymentStatus["Refunded"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
//# sourceMappingURL=order-types.enum.js.map