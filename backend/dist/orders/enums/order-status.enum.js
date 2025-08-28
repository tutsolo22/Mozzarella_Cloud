"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PendienteConfirmacion"] = "pending_confirmation";
    OrderStatus["Confirmado"] = "confirmed";
    OrderStatus["EnPreparaci\u00F3n"] = "in_preparation";
    OrderStatus["ListoParaEntrega"] = "ready_for_delivery";
    OrderStatus["EnReparto"] = "in_delivery";
    OrderStatus["Entregada"] = "delivered";
    OrderStatus["Cancelada"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
//# sourceMappingURL=order-status.enum.js.map