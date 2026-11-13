import { readFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { getUser, isStaff } from "@/lib/session";
import { UPLOAD_DIR } from "@/lib/uploads";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const att = await db.attachment.findUnique({ where: { id }, include: { request: true } });
  // Customers may only download files from their own requests; staff may download any.
  if (!att || (!isStaff(user.role) && att.request.customerId !== user.id))
    return new Response("Not found", { status: 404 });
  const data = await readFile(path.join(UPLOAD_DIR, path.basename(att.storedName)));
  return new Response(data, {
    headers: {
      "Content-Type": att.mimeType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(att.fileName)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
