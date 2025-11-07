import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
export const citizenHandler = Router();

// Health check
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

    return res.status(200).json({
      citizen: {
        id: citizen.id,
        name: citizen.name,
        email: citizen.email,
        constituency: citizen.constituency,
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
          mla: issue.mla ? {
            id: issue.mla.id,
            name: issue.mla.name,
            party: issue.mla.party,
          } : null,
          organization: issue.organization ? {
            id: issue.organization.id,
            name: issue.organization.name,
            category: issue.organization.category,
          } : null,
        })),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});



citizenHandler.get("/details", async (req, res) => {
  const { email } = req.query

  if (!email) {
    return res.status(400).json({ message: "Email is required" })
  }

  try {
    const citizen = await prisma.citizen.findUnique({
      where: { email: String(email) },
      include: {
        linked_MLAs: true,
        linked_Organizations: true,
        issues: true, 
      },
    })

    if (!citizen) {
      return res.status(404).json({ message: "Citizen not found" })
    }

    return res.status(200).json({
      citizen: {
        id: citizen.id,
        name: citizen.name,
        email: citizen.email,
        constituency: citizen.constituency || "Khairtabad",

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

        issues: (citizen.issues || []).map((issue) => ({
          id: issue.id,
          title: issue.title,
          description: issue.description,
          category: issue.category,
          mediaUrl: issue.mediaUrl,
          location: issue.location,
          status: issue.status,
          severity: issue.severity,
          citizenId: issue.citizenId,
          mlaId: issue.mlaId,
          organizationId: issue.organizationId,
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
        })),
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal server error" })
  }
})

export default citizenHandler



citizenHandler.post("/issue", async (req, res) => {
  const {
    update,
    issueId,
    title,
    description,
    category,
    mediaUrl,
    location,
    citizenId,
    mlaId,
    organizationId,
    status,
    severity,
  } = req.body;

  try {
   
    if (update) {
      if (!issueId || !status) {
        return res
          .status(400)
          .json({ message: "issueId and status are required for update" });
      }

      
      const existingIssue = await prisma.issue.findUnique({
        where: { id: issueId },
      });
      if (!existingIssue) {
        return res.status(404).json({ message: "Issue not found" });
      }

      const updatedIssue = await prisma.issue.update({
        where: { id: issueId },
        data: {
          status,
          ...(severity && { severity }),
          updatedAt: new Date(),
        },
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

    
    const citizenExists = await prisma.citizen.findUnique({ where: { id: citizenId } });
    if (!citizenExists) {
      return res.status(400).json({ message: "Invalid citizenId — Citizen not found" });
    }

    
    if (mlaId) {
      const mlaExists = await prisma.mLA.findUnique({ where: { id: mlaId } });
      if (!mlaExists) {
        return res.status(400).json({ message: "Invalid mlaId — MLA not found" });
      }
    }

    
    if (organizationId) {
      const orgExists = await prisma.organization.findUnique({ where: { id: organizationId } });
      if (!orgExists) {
        return res.status(400).json({ message: "Invalid organizationId — Organization not found" });
      }
    }

    
    const newIssue = await prisma.issue.create({
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
  } catch (error) {
    console.error("Error handling issue:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

