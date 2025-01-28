"use strict";
exports.__esModule = true;
var __1 = require("../../");
var getAllOrganizationEquipment = function (organizationId) {
    return __1.prisma.equipment.findMany({
        where: {
            organizationId: organizationId,
            isDeleted: false
        },
        orderBy: {
            createdAt: "desc"
        },
        select: {
            publicId: true,
            name: true,
            quantity: true
        }
    });
};
exports["default"] = getAllOrganizationEquipment;
