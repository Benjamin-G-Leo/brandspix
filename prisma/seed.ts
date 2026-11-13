import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const services = [
  { slug: "web-design", name: "Web Design & Development", summary: "Fast, responsive websites and web apps.", priceFrom: 25000,
    description: "Custom marketing sites, e-commerce and web applications built for speed, accessibility and conversion.",
    deliverables: ["Responsive design", "CMS or admin panel", "SEO-ready markup", "Analytics set-up"],
    process: ["Discovery", "Design", "Build", "Review", "Launch"] },
  { slug: "software-development", name: "Software Development", summary: "Custom business software and integrations.", priceFrom: 60000,
    description: "Internal tools, customer platforms and API integrations tailored to your workflows.",
    deliverables: ["Requirements document", "Working software", "Documentation", "Deployment"],
    process: ["Scoping", "Architecture", "Sprints", "UAT", "Release"] },
  { slug: "hosting", name: "Hosting & Maintenance", summary: "Managed hosting, backups and monitoring.", priceFrom: 3000,
    description: "Secure managed hosting with SSL, daily backups, uptime monitoring and routine updates.",
    deliverables: ["Managed server", "SSL", "Daily backups", "Uptime monitoring"],
    process: ["Audit", "Migration", "Monitoring", "Monthly report"] },
  { slug: "seo", name: "SEO & Digital Marketing", summary: "Grow organic traffic and qualified leads.", priceFrom: 15000,
    description: "Technical SEO, content strategy and reporting to improve visibility and enquiries.",
    deliverables: ["Site audit", "Keyword plan", "On-page fixes", "Monthly reports"],
    process: ["Audit", "Strategy", "Implementation", "Reporting"] },
  { slug: "ai-automation", name: "AI Automation", summary: "Automate repetitive work with AI.", priceFrom: 40000,
    description: "Chatbots, document processing and workflow automation that save your team hours every week.",
    deliverables: ["Process analysis", "Automation build", "Training", "Support"],
    process: ["Assess", "Prototype", "Build", "Handover"] },
  { slug: "sap-solutions", name: "SAP Solutions", summary: "SAP consulting, implementation and support.", priceFrom: 100000,
    description: "SAP Business One and S/4HANA advisory, configuration, reporting and support.",
    deliverables: ["Fit-gap analysis", "Configuration", "Data migration", "Training"],
    process: ["Assess", "Blueprint", "Realise", "Go-live", "Support"] },
];

async function main() {
  for (const [i, s] of services.entries()) {
    await db.service.upsert({ where: { slug: s.slug }, update: { ...s, sortOrder: i }, create: { ...s, sortOrder: i } });
  }
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@brandspix.local").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    console.log("Services seeded. Set SEED_ADMIN_PASSWORD to also create the admin user.");
    return;
  }
  await db.user.upsert({
    where: { email },
    update: { passwordHash: await bcrypt.hash(password, 12), role: "ADMIN", active: true },
    create: { email, name: "Brandspix Admin", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`Services seeded. Admin user: ${email}`);
}

main().finally(() => db.$disconnect());
