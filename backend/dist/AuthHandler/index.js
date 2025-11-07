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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authHandler = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
exports.authHandler = (0, express_1.Router)();
// Health check
exports.authHandler.get("/health", (req, res) => {
    return res.status(200).json({ message: "Auth route up and running" });
});
exports.authHandler.post("/signUp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const isMLA = email.endsWith("@mla.com");
        const isOrg = email.endsWith("@org.com");
        if (isMLA) {
            const existing = yield prisma.mLA.findUnique({ where: { email } });
            if (existing)
                return res.status(409).json({ error: "MLA already exists" });
            const newMLA = yield prisma.mLA.create({
                data: { name, email },
            });
            return res.status(201).json({
                message: "MLA registered successfully",
                userType: "MLA",
                data: newMLA,
            });
        }
        if (isOrg) {
            const existing = yield prisma.organization.findUnique({
                where: { contact_email: email },
            });
            if (existing)
                return res.status(409).json({ error: "Organization already exists" });
            const newOrg = yield prisma.organization.create({
                data: { name, category: "General", contact_email: email },
            });
            return res.status(201).json({
                message: "Organization registered successfully",
                userType: "Organization",
                data: newOrg,
            });
        }
        // Default → Citizen
        const existingCitizen = yield prisma.citizen.findUnique({ where: { email } });
        if (existingCitizen)
            return res.status(409).json({ error: "Citizen already exists" });
        const newCitizen = yield prisma.citizen.create({
            data: { name, email, password: hashedPassword },
            select: { id: true, name: true, email: true },
        });
        return res.status(201).json({
            message: "Citizen registered successfully",
            userType: "Citizen",
            data: newCitizen,
        });
    }
    catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
const JWT_SECRET = process.env.JWT_SECRET;
exports.authHandler.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, constituency } = req.body;
    try {
        const citizen = yield prisma.citizen.findUnique({ where: { email } });
        if (!citizen) {
            return res.status(404).json({ message: "Citizen not found" });
        }
        const valid = yield bcrypt_1.default.compare(password, citizen.password);
        if (!valid)
            return res.status(401).json({ message: "Invalid password" });
        const mlas = yield prisma.mLA.findMany({ where: { constituency } });
        const orgs = yield prisma.organization.findMany({ where: { constituency } });
        yield prisma.citizen.update({
            where: { id: citizen.id },
            data: {
                linked_MLAs: { connect: mlas.map((mla) => ({ id: mla.id })) },
                linked_Organizations: { connect: orgs.map((org) => ({ id: org.id })) },
            },
        });
        const token = jsonwebtoken_1.default.sign({
            userId: citizen.id,
            email: citizen.email,
            role: "citizen",
        }, JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({
            message: "Login successful",
            token,
            citizen: {
                id: citizen.id,
                email: citizen.email,
                constituency,
                linked_MLAs: mlas.map((m) => m.name),
                linked_Organizations: orgs.map((o) => o.name),
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
