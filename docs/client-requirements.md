# Brandspix Customer & Admin Portal: Information and Access Required

Prepared for: Brandspix  
Purpose: to list what we need from you to build, launch and run the portal, why we need each item, and what it means in plain terms.

## How this works

- **You own every account.** Please create the accounts below in the business's name. You may then invite us as a team member where the service allows it. We do not need, and will not ask for, your personal passwords.
- **Keys are shared securely.** Where a service gives you an "API key" (a private code that lets our software talk to that service), please share it through a password manager or a one-time secret link. Please do not send keys by email or chat.
- **Test first, live later.** Payment and similar services provide a safe "test mode" with pretend money. We build and check everything in test mode, and switch to live mode only at launch, with your approval.
- **Timing matters.** Items marked **Start early** involve verification by a third party that can take days or weeks.

---

## A. Business content and decisions (needed now)

| # | Item | What it is | Why we need it |
|---|---|---|---|
| A1 | Final list of services | The services customers can request (e.g. web, software, hosting, SEO, AI, SAP), each with a short description. | This fills the service catalogue customers browse. Our current entries are placeholders. |
| A2 | Deliverables and process steps per service | What the customer receives, and the steps you follow to deliver it. | Shown on each service page so customers know what to expect. |
| A3 | Starting prices | An indicative "from" price for each service, or "on request". | Displayed to customers before they submit a request. Final prices are set in each quotation. |
| A4 | Logo and brand assets | Logo files (PNG/SVG), brand colours, preferred font. | So the portal matches your brand. |
| A5 | Staff list | Name, email and role (Admin or Staff) of each team member who will manage the portal. | To create their admin accounts with the right level of access. |
| A6 | Business workflow rules | Who reviews new requests, expected response time, and whether an advance payment is required before work begins. | So the portal's statuses and notifications reflect how you actually work. |

## B. Legal and tax information (needed before quotations and invoices)

| # | Item | What it is | Why we need it |
|---|---|---|---|
| B1 | Legal business name and registered address | The name and address on your business registration. | Printed on quotations and invoices. |
| B2 | GSTIN (if registered), PAN and applicable tax rate(s) | Your tax registration numbers and the GST percentage you charge. | Invoices must carry correct tax details to be valid. |
| B3 | Invoice and quotation numbering format | For example INV-2026-0001. | So documents are numbered consistently and without gaps. |
| B4 | Terms of service, privacy policy and refund policy | Published pages setting out how you deal with customers and their data. | The payment gateway requires them before approval, and customers will be agreeing to them when they register. We can help draft the structure, but you should have them reviewed for legal accuracy. |

## C. Domain and hosting (needed before launch)

| # | Item | What it is | Why we need it |
|---|---|---|---|
| C1 | Access to your domain's DNS settings (brandspix.com) | DNS is the address book of the internet. It tells browsers where your site lives. This is managed where you bought the domain. | To place the portal at brandspix.com/portal and to verify your email sender (see D1). |
| C2 | Hosting account | The computer service that runs the portal 24/7 (e.g. Vercel, or a cloud server). | The portal must be online for customers to use it. |
| C3 | Managed database account | A secure, backed-up online database (e.g. Neon, Supabase, or a cloud provider). | Stores customers, requests, quotations, projects and payment records. Backups protect against data loss. |

## D. Communication services

| # | Item | What it is | Why we need it |
|---|---|---|---|
| D1 | Email sending service (e.g. Resend, Zoho, Amazon SES, SendGrid) | A service that sends automatic emails on behalf of your domain. | For password resets, email verification codes, quotation notices and status updates. Needs the domain access from C1 so emails come from your own address and don't land in spam. |
| D2 | Sender address | The address emails come from, e.g. no-reply@brandspix.com, plus a support address for replies. | So customers recognise and trust the messages. |
| D3 | SMS service (optional, later) | A service that sends text-message codes. | In India, SMS requires registration of message templates (DLT), which takes time. We recommend email-based verification first and adding SMS later if wanted. |

## E. File storage (needed before project delivery features)

| # | Item | What it is | Why we need it |
|---|---|---|---|
| E1 | Cloud storage account (AWS S3, or a lower-cost alternative such as Cloudflare R2) | Online storage for files, like a secure hard drive on the internet. | Holds customer attachments and final deliverables privately, and is required for the portal to run on modern hosting. |
| E2 | A private storage "bucket" and its access key | A bucket is a folder in that storage. The access key is a private code that lets our software use it. | So files can only be downloaded by the right customer or staff member. |

## F. Online payments (**Start early**)

| # | Item | What it is | Why we need it |
|---|---|---|---|
| F1 | Payment gateway account (Razorpay or Cashfree; please tell us your preference) | A licensed service that collects card, UPI and net-banking payments on your behalf. | So customers can pay advances and invoices inside the portal. Card details are handled by the gateway; they never touch our system or yours. |
| F2 | Business verification (KYC) | The gateway checks your business identity: PAN, bank account, GST details, website with policies (B4). | Required before live payments are enabled. It can take several days to weeks, so please begin as soon as possible. |
| F3 | Test keys, then live keys | Two private codes (a Key ID and a Key Secret) per mode. | Test keys let us build and verify payments safely; live keys are used only at launch. |
| F4 | Webhook secret | A shared password the gateway uses to prove that a "payment successful" message really came from it. | Prevents anyone from faking a payment. We confirm every payment this way, not just by what the customer's browser shows. |
| F5 | Bank account for settlements | The account where the gateway deposits collected money. | Entered by you directly with the gateway, never shared with us. |

## G. Ongoing costs to agree

| Cost | What it covers |
|---|---|
| Hosting and database | Keeping the portal online and the data backed up. |
| Storage and email | File storage and the cost of sending emails. |
| Payment gateway fees | A percentage of each online payment, charged by the gateway. |
| Domain renewal | Yearly renewal of brandspix.com. |

Please confirm who will hold and pay for these accounts.

---

## Suggested order

1. **Now:** A, B, and start F2 (payment verification).
2. **Before quotations go live:** D1, D2.
3. **Before project and file features:** E.
4. **Before launch:** C, live payment keys, and final sign-off on B4.
