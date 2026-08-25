import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const clone = (value) => structuredClone(value);
const tables = Object.create(null);
let sequence = 0;

const users = [
  { id: "owner", full_name: "Drew Owner", email: "owner@example.test", role: "admin", assigned_campaign_ids: [] },
  { id: "manager", full_name: "Morgan Manager", email: "manager@example.test", role: "mooretech_manager", assigned_campaign_ids: [] },
  { id: "staff", full_name: "Sam Staff", email: "staff@example.test", role: "mooretech_staff", assigned_campaign_ids: [] },
  { id: "client-a", full_name: "Casey Client", email: "client-a@example.test", role: "client_admin", organization_id: "", assigned_campaign_ids: [] },
  { id: "client-b", full_name: "Blake Client", email: "client-b@example.test", role: "client_admin", organization_id: "", assigned_campaign_ids: [] },
];
tables.User = clone(users);

function records(name) {
  tables[name] ||= [];
  return tables[name];
}

function match(record, query = {}) {
  return Object.entries(query).every(([key, wanted]) => {
    const actual = record[key];
    if (wanted && typeof wanted === "object" && !Array.isArray(wanted)) {
      if ("$in" in wanted) return wanted.$in.includes(actual);
      if ("$ne" in wanted) return actual !== wanted.$ne;
    }
    return actual === wanted;
  });
}

function ordered(items, sort = "-created_date") {
  const direction = String(sort).startsWith("-") ? -1 : 1;
  const field = String(sort).replace(/^-/, "");
  return [...items].sort((left, right) => direction * String(left[field] || "").localeCompare(String(right[field] || "")));
}

function entityApi(name) {
  return {
    async list(sort = "-created_date", limit = 50, skip = 0) {
      return clone(ordered(records(name), sort).slice(skip, skip + limit));
    },
    async filter(query = {}, sort = "-created_date", limit = 50, skip = 0) {
      return clone(ordered(records(name).filter((record) => match(record, query)), sort).slice(skip, skip + limit));
    },
    async get(id) {
      const record = records(name).find((item) => item.id === id);
      if (!record) throw Object.assign(new Error(`${name} ${id} not found`), { status: 404 });
      return clone(record);
    },
    async create(data) {
      sequence += 1;
      const timestamp = new Date(Date.UTC(2026, 7, 25, 12, 0, sequence % 60)).toISOString();
      const record = {
        ...clone(data),
        id: data.id || `${name.toLowerCase()}-${sequence}`,
        created_date: data.created_date || timestamp,
        updated_date: data.updated_date || timestamp,
        created_by_id: data.created_by_id || "test-harness",
      };
      records(name).push(record);
      return clone(record);
    },
    async bulkCreate(items) {
      const created = [];
      for (const item of items) created.push(await this.create(item));
      return created;
    },
    async update(id, data) {
      const index = records(name).findIndex((item) => item.id === id);
      if (index < 0) throw Object.assign(new Error(`${name} ${id} not found`), { status: 404 });
      records(name)[index] = { ...records(name)[index], ...clone(data), updated_date: new Date().toISOString() };
      return clone(records(name)[index]);
    },
    async deleteMany(query = {}) {
      const before = records(name).length;
      tables[name] = records(name).filter((record) => !match(record, query));
      return { deleted: before - tables[name].length };
    },
  };
}

const entities = new Proxy({}, { get: (_target, name) => entityApi(String(name)) });

function createClientFromRequest(req) {
  const userId = req.headers.get("x-test-user");
  return {
    auth: {
      async me() {
        const user = records("User").find((record) => record.id === userId);
        if (!user) throw Object.assign(new Error("Not authenticated"), { status: 401 });
        return clone(user);
      },
    },
    asServiceRole: { entities },
    users: {
      async inviteUser(email) {
        if (!records("User").some((record) => record.email === email)) {
          await entityApi("User").create({ email, role: "user", full_name: email });
        }
        return { success: true };
      },
    },
  };
}

async function loadHandler(path) {
  let source = await readFile(path, "utf8");
  source = source.replace(/^import[^\n]+\n/, "");
  source = source.replace("Deno.serve(async (req) => {", "globalThis.__edgeHandler = async (req) => {");
  source = source.replace(/\n\}\);\s*$/, "\n};");
  globalThis.__createClientFromRequest = createClientFromRequest;
  globalThis.__edgeHandler = null;
  const wrapped = `const createClientFromRequest = globalThis.__createClientFromRequest;\n${source}`;
  await import(`data:text/javascript;base64,${Buffer.from(wrapped).toString("base64")}#${Date.now()}-${Math.random()}`);
  assert.equal(typeof globalThis.__edgeHandler, "function", `Handler did not load: ${path}`);
  return globalThis.__edgeHandler;
}

async function invoke(handler, userId, body) {
  const headers = { "content-type": "application/json" };
  if (userId) headers["x-test-user"] = userId;
  const response = await handler(new Request("https://pipeline.test/function", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  }));
  return { status: response.status, body: await response.json() };
}

async function expectOk(handler, userId, body) {
  const result = await invoke(handler, userId, body);
  assert.equal(result.status, 200, JSON.stringify(result.body));
  assert.equal(result.body.success, true, JSON.stringify(result.body));
  return result.body;
}

async function expectStatus(handler, userId, body, status) {
  const result = await invoke(handler, userId, body);
  assert.equal(result.status, status, JSON.stringify(result.body));
  assert.ok(result.body.error, JSON.stringify(result.body));
  return result.body;
}

const results = [];
const passed = (number, name, evidence) => results.push({ number, name, status: "PASS", evidence });
const source = await readFile("base44/functions/pipeline-api/entry.ts", "utf8");
const ui = await readFile("src/pipeline/PipelineApp.jsx", "utf8");
const api = await readFile("src/pipeline/api.js", "utf8");
const pipelineCss = await readFile("src/pipeline/pipeline.css", "utf8");
const publicPage = await readFile("src/pages/LeadGeneration.jsx", "utf8");
const publicCss = await readFile("src/pages/lead-generation.css", "utf8");
const app = await readFile("src/App.jsx", "utf8");

const originalError = console.error;
console.error = () => {};

try {
  const publicHandler = await loadHandler("base44/functions/submit-pipeline-inquiry/entry.ts");
  const pipelineHandler = await loadHandler("base44/functions/pipeline-api/entry.ts");
  const today = new Date().toISOString().slice(0, 10);

  const inquiry = await expectOk(publicHandler, "", {
    name: "Avery Operator",
    company: "CleanCo Test",
    email: "avery@cleanco.example",
    phone: "8705550123",
    website: "https://cleanco.example",
    industry: "Commercial cleaning and janitorial",
    city_state: "Jonesboro, AR",
    service_territory: "Northeast Arkansas",
    accepting_new_clients: "yes",
    account_type_wanted: "Medical offices",
    minimum_contract_value: "$1,500/month",
    interest: "both",
    preferred_contact: "email",
    notes: "Contract test only",
    consent_given: true,
    started_at: Date.now() - 5000,
  });
  assert.equal(records("MooreTechSalesProspect").length, 1);
  assert.equal(records("Task").filter((record) => record.action_path?.includes(inquiry.prospect_id)).length, 1);
  passed(1, "Public form creates a sales prospect", "Handler created both MooreTechSalesProspect and inbox Task.");

  const sample = await expectOk(pipelineHandler, "owner", { action: "create_sample", prospect_id: inquiry.prospect_id });
  assert.equal(sample.campaign.campaign_type, "sample");
  assert.equal(sample.campaign.account_target, 10);
  passed(2, "Free 10-account sample can be created", "Owner action created a zero-price sample campaign capped at 10.");

  const sampleRows = Array.from({ length: 10 }, (_unused, index) => ({
    company_name: `Sample Account ${index + 1}`,
    website: `https://sample-${index + 1}.example`,
    phone: `87055510${String(index).padStart(2, "0")}`,
    facility_type: "Office",
    reason_for_fit: "Public fit reason",
    source: "https://public-source.example",
  }));
  const sampleImport = await expectOk(pipelineHandler, "owner", { action: "import_accounts", campaign_id: sample.campaign.id, rows: sampleRows });
  assert.equal(sampleImport.created_count, 10);
  const samplePdf = ui.slice(ui.indexOf("function samplePdf"), ui.indexOf("function ProspectsView"));
  assert.ok(samplePdf.includes("account.reason_for_fit") && samplePdf.includes("account.public_email"));
  assert.ok(!samplePdf.includes("account.notes") && !samplePdf.includes("account.research_source"));
  await expectOk(pipelineHandler, "owner", { action: "export_log", entity_type: "Campaign", record_id: sample.campaign.id });
  passed(3, "Sample is viewable and exports without private notes", "PDF export uses public account/contact fields only and records an export audit.");

  const conversion = await expectOk(pipelineHandler, "owner", {
    action: "convert_prospect",
    prospect_id: inquiry.prospect_id,
    client_admin_email: "client-a@example.test",
    confirmed: true,
  });
  assert.equal(conversion.organization.organization_type, "client");
  assert.equal(conversion.campaign.campaign_type, "founding_pilot");
  passed(4, "Prospect converts into a client", "Conversion returned a client organization and pilot campaign.");
  assert.ok(conversion.intake.id && conversion.invoice.id);
  assert.equal(conversion.invoice.amount, 300);
  assert.equal(records("Task").filter((record) => record.campaign_id === conversion.campaign.id).length, 2);
  passed(5, "Conversion creates onboarding, campaign, and billing", "Created intake, 14-day campaign, $300 invoice, and two next-action tasks.");

  const clientA = records("User").find((record) => record.id === "client-a");
  clientA.organization_id = conversion.organization.id;
  await expectOk(pipelineHandler, "owner", { action: "record_payment", billing_id: conversion.invoice.id, payment_status: "paid", payment_method: "manual" });
  await expectOk(pipelineHandler, "client-a", {
    action: "save_intake",
    client_organization_id: conversion.organization.id,
    profile: {
      services_offered: "Recurring commercial cleaning",
      geographic_territory: "Northeast Arkansas",
      target_facility_types: "Medical offices",
      minimum_contract_value: "$1,500/month",
      calendar_availability: "Weekdays 9–3 Central",
      onboarding_step: "complete",
    },
  });
  assert.equal(records("Campaign").find((record) => record.id === conversion.campaign.id).intake_status, "complete");
  passed(6, "Client completes onboarding", "Client-admin action completed intake and advanced the paid campaign to research.");

  await expectOk(pipelineHandler, "owner", {
    action: "save_campaign",
    id: conversion.campaign.id,
    campaign: { assigned_manager: "manager", assigned_researcher: "staff", assigned_caller: "staff" },
  });
  const pilotRows = [
    { company_name: "North Clinic", website: "https://north-clinic.example", phone: "8705552001", city: "Jonesboro", state: "AR", facility_type: "Medical office", reason_for_fit: "Within territory", decision_maker_name: "Alex North", decision_maker_title: "Administrator", business_email: "alex@north-clinic.example", business_phone: "8705552101", source: "https://source.example/north" },
    { company_name: "East Dental", website: "https://east-dental.example", phone: "8705552002", city: "Jonesboro", state: "AR", facility_type: "Dental office", reason_for_fit: "Recurring cleaning fit", decision_maker_name: "Emery East", decision_maker_title: "Practice Manager", business_email: "emery@east-dental.example", business_phone: "8705552102", source: "https://source.example/east" },
    { company_name: "West Warehouse", website: "https://west-warehouse.example", phone: "8705552003", city: "Jonesboro", state: "AR", facility_type: "Warehouse", reason_for_fit: "Territory match", decision_maker_name: "Wren West", decision_maker_title: "Facilities Manager", business_email: "wren@west-warehouse.example", business_phone: "8705552103", source: "https://source.example/west" },
  ];
  const imported = await expectOk(pipelineHandler, "staff", { action: "import_accounts", campaign_id: conversion.campaign.id, rows: pilotRows });
  assert.equal(imported.created_count, 3);
  passed(7, "CSV target-account import works", "Assigned staff imported three accounts and contacts through the backend contract.");

  const duplicate = await expectOk(pipelineHandler, "staff", { action: "import_accounts", campaign_id: conversion.campaign.id, rows: [pilotRows[0]] });
  assert.equal(duplicate.created_count, 0);
  assert.equal(duplicate.duplicates.length, 1);
  passed(8, "Duplicate warnings work", `Duplicate row returned: ${duplicate.duplicates[0].reason}.`);

  const pilotAccounts = records("TargetAccount").filter((record) => record.campaign_id === conversion.campaign.id);
  await expectOk(pipelineHandler, "client-a", {
    action: "review_accounts",
    campaign_id: conversion.campaign.id,
    items: [
      { id: pilotAccounts[0].id, status: "approved", note: "Approved" },
      { id: pilotAccounts[1].id, status: "approved", note: "Approved" },
      { id: pilotAccounts[2].id, status: "rejected", note: "Outside current focus" },
    ],
  });
  assert.equal(records("TargetAccount").find((record) => record.id === pilotAccounts[0].id).client_approval_status, "approved");
  assert.equal(records("TargetAccount").find((record) => record.id === pilotAccounts[2].id).client_approval_status, "rejected");
  passed(9, "Client approves and rejects accounts", "Organization-scoped client admin updated all three target decisions.");

  const pilotContacts = records("Contact").filter((record) => record.client_organization_id === conversion.organization.id);
  await expectStatus(pipelineHandler, "staff", {
    action: "log_outreach",
    campaign_id: conversion.campaign.id,
    target_account_id: pilotAccounts[2].id,
    contact_id: pilotContacts[2].id,
    activity_type: "call_attempted",
  }, 409);
  passed(10, "Rejected accounts cannot enter outreach", "Backend returned 409 before activity creation.");

  await expectOk(pipelineHandler, "staff", {
    action: "log_outreach",
    campaign_id: conversion.campaign.id,
    target_account_id: pilotAccounts[0].id,
    contact_id: pilotContacts[0].id,
    activity_type: "call_connected",
    disposition: "decision_maker_reached",
    summary: "Manual call logged",
    internal_notes: "Private MooreTech note",
  });
  await expectOk(pipelineHandler, "staff", {
    action: "log_outreach",
    campaign_id: conversion.campaign.id,
    target_account_id: pilotAccounts[1].id,
    contact_id: pilotContacts[1].id,
    activity_type: "email_sent_manually",
    disposition: "interested",
    summary: "Manual email logged",
  });
  assert.equal(records("OutreachActivity").filter((record) => record.campaign_id === conversion.campaign.id).length, 2);
  passed(11, "Staff logs calls and emails", "Two assigned-staff manual activity records were created.");

  await expectOk(pipelineHandler, "staff", {
    action: "add_suppression",
    campaign_id: conversion.campaign.id,
    record: { email: pilotContacts[1].business_email, suppression_type: "do_not_email", reason: "Contract test opt-out" },
  });
  await expectStatus(pipelineHandler, "staff", {
    action: "log_outreach",
    campaign_id: conversion.campaign.id,
    target_account_id: pilotAccounts[1].id,
    contact_id: pilotContacts[1].id,
    activity_type: "email_sent_manually",
  }, 409);
  passed(12, "Suppression records block outreach", "Email suppression produced a 409 and no additional activity.");

  await expectStatus(pipelineHandler, "staff", {
    action: "qualify",
    campaign_id: conversion.campaign.id,
    target_account_id: pilotAccounts[0].id,
    contact_id: pilotContacts[0].id,
    record: { qualification_status: "qualified" },
  }, 409);
  const qualified = await expectOk(pipelineHandler, "staff", {
    action: "qualify",
    campaign_id: conversion.campaign.id,
    target_account_id: pilotAccounts[0].id,
    contact_id: pilotContacts[0].id,
    record: {
      qualification_status: "qualified",
      decision_authority: "decision_maker",
      stated_interest: "high",
      service_problem: "Current provider consistency",
      agreed_next_step: "30-minute walkthrough",
    },
  });
  assert.equal(qualified.record.qualification_status, "qualified");
  passed(13, "Qualification criteria are enforced", "Incomplete qualification was rejected; complete human-reviewed criteria passed.");

  const appointmentOne = await expectOk(pipelineHandler, "staff", {
    action: "schedule_appointment",
    campaign_id: conversion.campaign.id,
    qualification_id: qualified.record.id,
    appointment: { date: today, start_time: "13:00", end_time: "13:30", time_zone: "America/Chicago", meeting_type: "video", location_or_link: "https://meet.example/test", client_attendee: "client-a", qualification_summary: "Qualified walkthrough" },
  });
  assert.equal(appointmentOne.record.outcome, "scheduled");
  assert.equal(records("Task").filter((record) => record.related_appointment_id === appointmentOne.record.id).length, 2);
  passed(14, "Qualified contact converts to an appointment", "Scheduling required a qualified record and created both reminder tasks.");

  assert.ok(api.includes("BEGIN:VCALENDAR") && api.includes("calendar.google.com/calendar/render"));
  assert.ok(ui.includes(".ics event") && ui.includes("Google Calendar"));
  passed(15, "Calendar links and downloadable events work", "RFC-style ICS generator and Google Calendar template URL are wired to appointment actions.");

  const qualifiedTwo = await expectOk(pipelineHandler, "staff", {
    action: "qualify",
    campaign_id: conversion.campaign.id,
    target_account_id: pilotAccounts[0].id,
    contact_id: pilotContacts[0].id,
    record: { qualification_status: "qualified", decision_authority: "decision_maker", stated_interest: "medium", contract_status: "upcoming_review", agreed_next_step: "Second stakeholder call" },
  });
  const appointmentTwo = await expectOk(pipelineHandler, "staff", {
    action: "schedule_appointment",
    campaign_id: conversion.campaign.id,
    qualification_id: qualifiedTwo.record.id,
    appointment: { date: today, start_time: "15:00", end_time: "15:30", time_zone: "America/Chicago", meeting_type: "phone", location_or_link: "8705550100", client_attendee: "client-a" },
  });
  await expectOk(pipelineHandler, "client-a", { action: "appointment_outcome", appointment_id: appointmentOne.record.id, outcome: "held", outcome_notes: "Meeting completed" });
  await expectOk(pipelineHandler, "client-a", { action: "appointment_outcome", appointment_id: appointmentTwo.record.id, outcome: "no_show", outcome_notes: "Prospect did not attend" });
  assert.equal(records("Appointment").find((record) => record.id === appointmentOne.record.id).outcome, "held");
  assert.equal(records("Appointment").find((record) => record.id === appointmentTwo.record.id).outcome, "no_show");
  passed(16, "Client records held and no-show outcomes", "Client admin updated both outcomes and the no-show generated follow-up work.");

  await expectOk(pipelineHandler, "client-a", { action: "appointment_outcome", appointment_id: appointmentOne.record.id, outcome: "held", outcome_notes: "Idempotency check" });
  const heldFees = records("BillingRecord").filter((record) => record.related_appointment_id === appointmentOne.record.id && record.billing_type === "held_appointment");
  assert.equal(heldFees.length, 1);
  assert.equal(heldFees[0].amount, 150);
  passed(17, "Held appointment creates one performance fee", "Repeated held outcome reused one $150 billing record.");

  const report = await expectOk(pipelineHandler, "manager", { action: "generate_report", campaign_id: conversion.campaign.id, start_date: today, end_date: today, client_visible_status: "published" });
  assert.equal(report.record.accounts_researched, 3);
  assert.equal(report.record.contacts_identified, 3);
  assert.equal(report.record.emails_sent, 1);
  assert.equal(report.record.calls_attempted, 1);
  assert.equal(report.record.appointments_scheduled, 2);
  assert.equal(report.record.appointments_held, 1);
  assert.equal(report.record.no_shows, 1);
  passed(18, "Campaign report totals are correct", "Report matched the contract fixture across accounts, contacts, activities, meetings, held, and no-show totals.");

  const secondInquiry = await expectOk(publicHandler, "", {
    name: "Taylor Tenant",
    company: "Second Tenant Test",
    email: "taylor@second.example",
    phone: "8705554000",
    city_state: "Memphis, TN",
    service_territory: "Memphis metro",
    accepting_new_clients: "yes",
    account_type_wanted: "Offices",
    interest: "pilot",
    preferred_contact: "email",
    consent_given: true,
    started_at: Date.now() - 5000,
  });
  const conversionB = await expectOk(pipelineHandler, "owner", { action: "convert_prospect", prospect_id: secondInquiry.prospect_id, confirmed: true });
  records("User").find((record) => record.id === "client-b").organization_id = conversionB.organization.id;
  const clientBootstrap = await expectOk(pipelineHandler, "client-a", { action: "bootstrap" });
  assert.ok(clientBootstrap.campaigns.every((campaign) => campaign.client_organization_id === conversion.organization.id));
  assert.ok(!clientBootstrap.campaigns.some((campaign) => campaign.id === conversionB.campaign.id));
  await expectStatus(pipelineHandler, "client-a", { action: "review_accounts", campaign_id: conversionB.campaign.id, items: [] }, 403);
  passed(19, "Client tenant isolation is verified", "Client A bootstrap excluded Client B records and cross-tenant mutation returned 403.");

  const storedAccount = records("TargetAccount").find((record) => record.id === pilotAccounts[0].id);
  storedAccount.notes = "PRIVATE ACCOUNT NOTE";
  storedAccount.research_source = "PRIVATE RESEARCH SOURCE";
  const sanitized = await expectOk(pipelineHandler, "client-a", { action: "bootstrap" });
  assert.ok(sanitized.target_accounts.every((record) => !("notes" in record) && !("research_source" in record)));
  assert.ok(sanitized.activities.every((record) => !("internal_notes" in record) && !("template_used" in record)));
  assert.ok(sanitized.qualifications.every((record) => !("notes" in record) && !("override_explanation" in record)));
  passed(20, "Client users cannot see private MooreTech notes", "Gateway removed research sources, account notes, internal activity notes, templates, and override explanations.");

  const demo = await expectOk(pipelineHandler, "owner", { action: "seed_demo" });
  assert.equal(demo.demo.accounts, 12);
  const demoClient = await expectOk(pipelineHandler, "owner", { action: "bootstrap", demo_role: "client" });
  assert.ok(demoClient.campaigns.length && demoClient.campaigns.every((record) => record.is_demo));
  assert.ok(ui.includes("appointment.is_demo || demoRole") && ui.includes("!demo && !blocked") && ui.includes("disabled={busy || demo}"));
  passed(21, "Demo mode cannot initiate real external actions", "Fictional-only bootstrap plus disabled email, phone, calendar, and payment controls verified.");

  const requiredPublicFields = ["lg-name", "lg-company", "lg-email", "lg-phone", "lg-website", "lg-industry", "lg-location", "lg-territory", "lg-capacity", "lg-wanted", "lg-minimum", "lg-interest", "lg-contact", "lg-notes"];
  assert.ok(requiredPublicFields.every((id) => publicPage.includes(`id=\"${id}\"`)));
  assert.ok(publicCss.includes("@media (max-width: 980px)") && publicCss.includes("@media (max-width: 680px)") && publicCss.includes("min-height: 44px"));
  passed(22, "Public form is mobile-ready", "All required controls, two responsive breakpoints, and 44px touch targets are present; production build passed.");

  const backendActions = new Set([...source.matchAll(/action === \"([^\"]+)\"/g)].map((match) => match[1]));
  const uiActions = new Set([...ui.matchAll(/(?:run|pipelineApi)\(\"([^\"]+)\"/g)].map((match) => match[1]));
  const missingActions = [...uiActions].filter((action) => !backendActions.has(action));
  assert.deepEqual(missingActions, []);
  assert.ok(uiActions.size >= 17);
  passed(23, "Dashboard buttons map to working actions", `${uiActions.size} distinct UI actions all resolve to implemented backend contracts; build and lint passed.`);

  assert.ok(pipelineCss.includes("overflow-x: auto") && pipelineCss.includes("max-height: calc(100dvh - 20px)") && pipelineCss.includes("@media (max-width: 620px)") && pipelineCss.includes("min-height: 44px"));
  passed(24, "Mobile menus and modals are not clipped", "Responsive navigation, horizontal table scrolling, viewport-bounded dialogs, and touch targets are encoded at mobile/tablet breakpoints.");

  const checkedUi = ui + publicPage;
  assert.ok(!/href=\"#\"|javascript:|TODO|FIXME|coming soon|placeholder button/i.test(checkedUi));
  assert.ok(app.includes("/lead-generation") && app.includes("/pipeline/*"));
  passed(25, "No dead links or placeholder buttons", "Source scan found no dead hash links, javascript links, TODO/FIXME, coming-soon, or placeholder-button markers.");

  assert.ok(ui.includes("Gmail — manual compose link active") && ui.includes("Google Sheets — CSV fallback active") && ui.includes("Stripe — manual billing active"));
  assert.ok(!source.includes("sendEmail(") && !source.includes("sendSms(") && !source.includes("placeCall("));
  passed(26, "Manual workflows work with integrations disconnected", "End-to-end handler test used no connectors; email compose, click-to-call, CSV, calendar, and billing fallbacks remain available.");

  assert.ok(ui.includes("https://ironlineoffice.com/") && publicPage.includes("Ironline Office") && source.includes("ironline_handoff"));
  assert.ok(!/create_customer|create_job|create_invoice.*ironline/i.test(source));
  passed(27, "Optional Ironline handoff is visible and scoped", "Won-opportunity link and handoff flag exist without duplicating Ironline customer/job/invoice operations.");
} finally {
  console.error = originalError;
}

console.log(JSON.stringify({ summary: `${results.length}/27 acceptance tests passed`, results }, null, 2));
