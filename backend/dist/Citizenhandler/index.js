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
                constituency: "Khairtabad",
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
exports.citizenHandler.post("/issue", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { update, issueId, title, description, category, mediaUrl, location, citizenId, mlaId, organizationId, status, severity, } = req.body;
    try {
        if (update) {
            if (!issueId || !status) {
                return res
                    .status(400)
                    .json({ message: "issueId and status are required for update" });
            }
            const existingIssue = yield prisma.issue.findUnique({
                where: { id: issueId },
            });
            if (!existingIssue) {
                return res.status(404).json({ message: "Issue not found" });
            }
            const updatedIssue = yield prisma.issue.update({
                where: { id: issueId },
                data: Object.assign(Object.assign({ status }, (severity && { severity })), { updatedAt: new Date() }),
            });
            return res.status(200).json({
                message: "Issue updated successfully",
                issue: updatedIssue,
            });
        }
        if (!title || !description || !category || !location || !citizenId) {
            return res.status(400).json({
                message: "title, description, category, location, and citizenId are required",
            });
        }
        const citizenExists = yield prisma.citizen.findUnique({ where: { id: citizenId } });
        if (!citizenExists) {
            return res.status(400).json({ message: "Invalid citizenId — Citizen not found" });
        }
        if (mlaId) {
            const mlaExists = yield prisma.mLA.findUnique({ where: { id: mlaId } });
            if (!mlaExists) {
                return res.status(400).json({ message: "Invalid mlaId — MLA not found" });
            }
        }
        if (organizationId) {
            const orgExists = yield prisma.organization.findUnique({ where: { id: organizationId } });
            if (!orgExists) {
                return res.status(400).json({ message: "Invalid organizationId — Organization not found" });
            }
        }
        const newIssue = yield prisma.issue.create({
            data: {
                title,
                description,
                category,
                mediaUrl,
                location,
                status: "PENDING",
                severity: severity || "LOW",
                citizenId,
                mlaId,
                organizationId,
            },
        });
        return res.status(201).json({
            message: "Issue created successfully",
            issue: newIssue,
        });
    }
    catch (error) {
        console.error("Error handling issue:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
