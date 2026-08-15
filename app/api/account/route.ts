import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, apiToken: true, timezone: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const { name, timezone } = (await req.json()) as { name?: string; timezone?: string };

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name?.trim() ? { name: name.trim() } : {}),
      ...(timezone?.trim() ? { timezone: timezone.trim() } : {}),
    },
    select: { name: true, email: true, timezone: true },
  });

  return NextResponse.json(updated);
}
