"use strict";
exports.__esModule = true;
var __1 = require("../../");
var getallProjectEquipment = function (projectId) {
    return __1.prisma.projectEquipment.findMany({
        where: {
            projectId: projectId,
            isDeleted: false
        },
        orderBy: {
            createdAt: "desc"
        },
        select: {
            publicId: true,
            quantity: true,
            equipment: {
                select: {
                    name: true,
                    publicId: true,
                    quantity: true
                }
            }
        }
    });
};
exports["default"] = getallProjectEquipment;
