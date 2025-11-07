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
exports.citizenHandler.get("/details", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    try {
        const citizen = yield prisma.citizen.findUnique({
            where: { email: String(email) },
            include: {
                linked_MLAs: {
                    orderBy: {
                        createdAt: 'desc' // ✅ Most recent MLA first
                    },
                    take: 1 // ✅ Only get the most recent one
                },
                linked_Organizations: true,
                issues: {
                    include: {
                        mla: true,
                        organization: true,
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
            },
        });
        if (!citizen) {
            return res.status(404).json({ message: "Citizen not found" });
        }
        const mostRecentMLA = citizen.linked_MLAs[0] || null;
        return res.status(200).json({
            citizen: {
                id: citizen.id,
                name: citizen.name,
                email: citizen.email,
                constituency: citizen.constituency,
                mlaId: (mostRecentMLA === null || mostRecentMLA === void 0 ? void 0 : mostRecentMLA.id) || null,
                currentMLA: mostRecentMLA ? {
                    id: mostRecentMLA.id,
                    name: mostRecentMLA.name,
                    party: mostRecentMLA.party,
                    email: mostRecentMLA.email,
                    phone: mostRecentMLA.phone,
                    constituency: mostRecentMLA.constituency,
                    rating: mostRecentMLA.rating,
                } : null,
                linked_Organizations: citizen.linked_Organizations.map((org) => ({
                    id: org.id,
                    name: org.name,
                    category: org.category,
                    constituency: org.constituency,
                    contact_email: org.contact_email,
                    contact_phone: org.contact_phone,
                    address: org.address,
                })),
                issues: citizen.issues.map((issue) => ({
                    id: issue.id,
                    title: issue.title,
                    description: issue.description,
                    category: issue.category,
                    mediaUrl: issue.mediaUrl,
                    location: issue.location,
                    status: issue.status,
                    severity: issue.severity,
                    createdAt: issue.createdAt,
                    updatedAt: issue.updatedAt,
                    mlaId: issue.mlaId,
                    organizationId: issue.organizationId,
                    mla: issue.mla ? {
                        id: issue.mla.id,
                        name: issue.mla.name,
                        party: issue.mla.party,
                        constituency: issue.mla.constituency,
                    } : null,
                    organization: issue.organization ? {
                        id: issue.organization.id,
                        name: issue.organization.name,
                        category: issue.organization.category,
                        constituency: issue.organization.constituency,
                    } : null,
                })),
            },
        });
    }
    catch (error) {
        console.error("Error fetching citizen details:", error);
        res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? "something went wrong" : undefined
        });
    }
}));
exports.citizenHandler.post("/issue", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { update, issueId, title, description, category, mediaUrl, location, latitude, longitude, citizenId, mlaId, organizationId, status, severity, } = req.body;
    try {
        // --- Update existing issue ---
        if (update) {
            if (!issueId || !status) {
                return res
                    .status(400)
                    .json({ message: "issueId and status are required for update" });
            }
            const existingIssue = yield prisma.issue.findUnique({ where: { id: issueId } });
            if (!existingIssue) {
                return res.status(404).json({ message: "Issue not found" });
            }
            const updatedIssue = yield prisma.issue.update({
                where: { id: issueId },
                data: Object.assign(Object.assign(Object.assign(Object.assign({ status: status }, (severity && { severity: severity })), (latitude && { latitude })), (longitude && { longitude })), { updatedAt: new Date() }),
            });
            return res.status(200).json({
                message: "Issue updated successfully",
                issue: updatedIssue,
            });
        }
        // --- Create new issue ---
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
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ title,
                description,
                category,
                mediaUrl,
                location }, (latitude && { latitude: parseFloat(latitude) })), (longitude && { longitude: parseFloat(longitude) })), { status: "PENDING", severity: (severity || "LOW"), // Cast to enum type
                citizenId }), (mlaId && { mlaId })), (organizationId && { organizationId })),
        });
        return res.status(201).json({
            message: "Issue created successfully",
            issue: newIssue,
        });
    }
    catch (error) {
        console.error("Error handling issue:", error);
        console.error("Error details:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? "something went wrong" : undefined
        });
    }
}));
exports.citizenHandler.get("/all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const issues = yield prisma.issue.findMany({
            include: {
                citizen: {
                    select: {
                        id: true,
                        name: true,
                        constituency: true,
                    },
                },
                mla: {
                    select: {
                        id: true,
                        name: true,
                        party: true,
                        constituency: true,
                    },
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        constituency: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc', // Most recent first
            },
        });
        return res.status(200).json({
            success: true,
            count: issues.length,
            issues
        });
    }
    catch (error) {
        console.error("Error fetching issues:", error);
        console.error("Error message:", error);
        console.error("Error stack:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
}));
