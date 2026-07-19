import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const dataFile = path.join(process.cwd(), "data", "members.json");

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ["firstName", "lastName", "birthDate", "email", "phone", "address", "postalCode", "city", "membershipType", "emergencyName", "emergencyPhone"];

    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === "") {
        return NextResponse.json({ error: `Le champ ${field} est obligatoire.` }, { status: 400 });
      }
    }

    if (!isValidEmail(body.email)) {
      return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
    }

    if (body.consent !== true) {
      return NextResponse.json({ error: "Le consentement est obligatoire." }, { status: 400 });
    }

    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    let members: unknown[] = [];
    try {
      members = JSON.parse(await fs.readFile(dataFile, "utf8"));
      if (!Array.isArray(members)) members = [];
    } catch {
      members = [];
    }

    const member = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...body
    };

    members.push(member);
    await fs.writeFile(dataFile, JSON.stringify(members, null, 2), "utf8");

    return NextResponse.json({ success: true, id: member.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible d’enregistrer la demande." }, { status: 500 });
  }
}
