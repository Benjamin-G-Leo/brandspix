import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// Client's draft catalogue (requirements response, Nov 2026). Prices stay null ("Request a quote")
// until the owner approves package prices.
const services = [
  { slug: "web-design", name: "Website Design & Development", priceFrom: null,
    summary: "Business websites, landing pages, redesigns and e-commerce.",
    description: "Business websites, landing pages, responsive redesigns, and CMS or e-commerce integrations.",
    deliverables: ["Responsive website", "CMS or e-commerce set-up", "SEO-ready pages", "Launch support"],
    process: ["Discovery", "Design", "Build", "Review", "Launch"] },
  { slug: "software-development", name: "Custom Software & SaaS", priceFrom: null,
    summary: "Web applications, business systems and portals.",
    description: "Web-based applications, business systems, portals and workflow solutions built around your processes.",
    deliverables: ["Requirements document", "Working application", "Documentation", "Deployment"],
    process: ["Scoping", "Design", "Build in milestones", "Testing", "Release"] },
  { slug: "hosting", name: "Hosting, Domain & Maintenance", priceFrom: null,
    summary: "Deployment, maintenance, backups and support.",
    description: "Deployment, maintenance, backups, uptime monitoring and technical support packages.",
    deliverables: ["Hosting set-up", "Domain and SSL", "Backups", "Uptime monitoring", "Technical support"],
    process: ["Audit", "Set-up or migration", "Monitoring", "Ongoing support"] },
  { slug: "seo", name: "SEO & Digital Marketing", priceFrom: null,
    summary: "SEO audits, optimisation and marketing support.",
    description: "SEO audit, on-page optimisation, technical SEO and content or marketing support.",
    deliverables: ["SEO audit", "On-page optimisation", "Technical fixes", "Reporting"],
    process: ["Audit", "Strategy", "Implementation", "Reporting"] },
  { slug: "ai-automation", name: "AI & Automation", priceFrom: null,
    summary: "AI-assisted workflows, chatbots and automation.",
    description: "AI-assisted workflows, chatbots, process automation and integrations.",
    deliverables: ["Process review", "Automation build", "Integrations", "Handover and training"],
    process: ["Assess", "Prototype", "Build", "Handover"] },
  { slug: "sap-solutions", name: "SAP & Enterprise Services", priceFrom: null,
    summary: "SAP consulting, automation and enterprise workflows.",
    description: "SAP-related consulting, automation and enterprise workflow services, subject to capability and scope.",
    deliverables: ["Requirement assessment", "Solution proposal", "Implementation support"],
    process: ["Assess", "Propose", "Implement", "Support"] },
  { slug: "branding", name: "Branding & Creative Services", priceFrom: null,
    summary: "Brand identity, logos, graphics and digital creatives.",
    description: "Brand identity, logo design, graphics and digital creatives for print and online use.",
    deliverables: ["Concepts", "Final artwork files", "Brand usage guide (where applicable)"],
    process: ["Brief", "Concepts", "Revisions", "Final files"] },
  { slug: "it-consulting", name: "IT Consulting & Support", priceFrom: null,
    summary: "Technology consulting, troubleshooting and implementation support.",
    description: "Technology consulting, troubleshooting and implementation support for your business.",
    deliverables: ["Assessment", "Recommendations", "Hands-on support"],
    process: ["Consultation", "Assessment", "Action plan", "Support"] },
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
