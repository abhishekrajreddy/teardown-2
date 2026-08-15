import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const token = `td_${crypto.randomBytes(24).toString("hex")}`;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { apiToken: token },
  });

  return NextResponse.json({ apiToken: token });
}
