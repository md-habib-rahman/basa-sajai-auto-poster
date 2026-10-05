import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

function create() {
	// Aiven needs its CA passed in code. Strip query params (e.g. ?sslmode=require):
	// pg lets URL params override the ssl object, which would disable CA verification.
	const url = new URL(process.env.DATABASE_URL!);
	url.search = "";

	const ca =
		process.env.AIVEN_CA_CERT?.trim()

	if (!ca) throw new Error("Aiven CA missing: put ca.pem in the project root or set AIVEN_CA_CERT");

	const adapter = new PrismaPg({
		connectionString: url.toString(),
		ssl: { ca: ca, rejectUnauthorized: true },
		max: 2, // serverless: keep per-instance connections low (Aiven plans have connection limits)
	});
	return new PrismaClient({ adapter });
}

const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? create();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
