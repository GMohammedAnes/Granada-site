import { createClerkClient } from "@clerk/backend";
import { getAuth } from "@clerk/express";
import type { RequestHandler } from "express";

const secretKey = process.env.CLERK_SECRET_KEY;
const clerkClient = secretKey ? createClerkClient({ secretKey }) : null;

export const requireGranadaStaff: RequestHandler = async (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Sign in to access staff orders." });
    return;
  }

  const staffEmail = process.env.GRANADA_STAFF_EMAIL?.trim().toLowerCase();
  if (!staffEmail || !clerkClient) {
    req.log.error("Granada staff access is not configured");
    res.status(503).json({ error: "Staff access is not configured." });
    return;
  }

  const user = await clerkClient.users.getUser(userId);
  const primaryEmail = user.primaryEmailAddress?.emailAddress
    .trim()
    .toLowerCase();

  if (primaryEmail !== staffEmail) {
    res.status(403).json({ error: "Staff access is required." });
    return;
  }

  next();
};
