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
Object.defineProperty(exports, "__esModule", { value: true });
exports.citizenHandler = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.citizenHandler = (0, express_1.Router)();
// Health check
exports.citizenHandler.get("/health", (req, res) => {
    return res.status(200).json({ message: "Citizen route up and running" });
});
exports.citizenHandler.get("/details", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    try {
        const citizen = yield prisma.citizen.findUnique({
            where: { email: String(email) },
            include: {
                linked_MLAs: true,
                linked_Organizations: true,
            },
        });
        if (!citizen) {
            return res.status(404).json({ message: "Citizen not found" });
        }
        return res.status(200).json({
            citizen: {
                id: citizen.id,
                name: citizen.name,
                email: citizen.email,
                constituency: "Khairtabad", // (for now hardcoded)
                linked_MLAs: citizen.linked_MLAs.map((mla) => ({
                    id: mla.id,
                    name: mla.name,
                    party: mla.party,
                    email: mla.email,
                    phone: mla.phone,
                    rating: mla.rating,
                })),
                linked_Organizations: citizen.linked_Organizations.map((org) => ({
                    id: org.id,
                    name: org.name,
                    category: org.category,
                    contact_email: org.contact_email,
                    contact_phone: org.contact_phone,
                    address: org.address,
                })),
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
