import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
export const authHandler = Router();

// Health check
authHandler.get("/health", (req, res) => {
  return res.status(200).json({ message: "Auth route up and running" });
});


authHandler.post("/signUp", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isMLA = email.endsWith("@mla.com");
    const isOrg = email.endsWith("@org.com");

    if (isMLA) {
      const existing = await prisma.mLA.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ error: "MLA already exists" });

      const newMLA = await prisma.mLA.create({
        data: { name, email },
      });

      return res.status(201).json({
        message: "MLA registered successfully",
        userType: "MLA",
        data: newMLA,
      });
    }

    if (isOrg) {
      const existing = await prisma.organization.findUnique({
        where: { contact_email: email },
      });
      if (existing)
        return res.status(409).json({ error: "Organization already exists" });

      const newOrg = await prisma.organization.create({
        data: { name, category: "General", contact_email: email },
      });

      return res.status(201).json({
        message: "Organization registered successfully",
        userType: "Organization",
        data: newOrg,
      });
    }

    // Default → Citizen
    const existingCitizen = await prisma.citizen.findUnique({ where: { email } });
    if (existingCitizen)
      return res.status(409).json({ error: "Citizen already exists" });

    const newCitizen = await prisma.citizen.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true },
    });

    return res.status(201).json({
      message: "Citizen registered successfully",
      userType: "Citizen",
      data: newCitizen,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


const JWT_SECRET = process.env.JWT_SECRET;

authHandler.post("/login", async (req, res) => {
  const { email, password, constituency } = req.body;

  try {
    const citizen = await prisma.citizen.findUnique({ where: { email } });
    if (!citizen) {
      return res.status(404).json({ message: "Citizen not found" });
    }

    const valid = await bcrypt.compare(password, citizen.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    
    const mlas = await prisma.mLA.findMany({ where: { constituency } });
    const orgs = await prisma.organization.findMany({ where: { constituency } });

    
    await prisma.citizen.update({
      where: { id: citizen.id },
      data: {
        linked_MLAs: { connect: mlas.map((mla) => ({ id: mla.id })) },
        linked_Organizations: { connect: orgs.map((org) => ({ id: org.id })) },
      },
    });

    
    const token = jwt.sign(
      {
        userId: citizen.id,
        email: citizen.email,
        role: "citizen",
      },
      JWT_SECRET!,
      { expiresIn: "7d" }
    );

    
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

