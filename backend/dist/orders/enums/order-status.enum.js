"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PendingConfirmation"] = "pending_confirmation";
    OrderStatus["Confirmed"] = "confirmed";
    OrderStatus["InPreparation"] = "in_preparation";
    OrderStatus["ReadyForDelivery"] = "ready_for_delivery";
    OrderStatus["ReadyForExternalPickup"] = "ready_for_external_pickup";
    OrderStatus["InDelivery"] = "in_delivery";
    OrderStatus["Delivered"] = "delivered";
    OrderStatus["Cancelled"] = "cancelled";
    OrderStatus["PendingPayment"] = "pending_payment";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
//# sourceMappingURL=order-status.enum.js.map