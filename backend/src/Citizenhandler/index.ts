import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
export const citizenHandler = Router();

// Health check
citizenHandler.get("/health", (req, res) => {
  return res.status(200).json({ message: "Citizen route up and running" });
});

citizenHandler.get("/details", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    
    const citizen = await prisma.citizen.findUnique({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
