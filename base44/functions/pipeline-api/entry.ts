import { createClientFromRequest } from "npm:@base44/sdk";

const clean = (value, max = 5000) =>
  String(value ?? "").trim().slice(0, max);
const norm = (value) => clean(value, 500).toLowerCase().replace(/\s+/g, " ");
const phoneKey = (value) => clean(value, 80).replace(/\D/g, "");
const emailKey = (value) => clean(value, 254).toLowerCase();
const today = () => new Date().toISOString().slice(0, 10);
const now = () => new Date().toISOString();
const addDays = (dateValue, days) => {
  const date = new Date(dateValue || Date.now());
  date.setUTCDate(date.getUTCDate() + days);
  return date;
};
const asArray = (value) => Array.isArray(value) ? value : [];
const valueOf = (user, key) => user?.[key] ?? user?.data?.[key];
const pick = (source, fields) =>
  Object.fromEntries(fields.filter((key) => source?.[key] !== undefined).map((key) => [key, source[key]]));
const omit = (source, fields) => {
  const copy = { ...source };
  fields.forEach((field) => delete copy[field]);
  return copy;
};
const jsonPreview = (value) => JSON.stringify(value ?? {}).slice(0, 3900);

const DEFAULT_CRITERIA =
  "The organization matches the agreed industry and territory; the contact makes or influences vendor decisions; the contact has acknowledged a relevant need, problem, review period, contract expiration, or interest; the contact voluntarily agrees to a specific meeting date and time; and the company is not excluded.";

const DEFAULT_SETTINGS = {
  company_name: "MooreTech Solutions LLC",
  service_name: "MooreTech Commercial Pipeline",
  owner_name: "Drew Moore",
  contact_email: "admin@ironlineoffice.com",
  contact_phone: "870-819-1018",
  phone_label: "Call or text",
  positioning_statement: "MooreTech helps commercial service companies build a predictable sales pipeline. We identify target accounts, reach the appropriate decision-makers, qualify opportunities, and schedule sales appointments.",
  primary_differentiator: "Exclusive opportunities built for your company—not recycled internet leads sold to multiple competitors.",
  featured_niche: "Commercial cleaning and janitorial",
  pilot_price: 300,
  per_held_appointment_fee: 150,
  pilot_account_target: 50,
  pilot_duration_days: 14,
  free_sample_account_limit: 10,
  limited_guarantee: "If an appointment does not satisfy the written qualification criteria agreed upon before the campaign, MooreTech will replace it. MooreTech does not guarantee that the prospect will purchase the client's services.",
  no_guarantee_disclaimer: "MooreTech does not guarantee sales, contracts, proposals, revenue, or return on investment.",
  default_opt_out_language: "Reply 'unsubscribe' and no further marketing emails will be sent.",
  payment_methods: "manual",
  stripe_connected: false,
  calendar_options: "Google Calendar link / downloadable .ics",
  default_qualification_criteria: DEFAULT_CRITERIA,
  setup_step: "business_details",
  setup_complete: false,
};

const DEFAULT_TEMPLATES = [
  {
    template_type: "client_acquisition_email",
    name: "MooreTech Client Acquisition Email",
    subject: "Commercial accounts in {{territory}}",
    body: "Hi {{first_name}},\n\nI’m Drew with MooreTech Solutions. We help commercial service companies identify businesses that match their ideal contract, reach the person responsible for vendor decisions, and schedule qualified sales conversations.\n\nI prepared a small sample of potential accounts for {{company_name}} in {{territory}}. I can send it at no charge. If the targeting looks right, we are opening a limited founding-client pilot covering 50 researched accounts and manual outreach.\n\nAre you currently taking on additional commercial work?\n\nDrew Moore\nMooreTech Solutions LLC\n870-819-1018\nadmin@ironlineoffice.com\n\nReply “unsubscribe” to stop future marketing emails.",
    merge_fields: "first_name, company_name, territory",
  },
  {
    template_type: "client_acquisition_call",
    name: "MooreTech Client Acquisition Call Opening",
    body: "Hi, this is Drew with MooreTech Solutions. We help commercial service companies identify local accounts and book meetings with the people who choose vendors. I put together a small target sample for your company in {{territory}}. Are you currently looking for additional commercial contracts?",
    merge_fields: "territory",
  },
  {
    template_type: "discovery_question",
    name: "Discovery Question",
    body: "What type of account is most profitable for you, and what is the smallest contract that would be worth sending someone to quote?",
    merge_fields: "",
  },
  {
    template_type: "cleaning_prospect_email",
    name: "Commercial Cleaning Prospect Email",
    subject: "Cleaning service review for {{prospect_company}}",
    body: "Hi {{first_name}},\n\nI’m reaching out on behalf of {{client_company}}, a commercial cleaning company serving {{territory}}. Based on publicly available information, {{prospect_company}} appears to operate a {{facility_type}} that may need recurring professional cleaning.\n\nDo you help review cleaning vendors for the facility? If so, would a short conversation or walkthrough be useful?\n\n{{sender_name}}\n{{client_company}}\n{{business_mailing_address}}\n\nReply “unsubscribe” and no further marketing emails will be sent.",
    merge_fields: "first_name, prospect_company, client_company, territory, facility_type, sender_name, business_mailing_address",
  },
  {
    template_type: "appointment_confirmation",
    name: "Appointment Confirmation",
    subject: "Confirmed: {{meeting_purpose}} — {{meeting_date}}",
    body: "Your meeting is scheduled.\n\nPurpose: {{meeting_purpose}}\nDate: {{meeting_date}}\nTime: {{meeting_time}} {{time_zone}}\nAttendees: {{attendees}}\nLocation/link: {{meeting_location}}\nQualification summary: {{qualification_summary}}\n\nTo reschedule, reply to this message or contact the meeting organizer.",
    merge_fields: "meeting_purpose, meeting_date, meeting_time, time_zone, attendees, meeting_location, qualification_summary",
  },
];

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const input = await req.json();
    const action = clean(input.action, 100);

    let user;
    try {
      user = await base44.auth.me();
    } catch {
      user = null;
    }
    if (!user) {
      return Response.json({ error: "Sign in is required." }, { status: 401 });
    }

    const db = base44.asServiceRole.entities;
    const role = valueOf(user, "role") || "user";
    const organizationId = valueOf(user, "organization_id") || "";
    const assignedCampaignIds = new Set(asArray(valueOf(user, "assigned_campaign_ids")));
    const isOwner = role === "admin";
    const isManager = role === "mooretech_manager";
    const isStaff = role === "mooretech_staff";
    const isClientAdmin = role === "client_admin";
    const isClientViewer = role === "client_viewer";
    const isInternal = isOwner || isManager || isStaff;

    const fail = (message, status = 400, details = undefined) => {
      const error = new Error(message);
      error.status = status;
      error.details = details;
      throw error;
    };
    const requireOwner = () => {
      if (!isOwner) fail("MooreTech Owner access is required.", 403);
    };
    const requireInternal = () => {
      if (!isInternal) fail("MooreTech staff access is required.", 403);
    };
    const list = (entityName, limit = 2000) => db[entityName].list("-created_date", limit, 0);
    const campaignAssigned = (campaign) =>
      isOwner ||
      assignedCampaignIds.has(campaign.id) ||
      campaign.assigned_manager === user.id ||
      campaign.assigned_researcher === user.id ||
      campaign.assigned_caller === user.id ||
      asArray(campaign.permitted_staff_user_ids).includes(user.id);
    const canReadCampaign = (campaign) =>
      campaignAssigned(campaign) ||
      ((isClientAdmin || isClientViewer) && campaign.client_organization_id === organizationId);
    const canWorkCampaign = (campaign) =>
      isOwner || ((isManager || isStaff) && campaignAssigned(campaign));
    const canManageCampaign = (campaign) =>
      isOwner || (isManager && campaignAssigned(campaign));

    const getCampaign = async (campaignId, mode = "read") => {
      if (!campaignId) fail("Campaign is required.");
      const campaign = await db.Campaign.get(campaignId);
      const allowed = mode === "manage"
        ? canManageCampaign(campaign)
        : mode === "work"
          ? canWorkCampaign(campaign)
          : canReadCampaign(campaign);
      if (!allowed) fail("You do not have access to this campaign.", 403);
      return campaign;
    };

    const audit = async ({
      entityType,
      recordId,
      auditAction,
      description,
      orgId = "",
      previousValue,
      newValue,
      isDemo = false,
    }) => db.AuditLog.create({
      organization_id: orgId,
      entity_type: entityType,
      record_id: recordId,
      action: auditAction,
      changed_by: user.id,
      changed_by_email: user.email || "",
      previous_value: previousValue ? jsonPreview(previousValue) : "",
      new_value: newValue ? jsonPreview(newValue) : "",
      description: clean(description, 2000),
      is_demo: isDemo,
    });

    const createTask = async (data) => db.Task.create({
      assigned_user_id: data.assigned_user_id || user.id,
      organization_id: data.organization_id || "",
      campaign_id: data.campaign_id || "",
      task_type: data.task_type || "other",
      due_date: data.due_date || now(),
      priority: data.priority || "medium",
      status: data.status || "open",
      related_account_id: data.related_account_id || "",
      related_contact_id: data.related_contact_id || "",
      related_appointment_id: data.related_appointment_id || "",
      title: clean(data.title, 240),
      notes: clean(data.notes, 2000),
      action_label: clean(data.action_label, 120),
      action_path: clean(data.action_path, 500),
      client_visible: Boolean(data.client_visible),
      permitted_staff_user_ids: asArray(data.permitted_staff_user_ids),
      is_demo: Boolean(data.is_demo),
    });

    const ensureSettings = async () => {
      const records = await db.MooreTechSettings.list("-created_date", 1, 0);
      return records[0] || db.MooreTechSettings.create(DEFAULT_SETTINGS);
    };

    const ensureTemplates = async () => {
      const records = await db.Template.list("-created_date", 100, 0);
      if (records.length) return records;
      return db.Template.bulkCreate(DEFAULT_TEMPLATES.map((template) => ({
        ...template,
        opt_out_language: "Reply 'unsubscribe' and no further marketing emails will be sent.",
        is_active: true,
      })));
    };

    const isSuppressed = async ({ clientOrganizationId, contact, account, activityType }) => {
      const records = await db.SuppressionRecord.list("-created_date", 5000, 0);
      const email = emailKey(contact?.business_email || account?.public_email);
      const phone = phoneKey(contact?.business_phone || account?.phone);
      const company = norm(account?.company_name);
      const applicable = records.filter((record) =>
        !record.client_organization_id || record.client_organization_id === clientOrganizationId
      );
      const matches = applicable.filter((record) =>
        (email && emailKey(record.email) === email) ||
        (phone && phoneKey(record.phone) === phone) ||
        (company && norm(record.company) === company)
      );
      const emailAction = ["email_drafted", "email_sent_manually"].includes(activityType);
      const callAction = ["call_attempted", "call_connected", "voicemail"].includes(activityType);
      const blocked = matches.find((record) =>
        record.suppression_type === "do_not_contact" ||
        (emailAction && record.suppression_type === "do_not_email") ||
        (callAction && record.suppression_type === "do_not_call")
      );
      return blocked || null;
    };

    const resetDemoData = async () => {
      const ordered = [
        "AuditLog", "Task", "BillingRecord", "Report", "Appointment",
        "QualificationRecord", "OutreachActivity", "Contact", "TargetAccount",
        "SuppressionRecord", "Campaign", "ClientIntakeProfile", "Organization",
      ];
      const deleted = {};
      for (const entityName of ordered) {
        const result = await db[entityName].deleteMany({ is_demo: true });
        deleted[entityName] = result?.deleted || 0;
      }
      return deleted;
    };

    if (action === "bootstrap") {
      const settings = await ensureSettings();
      const templates = isInternal ? await ensureTemplates() : [];
      const names = [
        "Organization", "MooreTechSalesProspect", "ClientIntakeProfile", "Campaign",
        "TargetAccount", "Contact", "OutreachActivity", "QualificationRecord",
        "Appointment", "Task", "SuppressionRecord", "Report", "BillingRecord",
      ];
      const values = await Promise.all(names.map((name) => list(name)));
      const all = Object.fromEntries(names.map((name, index) => [name, values[index]]));
      const allUsers = isOwner ? await db.User.list("-created_date", 500, 0) : [];
      const auditLogs = isOwner ? await db.AuditLog.list("-created_date", 500, 0) : [];

      let campaigns = all.Campaign.filter(canReadCampaign);
      if (isOwner && input.demo_role) {
        campaigns = campaigns.filter((campaign) => campaign.is_demo);
      }
      const campaignIds = new Set(campaigns.map((campaign) => campaign.id));
      const orgIds = new Set(campaigns.map((campaign) => campaign.client_organization_id));
      if (organizationId) orgIds.add(organizationId);
      const inCampaign = (record) => !record.campaign_id || campaignIds.has(record.campaign_id);
      const inOrg = (record, field = "client_organization_id") =>
        !record[field] || orgIds.has(record[field]);

      let organizations = all.Organization.filter((record) => orgIds.has(record.id));
      let prospects = isOwner ? all.MooreTechSalesProspect : [];
      let intakeProfiles = all.ClientIntakeProfile.filter((record) => inOrg(record));
      let targetAccounts = all.TargetAccount.filter((record) => inCampaign(record) && inOrg(record));
      let contacts = all.Contact.filter((record) => inOrg(record));
      const accountIds = new Set(targetAccounts.map((record) => record.id));
      contacts = contacts.filter((record) => accountIds.has(record.target_account_id));
      const contactIds = new Set(contacts.map((record) => record.id));
      let activities = all.OutreachActivity.filter((record) => inCampaign(record) && inOrg(record));
      let qualifications = all.QualificationRecord.filter((record) => inCampaign(record) && inOrg(record));
      let appointments = all.Appointment.filter((record) => inCampaign(record) && inOrg(record));
      let tasks = all.Task.filter((record) => {
        if (isOwner) return true;
        if (isManager || isStaff) {
          return record.assigned_user_id === user.id || campaignIds.has(record.campaign_id);
        }
        return record.organization_id === organizationId && record.client_visible;
      });
      let suppressions = isInternal
        ? all.SuppressionRecord.filter((record) => !record.client_organization_id || orgIds.has(record.client_organization_id))
        : [];
      let reports = all.Report.filter((record) => inCampaign(record) && inOrg(record));
      let billing = (isStaff ? [] : all.BillingRecord.filter((record) => inCampaign(record) && inOrg(record)));

      if (isClientAdmin || isClientViewer || (isOwner && input.demo_role === "client")) {
        organizations = organizations.map((record) => omit(record, ["notes", "source", "permitted_staff_user_ids"]));
        campaigns = campaigns.map((record) => omit(record, [
          "campaign_notes", "assigned_manager", "assigned_researcher", "assigned_caller", "permitted_staff_user_ids",
        ]));
        intakeProfiles = intakeProfiles.map((record) => omit(record, ["notes", "permitted_staff_user_ids"]));
        targetAccounts = targetAccounts.map((record) => omit(record, ["research_source", "notes", "permitted_staff_user_ids"]));
        contacts = contacts.map((record) => omit(record, ["contact_source", "notes", "permitted_staff_user_ids"]));
        activities = activities.map((record) => omit(record, ["internal_notes", "template_used", "permitted_staff_user_ids"]));
        qualifications = qualifications.map((record) => omit(record, ["notes", "override_explanation", "permitted_staff_user_ids"]));
        appointments = appointments.map((record) => omit(record, ["permitted_staff_user_ids"]));
        reports = reports.filter((record) => record.client_visible_status !== "draft");
        billing = billing.map((record) => omit(record, ["notes", "stripe_reference", "permitted_staff_user_ids"]));
        suppressions = [];
        prospects = [];
      }

      return Response.json({
        success: true,
        user: {
          id: user.id,
          name: user.full_name || user.name || user.email,
          email: user.email,
          role: input.demo_role && isOwner ? `demo_${input.demo_role}` : role,
          actual_role: role,
          organization_id: organizationId,
        },
        capabilities: {
          owner: isOwner,
          internal: isInternal,
          manager: isManager,
          staff: isStaff,
          client_admin: isClientAdmin,
          client_viewer: isClientViewer,
          demo_simulation: Boolean(input.demo_role && isOwner),
        },
        settings: isOwner ? settings : {
          company_name: settings.company_name,
          service_name: settings.service_name,
          contact_email: settings.contact_email,
          contact_phone: settings.contact_phone,
          phone_label: settings.phone_label,
          limited_guarantee: settings.limited_guarantee,
          no_guarantee_disclaimer: settings.no_guarantee_disclaimer,
        },
        templates,
        users: allUsers.map((record) => pick(record, [
          "id", "full_name", "name", "email", "role", "phone", "organization_id",
          "job_title", "active", "assigned_campaign_ids", "last_login",
        ])),
        organizations,
        prospects,
        intake_profiles: intakeProfiles,
        campaigns,
        target_accounts: targetAccounts,
        contacts,
        activities,
        qualifications,
        appointments,
        tasks,
        suppressions,
        reports,
        billing,
        audit_logs: auditLogs,
      });
    }

    if (action === "save_prospect") {
      requireOwner();
      const data = pick(input.prospect || {}, [
        "company", "owner_or_decision_maker", "industry", "city", "state", "website",
        "phone", "email", "lead_source", "current_sales_process", "capacity_for_new_business",
        "estimated_fit", "personalized_observation", "sales_stage", "last_contact",
        "next_follow_up", "notes", "free_sample_status", "preferred_contact_method",
      ]);
      if (!clean(data.company, 200)) fail("Company name is required.");
      let record;
      if (input.id) {
        const previous = await db.MooreTechSalesProspect.get(input.id);
        record = await db.MooreTechSalesProspect.update(input.id, data);
        await audit({ entityType: "MooreTechSalesProspect", recordId: record.id, auditAction: "update", description: "Updated MooreTech sales prospect.", previousValue: previous, newValue: data });
      } else {
        record = await db.MooreTechSalesProspect.create({
          ...data,
          sales_stage: data.sales_stage || "new",
          estimated_fit: data.estimated_fit || "unknown",
        });
        await audit({ entityType: "MooreTechSalesProspect", recordId: record.id, auditAction: "create", description: "Created MooreTech sales prospect.", newValue: data });
      }
      return Response.json({ success: true, record });
    }

    if (action === "create_sample") {
      requireOwner();
      const prospect = await db.MooreTechSalesProspect.get(input.prospect_id);
      if (prospect.sample_campaign_id) {
        const existing = await db.Campaign.get(prospect.sample_campaign_id);
        return Response.json({ success: true, campaign: existing, reused: true });
      }
      let mooreTechOrg = (await db.Organization.filter({ organization_type: "mooretech" }, "-created_date", 1, 0))[0];
      if (!mooreTechOrg) {
        mooreTechOrg = await db.Organization.create({
          organization_name: "MooreTech Solutions LLC",
          organization_type: "mooretech",
          industry: "Technology and lead generation",
          primary_phone: "870-819-1018",
          primary_email: "admin@ironlineoffice.com",
          status: "active",
          owner: "Drew Moore",
          source: "system",
          permitted_staff_user_ids: [user.id],
          is_demo: false,
        });
      }
      const campaign = await db.Campaign.create({
        client_organization_id: mooreTechOrg.id,
        campaign_name: `Free 10-account sample — ${prospect.company}`,
        service_promoted: "Preliminary account research",
        territory: [prospect.city, prospect.state].filter(Boolean).join(", "),
        campaign_status: "researching",
        account_target: 10,
        price: 0,
        per_held_appointment_fee: 0,
        assigned_manager: user.id,
        qualification_criteria: DEFAULT_CRITERIA,
        client_approval_status: "approved",
        campaign_type: "sample",
        sales_prospect_id: prospect.id,
        intake_status: "complete",
        payment_status: "not_required",
        permitted_staff_user_ids: [user.id],
        is_demo: false,
      });
      await db.MooreTechSalesProspect.update(prospect.id, {
        sample_campaign_id: campaign.id,
        free_sample_status: "in_progress",
        sales_stage: "free_sample_requested",
      });
      await audit({ entityType: "Campaign", recordId: campaign.id, auditAction: "create", description: "Created a free 10-account sample.", orgId: mooreTechOrg.id, newValue: campaign });
      return Response.json({ success: true, campaign });
    }

    if (action === "mark_sample_delivered") {
      requireOwner();
      const campaign = await getCampaign(input.campaign_id, "manage");
      if (campaign.campaign_type !== "sample") fail("This is not a sample campaign.");
      await db.Campaign.update(campaign.id, { campaign_status: "completed" });
      if (campaign.sales_prospect_id) {
        await db.MooreTechSalesProspect.update(campaign.sales_prospect_id, {
          free_sample_status: "delivered",
          sales_stage: "free_sample_delivered",
        });
      }
      await audit({ entityType: "Campaign", recordId: campaign.id, auditAction: "status_change", description: "Marked free sample delivered.", orgId: campaign.client_organization_id });
      return Response.json({ success: true });
    }

    if (action === "convert_prospect") {
      requireOwner();
      if (input.confirmed !== true) fail("Conversion confirmation is required.");
      const prospect = await db.MooreTechSalesProspect.get(input.prospect_id);
      if (prospect.converted_organization_id) fail("This prospect has already been converted.");
      const settings = await ensureSettings();
      const start = new Date();
      const end = addDays(start, Number(settings.pilot_duration_days || 14));
      const org = await db.Organization.create({
        organization_name: prospect.company,
        organization_type: "client",
        industry: prospect.industry || "Commercial cleaning and janitorial",
        website: prospect.website || "",
        primary_phone: prospect.phone || "",
        primary_email: prospect.email || "",
        territory: [prospect.city, prospect.state].filter(Boolean).join(", "),
        status: "onboarding",
        owner: prospect.owner_or_decision_maker || "",
        assigned_campaign_manager: user.id,
        source: "converted_pipeline_prospect",
        permitted_staff_user_ids: [user.id],
        notes: prospect.notes || "",
        is_demo: false,
      });
      const intake = await db.ClientIntakeProfile.create({
        client_organization_id: org.id,
        geographic_territory: org.territory,
        sales_contact: prospect.owner_or_decision_maker || "",
        onboarding_step: "business_info",
        is_demo: false,
      });
      const campaign = await db.Campaign.create({
        client_organization_id: org.id,
        campaign_name: `${prospect.company} — Founding Client Pilot`,
        service_promoted: "Commercial cleaning and janitorial",
        territory: org.territory,
        start_date: start.toISOString().slice(0, 10),
        end_date: end.toISOString().slice(0, 10),
        campaign_status: "awaiting_intake",
        account_target: Number(settings.pilot_account_target || 50),
        price: Number(settings.pilot_price || 300),
        per_held_appointment_fee: Number(settings.per_held_appointment_fee || 150),
        assigned_manager: user.id,
        qualification_criteria: settings.default_qualification_criteria || DEFAULT_CRITERIA,
        client_approval_status: "pending",
        campaign_type: "founding_pilot",
        sales_prospect_id: prospect.id,
        intake_status: "not_started",
        payment_status: "awaiting_payment",
        permitted_staff_user_ids: [user.id],
        is_demo: false,
      });
      const invoice = await db.BillingRecord.create({
        client_organization_id: org.id,
        campaign_id: campaign.id,
        billing_type: "pilot_setup",
        description: "Founding Client Pilot — 14-day campaign",
        amount: Number(settings.pilot_price || 300),
        due_date: today(),
        payment_status: "unpaid",
        payment_method: "manual",
        invoice_number: `MCP-${Date.now().toString().slice(-8)}`,
        permitted_staff_user_ids: [user.id],
        is_demo: false,
      });
      await db.MooreTechSalesProspect.update(prospect.id, {
        converted_organization_id: org.id,
        sales_stage: "converted_to_client",
      });
      await createTask({
        assigned_user_id: user.id,
        organization_id: org.id,
        campaign_id: campaign.id,
        task_type: "approval",
        priority: "high",
        title: `Client onboarding needed — ${org.organization_name}`,
        action_label: "Open onboarding",
        action_path: `/pipeline/onboarding?campaign=${campaign.id}`,
      });
      await createTask({
        assigned_user_id: user.id,
        organization_id: org.id,
        campaign_id: campaign.id,
        task_type: "billing",
        priority: "high",
        title: `Pilot invoice awaiting payment — ${org.organization_name}`,
        action_label: "Open billing",
        action_path: `/pipeline/billing?invoice=${invoice.id}`,
      });
      await audit({ entityType: "Organization", recordId: org.id, auditAction: "create", description: "Converted sales prospect into a client organization.", orgId: org.id, newValue: { org, campaign, invoice } });
      return Response.json({
        success: true,
        organization: org,
        intake,
        campaign,
        invoice,
        invitation: {
          email: input.client_admin_email || prospect.email,
          path: `/pipeline/onboarding?organization=${org.id}&campaign=${campaign.id}`,
          generated_only: true,
        },
      });
    }

    if (action === "save_campaign") {
      requireInternal();
      const data = pick(input.campaign || {}, [
        "client_organization_id", "campaign_name", "service_promoted", "territory",
        "start_date", "end_date", "campaign_status", "account_target", "price",
        "per_held_appointment_fee", "assigned_manager", "assigned_researcher",
        "assigned_caller", "qualification_criteria", "client_approval_status",
        "campaign_notes", "campaign_type", "intake_status", "payment_status",
      ]);
      if (input.id) {
        const previous = await getCampaign(input.id, "manage");
        const record = await db.Campaign.update(input.id, {
          ...data,
          permitted_staff_user_ids: [
            data.assigned_manager, data.assigned_researcher, data.assigned_caller,
          ].filter(Boolean),
        });
        await audit({ entityType: "Campaign", recordId: record.id, auditAction: "update", description: "Updated campaign.", orgId: record.client_organization_id, previousValue: previous, newValue: data, isDemo: record.is_demo });
        return Response.json({ success: true, record });
      }
      if (!isOwner) fail("Only the MooreTech Owner can create an unassigned campaign.", 403);
      if (!data.client_organization_id || !data.campaign_name) fail("Client and campaign name are required.");
      const record = await db.Campaign.create({
        ...data,
        campaign_status: data.campaign_status || "draft",
        campaign_type: data.campaign_type || "service",
        permitted_staff_user_ids: [
          data.assigned_manager, data.assigned_researcher, data.assigned_caller,
        ].filter(Boolean),
        is_demo: false,
      });
      await audit({ entityType: "Campaign", recordId: record.id, auditAction: "create", description: "Created campaign.", orgId: record.client_organization_id, newValue: record });
      return Response.json({ success: true, record });
    }

    if (action === "save_intake") {
      const requestedOrgId = input.client_organization_id || organizationId;
      const profiles = await db.ClientIntakeProfile.filter({ client_organization_id: requestedOrgId }, "-created_date", 1, 0);
      const profile = profiles[0];
      if (!profile) fail("Client intake profile was not found.", 404);
      const campaigns = await db.Campaign.filter({ client_organization_id: requestedOrgId }, "-created_date", 50, 0);
      const allowed = isOwner ||
        (isManager && campaigns.some(campaignAssigned)) ||
        (isClientAdmin && requestedOrgId === organizationId);
      if (!allowed) fail("You cannot update this client intake.", 403);
      const data = pick(input.profile || {}, [
        "services_offered", "most_profitable_service", "geographic_territory",
        "best_existing_customer_types", "poor_fit_customer_types", "minimum_contract_value",
        "preferred_industries", "target_facility_types", "preferred_decision_maker_titles",
        "current_customer_exclusions", "competitor_exclusions", "maximum_new_client_capacity",
        "calendar_availability", "sales_contact", "qualification_questions",
        "disqualifying_criteria", "onboarding_step", "notes",
      ]);
      const previous = { ...profile };
      const updated = await db.ClientIntakeProfile.update(profile.id, data);
      if (data.onboarding_step === "complete") {
        for (const campaign of campaigns) {
          const nextStatus = campaign.payment_status === "paid" ? "researching" : "awaiting_payment";
          await db.Campaign.update(campaign.id, { intake_status: "complete", campaign_status: nextStatus });
        }
        const org = await db.Organization.get(requestedOrgId);
        await db.Organization.update(org.id, { status: "active" });
      } else {
        for (const campaign of campaigns) {
          await db.Campaign.update(campaign.id, { intake_status: "in_progress" });
        }
      }
      await audit({ entityType: "ClientIntakeProfile", recordId: profile.id, auditAction: "update", description: `Saved onboarding step: ${data.onboarding_step || "in_progress"}.`, orgId: requestedOrgId, previousValue: previous, newValue: data, isDemo: profile.is_demo });
      return Response.json({ success: true, profile: updated });
    }

    if (action === "add_account") {
      requireInternal();
      const campaign = await getCampaign(input.campaign_id, "work");
      const data = pick(input.account || {}, [
        "company_name", "website", "phone", "public_email", "address", "city", "state",
        "industry", "facility_type", "estimated_company_size", "estimated_fit_score",
        "reason_for_fit", "research_source", "research_date", "notes",
      ]);
      if (!clean(data.company_name, 200)) fail("Company name is required.");
      const existing = await db.TargetAccount.filter({ campaign_id: campaign.id }, "-created_date", 5000, 0);
      if (campaign.campaign_type === "sample" && existing.length >= 10) {
        fail("Free samples are limited to 10 target accounts.");
      }
      const duplicate = existing.find((record) =>
        (norm(record.company_name) === norm(data.company_name) && norm(record.website) === norm(data.website) && norm(data.website)) ||
        (norm(record.company_name) === norm(data.company_name) && phoneKey(record.phone) === phoneKey(data.phone) && phoneKey(data.phone))
      );
      if (duplicate) {
        return Response.json({ success: false, duplicate: true, duplicate_record: duplicate });
      }
      const account = await db.TargetAccount.create({
        ...data,
        client_organization_id: campaign.client_organization_id,
        campaign_id: campaign.id,
        research_date: data.research_date || today(),
        client_approval_status: campaign.campaign_type === "sample" ? "approved" : "pending_review",
        outreach_status: "not_started",
        assigned_staff_member: user.id,
        permitted_staff_user_ids: asArray(campaign.permitted_staff_user_ids),
        is_demo: Boolean(campaign.is_demo),
      });
      let contact = null;
      if (input.contact && (input.contact.first_name || input.contact.business_email || input.contact.business_phone)) {
        contact = await db.Contact.create({
          ...pick(input.contact, [
            "first_name", "last_name", "job_title", "role_in_decision", "business_email",
            "business_phone", "extension", "contact_source", "verification_status",
            "verification_date", "preferred_contact_method", "consent_to_text_status",
          ]),
          client_organization_id: campaign.client_organization_id,
          target_account_id: account.id,
          permitted_staff_user_ids: asArray(campaign.permitted_staff_user_ids),
          is_demo: Boolean(campaign.is_demo),
        });
      }
      await audit({ entityType: "TargetAccount", recordId: account.id, auditAction: "create", description: "Added researched target account.", orgId: campaign.client_organization_id, newValue: account, isDemo: campaign.is_demo });
      return Response.json({ success: true, account, contact });
    }

    if (action === "import_accounts") {
      requireInternal();
      const campaign = await getCampaign(input.campaign_id, "work");
      const rows = asArray(input.rows).slice(0, campaign.campaign_type === "sample" ? 10 : 500);
      if (!rows.length) fail("No import rows were provided.");
      const existingAccounts = await db.TargetAccount.filter({ campaign_id: campaign.id }, "-created_date", 5000, 0);
      const existingContacts = await db.Contact.filter({ client_organization_id: campaign.client_organization_id }, "-created_date", 5000, 0);
      const created = [];
      const duplicates = [];
      for (const row of rows) {
        if (campaign.campaign_type === "sample" && existingAccounts.length + created.length >= 10) {
          duplicates.push({ row, reason: "Free sample 10-account limit reached" });
          continue;
        }
        const companyName = clean(row.company_name || row["Company name"], 200);
        const website = clean(row.website || row.Website, 500);
        const phone = clean(row.phone || row.Phone, 50);
        const email = emailKey(row.business_email || row["Business email"]);
        const contactPhone = phoneKey(row.business_phone || row["Business phone"]);
        if (!companyName) {
          duplicates.push({ row, reason: "Missing company name" });
          continue;
        }
        const accountDuplicate = [...existingAccounts, ...created.map((item) => item.account)].find((record) =>
          (norm(record.company_name) === norm(companyName) && norm(website) && norm(record.website) === norm(website)) ||
          (norm(record.company_name) === norm(companyName) && phoneKey(phone) && phoneKey(record.phone) === phoneKey(phone))
        );
        const contactDuplicate = existingContacts.find((record) =>
          (email && emailKey(record.business_email) === email) ||
          (contactPhone && phoneKey(record.business_phone) === contactPhone)
        );
        if (accountDuplicate || contactDuplicate) {
          duplicates.push({ row, reason: accountDuplicate ? "Duplicate company/website or company/phone" : "Duplicate contact email or phone" });
          continue;
        }
        const account = await db.TargetAccount.create({
          client_organization_id: campaign.client_organization_id,
          campaign_id: campaign.id,
          company_name: companyName,
          website,
          phone,
          city: clean(row.city || row.City, 120),
          state: clean(row.state || row.State, 120),
          industry: clean(row.industry || row.Industry, 120),
          facility_type: clean(row.facility_type || row["Facility type"], 120),
          reason_for_fit: clean(row.reason_for_fit || row["Reason for fit"], 2000),
          research_source: clean(row.source || row.Source, 500),
          research_date: today(),
          client_approval_status: campaign.campaign_type === "sample" ? "approved" : "pending_review",
          outreach_status: "not_started",
          assigned_staff_member: user.id,
          permitted_staff_user_ids: asArray(campaign.permitted_staff_user_ids),
          is_demo: Boolean(campaign.is_demo),
        });
        let contact = null;
        if (row.decision_maker_name || row["Decision-maker name"] || email || contactPhone) {
          const fullName = clean(row.decision_maker_name || row["Decision-maker name"], 240).split(/\s+/);
          contact = await db.Contact.create({
            client_organization_id: campaign.client_organization_id,
            target_account_id: account.id,
            first_name: fullName.shift() || "",
            last_name: fullName.join(" "),
            job_title: clean(row.decision_maker_title || row["Decision-maker title"], 200),
            role_in_decision: "unknown",
            business_email: email,
            business_phone: clean(row.business_phone || row["Business phone"], 50),
            contact_source: clean(row.source || row.Source, 500),
            verification_status: "unverified",
            consent_to_text_status: "not_applicable",
            permitted_staff_user_ids: asArray(campaign.permitted_staff_user_ids),
            is_demo: Boolean(campaign.is_demo),
          });
          existingContacts.push(contact);
        }
        created.push({ account, contact });
      }
      await audit({ entityType: "TargetAccount", recordId: campaign.id, auditAction: "create", description: `Imported ${created.length} target accounts; flagged ${duplicates.length} duplicate or invalid rows.`, orgId: campaign.client_organization_id, newValue: { created: created.length, duplicates: duplicates.length }, isDemo: campaign.is_demo });
      return Response.json({ success: true, created_count: created.length, duplicates });
    }

    if (action === "add_contact") {
      requireInternal();
      const account = await db.TargetAccount.get(input.target_account_id);
      const campaign = await getCampaign(account.campaign_id, "work");
      const data = pick(input.contact || {}, [
        "first_name", "last_name", "job_title", "role_in_decision", "business_email",
        "business_phone", "extension", "contact_source", "verification_status",
        "verification_date", "preferred_contact_method", "consent_to_text_status",
      ]);
      const contacts = await db.Contact.filter({ client_organization_id: campaign.client_organization_id }, "-created_date", 5000, 0);
      const duplicate = contacts.find((record) =>
        (emailKey(data.business_email) && emailKey(record.business_email) === emailKey(data.business_email)) ||
        (phoneKey(data.business_phone) && phoneKey(record.business_phone) === phoneKey(data.business_phone))
      );
      if (duplicate) return Response.json({ success: false, duplicate: true, duplicate_record: duplicate });
      const record = await db.Contact.create({
        ...data,
        client_organization_id: campaign.client_organization_id,
        target_account_id: account.id,
        permitted_staff_user_ids: asArray(campaign.permitted_staff_user_ids),
        is_demo: Boolean(campaign.is_demo),
      });
      await audit({ entityType: "Contact", recordId: record.id, auditAction: "create", description: "Added decision-maker contact.", orgId: campaign.client_organization_id, newValue: record, isDemo: campaign.is_demo });
      return Response.json({ success: true, record });
    }

    if (action === "review_accounts") {
      const campaign = await getCampaign(input.campaign_id, "read");
      const clientCanReview = isClientAdmin && campaign.client_organization_id === organizationId;
      if (!clientCanReview && !canManageCampaign(campaign)) fail("You cannot review these target accounts.", 403);
      const valid = new Set(["pending_review", "approved", "rejected", "existing_customer", "known_opportunity", "competitor", "do_not_contact"]);
      const updated = [];
      for (const item of asArray(input.items).slice(0, 500)) {
        if (!valid.has(item.status)) continue;
        const account = await db.TargetAccount.get(item.id);
        if (account.campaign_id !== campaign.id) fail("Target account does not belong to this campaign.", 403);
        const record = await db.TargetAccount.update(account.id, {
          client_approval_status: item.status,
          client_note: clean(item.note, 2000),
          exclusion_reason: item.status === "approved" ? "" : clean(item.note || item.status, 1000),
          outreach_status: item.status === "approved" ? account.outreach_status : "do_not_contact",
        });
        updated.push(record);
        if (["existing_customer", "known_opportunity", "competitor", "do_not_contact"].includes(item.status)) {
          const typeMap = {
            existing_customer: "existing_customer",
            known_opportunity: "existing_opportunity",
            competitor: "client_exclusion",
            do_not_contact: "do_not_contact",
          };
          await db.SuppressionRecord.create({
            client_organization_id: campaign.client_organization_id,
            company: account.company_name,
            suppression_type: typeMap[item.status],
            reason: clean(item.note || item.status, 1000),
            request_date: now(),
            source_campaign: campaign.id,
            added_by: user.id,
            permitted_staff_user_ids: asArray(campaign.permitted_staff_user_ids),
            is_demo: Boolean(campaign.is_demo),
          });
        }
        await audit({ entityType: "TargetAccount", recordId: account.id, auditAction: "approval", description: `Target account marked ${item.status}.`, orgId: campaign.client_organization_id, previousValue: { status: account.client_approval_status }, newValue: { status: item.status, note: item.note }, isDemo: campaign.is_demo });
      }
      const pending = await db.TargetAccount.filter({ campaign_id: campaign.id, client_approval_status: "pending_review" }, "-created_date", 1, 0);
      const approved = await db.TargetAccount.filter({ campaign_id: campaign.id, client_approval_status: "approved" }, "-created_date", 1, 0);
      if (!pending.length && approved.length && campaign.campaign_type !== "sample") {
        const next = campaign.payment_status === "paid" && campaign.intake_status === "complete"
          ? "outreach_active"
          : campaign.campaign_status;
        await db.Campaign.update(campaign.id, { client_approval_status: "approved", campaign_status: next });
      }
      return Response.json({ success: true, updated_count: updated.length });
    }

    if (action === "log_outreach") {
      requireInternal();
      const campaign = await getCampaign(input.campaign_id, "work");
      const account = await db.TargetAccount.get(input.target_account_id);
      if (account.campaign_id !== campaign.id) fail("Target account does not belong to this campaign.", 403);
      if (account.client_approval_status !== "approved") {
        fail("Outreach is blocked until the client approves this target account.", 409);
      }
      const contact = input.contact_id ? await db.Contact.get(input.contact_id) : null;
      const activityType = clean(input.activity_type, 80);
      const suppression = await isSuppressed({
        clientOrganizationId: campaign.client_organization_id,
        contact,
        account,
        activityType,
      });
      const blockedByFlag =
        contact?.do_not_contact_status ||
        (["email_drafted", "email_sent_manually"].includes(activityType) && contact?.do_not_email_status) ||
        (["call_attempted", "call_connected", "voicemail"].includes(activityType) && contact?.do_not_call_status);
      if (suppression || blockedByFlag) {
        fail("Outreach blocked: this contact or company is suppressed.", 409, suppression || { source: "contact flag" });
      }
      const data = pick(input, [
        "contact_id", "activity_type", "date_time", "direction", "disposition",
        "summary", "follow_up_date", "template_used", "internal_notes", "client_visible_notes",
      ]);
      const record = await db.OutreachActivity.create({
        ...data,
        client_organization_id: campaign.client_organization_id,
        campaign_id: campaign.id,
        target_account_id: account.id,
        date_time: data.date_time || now(),
        staff_member: user.id,
        direction: data.direction || "outbound",
        disposition: data.disposition || "not_applicable",
        permitted_staff_user_ids: asArray(campaign.permitted_staff_user_ids),
        is_demo: Boolean(campaign.is_demo),
      });
      if (data.follow_up_date) {
        await createTask({
          assigned_user_id: user.id,
          organization_id: campaign.client_organization_id,
          campaign_id: campaign.id,
          task_type: "follow_up",
          due_date: data.follow_up_date,
          priority: "medium",
          related_account_id: account.id,
          related_contact_id: contact?.id,
          title: `Follow up — ${account.company_name}`,
          action_label: "Open outreach",
          action_path: `/pipeline/outreach?account=${account.id}`,
          permitted_staff_user_ids: asArray(campaign.permitted_staff_user_ids),
          is_demo: campaign.is_demo,
        });
      }
      const outreachStatus = data.disposition === "appointment_scheduled"
        ? "appointment_scheduled"
        : data.disposition === "disqualified"
          ? "disqualified"
          : "contacted";
      await db.TargetAccount.update(account.id, { outreach_status: outreachStatus });
      if (data.activity_type === "do_not_contact_request" || data.disposition === "do_not_call") {
        const suppressionType = data.disposition === "do_not_call" ? "do_not_call" : "do_not_contact";
        await db.SuppressionRecord.create({
          client_organization_id: campaign.client_organization_id,
          email: contact?.business_email || account.public_email || "",
          phone: contact?.business_phone || account.phone || "",
          company: account.company_name,
          suppression_type: suppressionType,
          reason: "Prospect opt-out request recorded during outreach.",
          request_date: now(),
          source_campaign: campaign.id,
          added_by: user.id,
          permitted_staff_user_ids: asArray(campaign.permitted_staff_user_ids),
          is_demo: Boolean(campaign.is_demo),
        });
        if (contact) {
          await db.Contact.update(contact.id, {
            do_not_contact_status: suppressionType === "do_not_contact",
            do_not_call_status: suppressionType === "do_not_call",
            opt_out_request_date: now(),
          });
        }
      }
      await audit({ entityType: "OutreachActivity", recordId: record.id, auditAction: "create", description: `Logged ${activityType}; no automated outreach was sent.`, orgId: campaign.client_organization_id, newValue: record, isDemo: campaign.is_demo });
      return Response.json({ success: true, record });
    }

    if (action === "add_suppression") {
      requireInternal();
      const campaign = input.campaign_id ? await getCampaign(input.campaign_id, "work") : null;
      if (!campaign && !isOwner) fail("A campaign assignment is required.", 403);
      const data = pick(input.record || {}, [
        "email", "phone", "company", "suppression_type", "reason", "request_date",
      ]);
      const record = await db.SuppressionRecord.create({
        ...data,
        client_organization_id: campaign?.client_organization_id || "",
        request_date: data.request_date || now(),
        source_campaign: campaign?.id || "",
        added_by: user.id,
        permitted_staff_user_ids: asArray(campaign?.permitted_staff_user_ids),
        is_demo: Boolean(campaign?.is_demo),
      });
      await audit({ entityType: "SuppressionRecord", recordId: record.id, auditAction: "suppression_change", description: "Added suppression record.", orgId: campaign?.client_organization_id, newValue: record, isDemo: campaign?.is_demo });
      return Response.json({ success: true, record });
    }

    if (action === "qualify") {
      requireInternal();
      const campaign = await getCampaign(input.campaign_id, "work");
      const account = await db.TargetAccount.get(input.target_account_id);
      const contact = await db.Contact.get(input.contact_id);
      if (account.campaign_id !== campaign.id || contact.target_account_id !== account.id) {
        fail("Qualification records must match the campaign, account, and contact.", 403);
      }
      const data = pick(input.record || {}, [
        "qualification_date", "uses_service_currently", "current_provider", "contract_status",
        "contract_review_date", "service_problem", "facility_size", "number_of_locations",
        "expected_service_frequency", "decision_authority", "approximate_opportunity_value",
        "stated_interest", "agreed_next_step", "qualification_status",
        "override_explanation", "disqualification_reason", "notes",
      ]);
      const issues = [];
      if (account.client_approval_status !== "approved") issues.push("target account is not client-approved");
      if (!["decision_maker", "influencer"].includes(data.decision_authority || contact.role_in_decision)) {
        issues.push("decision authority is not confirmed");
      }
      const signal = Boolean(
        data.service_problem ||
        data.contract_review_date ||
        ["upcoming_review", "expiring"].includes(data.contract_status) ||
        ["medium", "high"].includes(data.stated_interest)
      );
      if (!signal) issues.push("no relevant need, review period, contract expiration, or interest is recorded");
      if (!clean(data.agreed_next_step, 1000)) issues.push("no specific agreed next step is recorded");
      let status = data.qualification_status || "pending";
      if (status === "qualified" && issues.length) {
        if ((isOwner || isManager) && clean(data.override_explanation, 2000)) {
          status = "override";
        } else {
          fail("Qualification criteria are incomplete.", 409, issues);
        }
      }
      const record = await db.QualificationRecord.create({
        ...data,
        client_organization_id: campaign.client_organization_id,
        contact_id: contact.id,
        campaign_id: campaign.id,
        qualification_date: data.qualification_date || now(),
        completed_by: user.id,
        qualification_status: status,
        permitted_staff_user_ids: asArray(campaign.permitted_staff_user_ids),
        is_demo: Boolean(campaign.is_demo),
      });
      await db.TargetAccount.update(account.id, {
        outreach_status: ["qualified", "override"].includes(status) ? "qualified" : "disqualified",
      });
      await audit({ entityType: "QualificationRecord", recordId: record.id, auditAction: "status_change", description: `Qualification marked ${status}.`, orgId: campaign.client_organization_id, newValue: { status, issues, override_explanation: data.override_explanation }, isDemo: campaign.is_demo });
      return Response.json({ success: true, record, criteria_issues: issues });
    }

    if (action === "schedule_appointment") {
      requireInternal();
      const campaign = await getCampaign(input.campaign_id, "work");
      const qualification = await db.QualificationRecord.get(input.qualification_id);
      if (qualification.campaign_id !== campaign.id || !["qualified", "override"].includes(qualification.qualification_status)) {
        fail("Only a human-reviewed qualified contact can be scheduled.", 409);
      }
      const contact = await db.Contact.get(qualification.contact_id);
      const account = await db.TargetAccount.get(contact.target_account_id);
      const data = pick(input.appointment || {}, [
        "appointment_title", "date", "start_time", "end_time", "time_zone",
        "meeting_type", "location_or_link", "client_attendee", "qualification_summary",
      ]);
      if (!data.date || !data.start_time || !data.time_zone) fail("Date, start time, and time zone are required.");
      const record = await db.Appointment.create({
        ...data,
        client_organization_id: campaign.client_organization_id,
        campaign_id: campaign.id,
        target_account_id: account.id,
        contact_id: contact.id,
        appointment_title: data.appointment_title || `Sales conversation — ${account.company_name}`,
        meeting_type: data.meeting_type || "video",
        mooretech_staff_member: user.id,
        qualification_summary: data.qualification_summary || qualification.agreed_next_step || "",
        confirmation_status: "unconfirmed",
        outcome: "scheduled",
        performance_fee_status: "not_applicable",
        permitted_staff_user_ids: asArray(campaign.permitted_staff_user_ids),
        is_demo: Boolean(campaign.is_demo),
      });
      const startDate = new Date(`${data.date}T${data.start_time}:00`);
      let priorBusiness = addDays(startDate, -1);
      if (priorBusiness.getUTCDay() === 0) priorBusiness = addDays(priorBusiness, -2);
      if (priorBusiness.getUTCDay() === 6) priorBusiness = addDays(priorBusiness, -1);
      const oneHour = new Date(startDate.getTime() - 60 * 60 * 1000);
      await createTask({
        assigned_user_id: data.client_attendee || user.id,
        organization_id: campaign.client_organization_id,
        campaign_id: campaign.id,
        task_type: "appointment_reminder",
        due_date: priorBusiness.toISOString(),
        priority: "high",
        related_account_id: account.id,
        related_contact_id: contact.id,
        related_appointment_id: record.id,
        title: `Confirm tomorrow's appointment — ${account.company_name}`,
        action_label: "Open appointment",
        action_path: `/pipeline/appointments?appointment=${record.id}`,
        client_visible: true,
        permitted_staff_user_ids: asArray(campaign.permitted_staff_user_ids),
        is_demo: campaign.is_demo,
      });
      await createTask({
        assigned_user_id: data.client_attendee || user.id,
        organization_id: campaign.client_organization_id,
        campaign_id: campaign.id,
        task_type: "appointment_reminder",
        due_date: oneHour.toISOString(),
        priority: "urgent",
        related_account_id: account.id,
        related_contact_id: contact.id,
        related_appointment_id: record.id,
        title: `Appointment in one hour — ${account.company_name}`,
        action_label: "Open appointment",
        action_path: `/pipeline/appointments?appointment=${record.id}`,
        client_visible: true,
        permitted_staff_user_ids: asArray(campaign.permitted_staff_user_ids),
        is_demo: campaign.is_demo,
      });
      await db.TargetAccount.update(account.id, { outreach_status: "appointment_scheduled" });
      await audit({ entityType: "Appointment", recordId: record.id, auditAction: "create", description: "Scheduled appointment and created manual reminder tasks. No SMS was sent.", orgId: campaign.client_organization_id, newValue: record, isDemo: campaign.is_demo });
      return Response.json({ success: true, record });
    }

    if (action === "appointment_outcome") {
      const appointment = await db.Appointment.get(input.appointment_id);
      const campaign = await getCampaign(appointment.campaign_id, "read");
      const clientCanUpdate = isClientAdmin && appointment.client_organization_id === organizationId;
      if (!clientCanUpdate && !canManageCampaign(campaign)) fail("You cannot update this appointment.", 403);
      const valid = new Set(["scheduled", "confirmed", "rescheduled", "cancelled", "no_show", "held", "disqualified_after_meeting", "proposal_sent", "won", "lost"]);
      if (!valid.has(input.outcome)) fail("Invalid appointment outcome.");
      const previous = { ...appointment };
      const updates = {
        outcome: input.outcome,
        outcome_notes: clean(input.outcome_notes, 3000),
        proposal_value: clean(input.proposal_value, 200),
        won_revenue: clean(input.won_revenue, 200),
        follow_up_date: input.follow_up_date || "",
        case_study_consent: Boolean(input.case_study_consent),
        ironline_handoff: Boolean(input.ironline_handoff),
      };
      let billing = null;
      if (input.outcome === "held") {
        const existing = await db.BillingRecord.filter({
          related_appointment_id: appointment.id,
          billing_type: "held_appointment",
        }, "-created_date", 1, 0);
        if (existing.length) {
          billing = existing[0];
        } else {
          billing = await db.BillingRecord.create({
            client_organization_id: appointment.client_organization_id,
            campaign_id: campaign.id,
            billing_type: "held_appointment",
            description: `Held qualified appointment — ${appointment.appointment_title || appointment.id}`,
            amount: Number(campaign.per_held_appointment_fee || 150),
            due_date: addDays(Date.now(), 7).toISOString().slice(0, 10),
            payment_status: "unpaid",
            payment_method: "manual",
            related_appointment_id: appointment.id,
            invoice_number: `MCP-${Date.now().toString().slice(-8)}`,
            permitted_staff_user_ids: asArray(campaign.permitted_staff_user_ids),
            is_demo: Boolean(campaign.is_demo),
          });
        }
        updates.performance_fee_status = "invoiced";
        updates.performance_fee_billing_id = billing.id;
      }
      const record = await db.Appointment.update(appointment.id, updates);
      if (input.outcome === "no_show") {
        await createTask({
          assigned_user_id: campaign.assigned_manager || user.id,
          organization_id: campaign.client_organization_id,
          campaign_id: campaign.id,
          task_type: "follow_up",
          due_date: addDays(Date.now(), 1).toISOString(),
          priority: "high",
          related_appointment_id: appointment.id,
          title: `Follow up on no-show — ${appointment.appointment_title}`,
          action_label: "Open appointment",
          action_path: `/pipeline/appointments?appointment=${appointment.id}`,
          permitted_staff_user_ids: asArray(campaign.permitted_staff_user_ids),
          is_demo: campaign.is_demo,
        });
      }
      await audit({ entityType: "Appointment", recordId: appointment.id, auditAction: "appointment_outcome", description: `Appointment outcome changed to ${input.outcome}.`, orgId: appointment.client_organization_id, previousValue: previous, newValue: updates, isDemo: campaign.is_demo });
      if (billing) {
        await audit({ entityType: "BillingRecord", recordId: billing.id, auditAction: "billing_change", description: "Created or reused the single held-appointment performance fee.", orgId: appointment.client_organization_id, newValue: billing, isDemo: campaign.is_demo });
      }
      return Response.json({ success: true, record, billing, ironline_url: input.outcome === "won" ? "https://ironlineoffice.com/" : null });
    }

    if (action === "generate_report") {
      requireInternal();
      const campaign = await getCampaign(input.campaign_id, "manage");
      const start = input.start_date || campaign.start_date || "1970-01-01";
      const end = input.end_date || today();
      const within = (value) => {
        const date = String(value || "").slice(0, 10);
        return date >= start && date <= end;
      };
      const [accounts, contacts, activities, appointments] = await Promise.all([
        db.TargetAccount.filter({ campaign_id: campaign.id }, "-created_date", 5000, 0),
        db.Contact.filter({ client_organization_id: campaign.client_organization_id }, "-created_date", 5000, 0),
        db.OutreachActivity.filter({ campaign_id: campaign.id }, "-created_date", 5000, 0),
        db.Appointment.filter({ campaign_id: campaign.id }, "-created_date", 5000, 0),
      ]);
      const accountIds = new Set(accounts.map((record) => record.id));
      const periodAccounts = accounts.filter((record) => within(record.research_date || record.created_date));
      const periodContacts = contacts.filter((record) => accountIds.has(record.target_account_id) && within(record.created_date));
      const periodActivities = activities.filter((record) => within(record.date_time || record.created_date));
      const periodAppointments = appointments.filter((record) => within(record.date || record.created_date));
      const revenue = periodAppointments
        .filter((record) => record.outcome === "won")
        .reduce((sum, record) => sum + Number(String(record.won_revenue || "0").replace(/[^0-9.-]/g, "")), 0);
      const metrics = {
        accounts_researched: periodAccounts.length,
        accounts_approved: periodAccounts.filter((record) => record.client_approval_status === "approved").length,
        contacts_identified: periodContacts.length,
        emails_sent: periodActivities.filter((record) => record.activity_type === "email_sent_manually").length,
        calls_attempted: periodActivities.filter((record) => ["call_attempted", "call_connected", "voicemail"].includes(record.activity_type)).length,
        decision_makers_reached: periodActivities.filter((record) => record.disposition === "decision_maker_reached").length,
        conversations: periodActivities.filter((record) => ["call_connected", "email_received"].includes(record.activity_type)).length,
        interested_prospects: periodActivities.filter((record) => record.disposition === "interested").length,
        appointments_scheduled: periodAppointments.length,
        appointments_held: periodAppointments.filter((record) => record.outcome === "held").length,
        no_shows: periodAppointments.filter((record) => record.outcome === "no_show").length,
        proposals: periodAppointments.filter((record) => ["proposal_sent", "won", "lost"].includes(record.outcome)).length,
        wins: periodAppointments.filter((record) => record.outcome === "won").length,
        revenue_reported: revenue ? String(revenue) : "0",
      };
      const record = await db.Report.create({
        client_organization_id: campaign.client_organization_id,
        campaign_id: campaign.id,
        reporting_period_start: start,
        reporting_period_end: end,
        ...metrics,
        summary: clean(input.summary, 5000) || "Manual campaign activity and business outcomes for the selected period.",
        recommendations: clean(input.recommendations, 5000),
        client_visible_status: input.client_visible_status || "ready_for_review",
        permitted_staff_user_ids: asArray(campaign.permitted_staff_user_ids),
        is_demo: Boolean(campaign.is_demo),
      });
      await audit({ entityType: "Report", recordId: record.id, auditAction: "create", description: "Generated campaign report from recorded activity and outcomes.", orgId: campaign.client_organization_id, newValue: metrics, isDemo: campaign.is_demo });
      return Response.json({ success: true, record });
    }

    if (action === "record_payment") {
      if (!isOwner && !isManager) fail("Billing access is required.", 403);
      const billing = await db.BillingRecord.get(input.billing_id);
      const campaign = billing.campaign_id ? await getCampaign(billing.campaign_id, "manage") : null;
      const previous = { ...billing };
      const record = await db.BillingRecord.update(billing.id, {
        payment_status: input.payment_status || "paid",
        payment_method: input.payment_method || "manual",
        paid_date: input.payment_status === "paid" || !input.payment_status ? (input.paid_date || today()) : "",
        notes: clean(input.notes || billing.notes, 2000),
      });
      if (campaign && billing.billing_type === "pilot_setup" && record.payment_status === "paid") {
        const nextStatus = campaign.intake_status === "complete" ? "researching" : "awaiting_intake";
        await db.Campaign.update(campaign.id, { payment_status: "paid", campaign_status: nextStatus });
      }
      await audit({ entityType: "BillingRecord", recordId: record.id, auditAction: "billing_change", description: `Billing record marked ${record.payment_status}.`, orgId: record.client_organization_id, previousValue: previous, newValue: record, isDemo: record.is_demo });
      return Response.json({ success: true, record });
    }

    if (action === "task_status") {
      const task = await db.Task.get(input.task_id);
      const campaign = task.campaign_id ? await db.Campaign.get(task.campaign_id) : null;
      const allowed = isOwner ||
        task.assigned_user_id === user.id ||
        (campaign && isManager && campaignAssigned(campaign)) ||
        (isClientAdmin && task.organization_id === organizationId && task.client_visible);
      if (!allowed) fail("You cannot update this task.", 403);
      const record = await db.Task.update(task.id, { status: input.status || "completed" });
      await audit({ entityType: "Task", recordId: task.id, auditAction: "status_change", description: `Task marked ${record.status}.`, orgId: task.organization_id, previousValue: task, newValue: record, isDemo: task.is_demo });
      return Response.json({ success: true, record });
    }

    if (action === "save_settings") {
      requireOwner();
      const settings = await ensureSettings();
      const allowed = [
        "company_name", "service_name", "owner_name", "contact_email", "contact_phone",
        "phone_label", "business_mailing_address", "positioning_statement",
        "primary_differentiator", "featured_niche", "pilot_price",
        "per_held_appointment_fee", "pilot_account_target", "pilot_duration_days",
        "free_sample_account_limit", "limited_guarantee", "no_guarantee_disclaimer",
        "sender_identity_name", "sender_identity_email", "default_opt_out_language",
        "payment_methods", "calendar_options", "service_agreement_url",
        "lead_generation_page_published", "setup_step", "default_qualification_criteria",
        "setup_complete",
      ];
      const data = pick(input.settings || {}, allowed);
      const record = await db.MooreTechSettings.update(settings.id, data);
      await audit({ entityType: "MooreTechSettings", recordId: record.id, auditAction: "update", description: "Updated MooreTech Commercial Pipeline settings.", previousValue: settings, newValue: data });
      return Response.json({ success: true, record });
    }

    if (action === "save_template") {
      if (!isOwner && !isManager) fail("Template management access is required.", 403);
      const data = pick(input.template || {}, [
        "template_type", "name", "subject", "body", "merge_fields", "opt_out_language", "is_active",
      ]);
      if (!data.name || !data.body) fail("Template name and body are required.");
      const record = input.id
        ? await db.Template.update(input.id, data)
        : await db.Template.create(data);
      await audit({ entityType: "Template", recordId: record.id, auditAction: input.id ? "update" : "create", description: "Saved outreach template. Templates remain human-reviewed drafts.", newValue: data });
      return Response.json({ success: true, record });
    }

    if (action === "invite_user") {
      requireOwner();
      const email = emailKey(input.email);
      const requestedRole = clean(input.role, 80);
      const allowedRoles = new Set(["mooretech_manager", "mooretech_staff", "client_admin", "client_viewer", "user"]);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !allowedRoles.has(requestedRole)) {
        fail("A valid email and role are required.");
      }
      let invitationSent = false;
      let warning = "";
      try {
        await base44.users.inviteUser(email, "user");
        invitationSent = true;
        const matches = await db.User.filter({ email }, "-created_date", 1, 0);
        if (matches[0]) {
          await db.User.update(matches[0].id, {
            role: requestedRole,
            organization_id: input.organization_id || "",
            active: true,
          });
        }
      } catch (error) {
        warning = "The invitation email could not be sent automatically; use the generated login path.";
        console.error("Invitation send failed", error);
      }
      await audit({ entityType: "User", recordId: email, auditAction: "user_invitation", description: `Generated ${requestedRole} invitation for ${email}.`, orgId: input.organization_id, newValue: { email, role: requestedRole, invitationSent } });
      return Response.json({
        success: true,
        invitation_sent: invitationSent,
        warning,
        login_path: "/login",
        onboarding_path: input.organization_id ? `/pipeline/onboarding?organization=${input.organization_id}` : "/pipeline",
      });
    }

    if (action === "export_log") {
      requireInternal();
      await audit({ entityType: clean(input.entity_type, 100) || "Pipeline", recordId: clean(input.record_id, 200) || "export", auditAction: "data_export", description: clean(input.description, 2000) || "Exported pipeline data.", orgId: clean(input.organization_id, 200) });
      return Response.json({ success: true });
    }

    if (action === "reset_demo") {
      requireOwner();
      const deleted = await resetDemoData();
      return Response.json({ success: true, deleted });
    }

    if (action === "seed_demo") {
      requireOwner();
      await resetDemoData();
      const org = await db.Organization.create({
        organization_name: "DeltaSpark Commercial Cleaning (Fictional)",
        organization_type: "client",
        industry: "Commercial cleaning and janitorial",
        website: "https://example.invalid/deltaspark",
        primary_phone: "(870) 555-0100",
        primary_email: "demo@example.invalid",
        address: "100 Demo Plaza, Jonesboro, AR",
        territory: "Jonesboro, Arkansas",
        status: "active",
        owner: "Jordan Ellis (Fictional)",
        assigned_campaign_manager: user.id,
        source: "fictional_demo",
        notes: "Fictional demonstration client. Never contact.",
        permitted_staff_user_ids: [user.id],
        is_demo: true,
      });
      const intake = await db.ClientIntakeProfile.create({
        client_organization_id: org.id,
        services_offered: "Recurring commercial janitorial service",
        most_profitable_service: "Three-to-five day office cleaning",
        geographic_territory: "Jonesboro, Arkansas and 25-mile radius",
        best_existing_customer_types: "Medical offices, banks, and professional offices",
        poor_fit_customer_types: "One-time residential cleaning",
        minimum_contract_value: "$1,000 monthly",
        preferred_industries: "Medical, banking, property management, professional offices",
        target_facility_types: "Offices, clinics, banks, dealerships, warehouses",
        preferred_decision_maker_titles: "Office Manager, Facility Manager, Property Manager",
        current_customer_exclusions: "Demo current customers",
        competitor_exclusions: "Other cleaning providers",
        maximum_new_client_capacity: "4 recurring contracts",
        calendar_availability: "Tuesday–Thursday, 9:00 AM–2:00 PM Central",
        sales_contact: "Jordan Ellis (Fictional)",
        qualification_questions: DEFAULT_CRITERIA,
        onboarding_step: "complete",
        notes: "Fictional demo intake.",
        is_demo: true,
      });
      const campaign = await db.Campaign.create({
        client_organization_id: org.id,
        campaign_name: "Jonesboro Recurring Cleaning Pilot (Fictional Demo)",
        service_promoted: "Recurring commercial janitorial service",
        territory: "Jonesboro, Arkansas",
        start_date: addDays(Date.now(), -7).toISOString().slice(0, 10),
        end_date: addDays(Date.now(), 7).toISOString().slice(0, 10),
        campaign_status: "outreach_active",
        account_target: 50,
        price: 300,
        per_held_appointment_fee: 150,
        assigned_manager: user.id,
        assigned_researcher: user.id,
        assigned_caller: user.id,
        qualification_criteria: DEFAULT_CRITERIA,
        client_approval_status: "approved",
        campaign_notes: "Fictional demo campaign. No external actions.",
        campaign_type: "founding_pilot",
        intake_status: "complete",
        payment_status: "paid",
        permitted_staff_user_ids: [user.id],
        is_demo: true,
      });
      const accountNames = [
        ["Greenway Medical Pavilion", "Medical facility"],
        ["Crowley's Ridge Dental Group", "Dental office"],
        ["Heritage Property Partners", "Property management"],
        ["Red Wolf Apartment Community", "Apartment community"],
        ["Centennial Community Bank", "Bank"],
        ["Grace Harbor Church", "Church"],
        ["Northeast Preparatory Academy", "Private school"],
        ["Delta Distribution Center", "Warehouse"],
        ["Highland Auto Center", "Car dealership"],
        ["Professional Plaza East", "Professional office"],
        ["Commerce Park Offices", "Multi-location business"],
        ["Stadium Boulevard Clinic", "Medical facility"],
      ];
      const accounts = await db.TargetAccount.bulkCreate(accountNames.map(([name, facility], index) => ({
        client_organization_id: org.id,
        campaign_id: campaign.id,
        company_name: `${name} (Fictional)`,
        website: `https://example.invalid/demo-${index + 1}`,
        phone: `(870) 555-${String(1100 + index)}`,
        public_email: `facility${index + 1}@example.invalid`,
        address: `${200 + index} Demo Street`,
        city: "Jonesboro",
        state: "Arkansas",
        industry: facility,
        facility_type: facility,
        estimated_company_size: index % 2 ? "25–75 employees" : "10–30 employees",
        estimated_fit_score: index < 8 ? "high" : "medium",
        reason_for_fit: `Fictional ${facility.toLowerCase()} in the approved Jonesboro territory with recurring facility needs.`,
        research_source: "Fictional demo data",
        research_date: addDays(Date.now(), -6 + (index % 5)).toISOString().slice(0, 10),
        client_approval_status: index === 11 ? "pending_review" : "approved",
        outreach_status: index < 6 ? "contacted" : "not_started",
        assigned_staff_member: user.id,
        notes: "Fictional record — do not contact.",
        permitted_staff_user_ids: [user.id],
        is_demo: true,
      })));
      const contacts = await db.Contact.bulkCreate(accounts.slice(0, 8).map((account, index) => ({
        client_organization_id: org.id,
        target_account_id: account.id,
        first_name: ["Alex", "Morgan", "Taylor", "Casey", "Riley", "Avery", "Jordan", "Cameron"][index],
        last_name: "Demo",
        job_title: index % 2 ? "Facility Manager" : "Office Manager",
        role_in_decision: index < 5 ? "decision_maker" : "influencer",
        business_email: `contact${index + 1}@example.invalid`,
        business_phone: `(870) 555-${String(2100 + index)}`,
        contact_source: "Fictional demo data",
        verification_status: "verified",
        verification_date: today(),
        preferred_contact_method: index % 2 ? "phone" : "email",
        consent_to_text_status: "not_applicable",
        notes: "Fictional contact — do not contact.",
        permitted_staff_user_ids: [user.id],
        is_demo: true,
      })));
      const activityTypes = [
        ["research", "not_applicable"],
        ["email_drafted", "not_applicable"],
        ["email_sent_manually", "information_requested"],
        ["call_attempted", "no_answer"],
        ["voicemail", "voicemail"],
        ["call_connected", "decision_maker_reached"],
        ["follow_up", "follow_up_requested"],
        ["email_sent_manually", "interested"],
        ["call_attempted", "gatekeeper"],
        ["call_connected", "contract_review_later"],
        ["email_received", "information_requested"],
        ["call_attempted", "decision_maker_unavailable"],
        ["call_connected", "interested"],
        ["meeting_scheduled", "appointment_scheduled"],
        ["follow_up", "follow_up_requested"],
      ];
      await db.OutreachActivity.bulkCreate(activityTypes.map(([activityType, disposition], index) => ({
        client_organization_id: org.id,
        campaign_id: campaign.id,
        target_account_id: accounts[index % 8].id,
        contact_id: contacts[index % 8].id,
        activity_type: activityType,
        date_time: addDays(Date.now(), -6 + (index % 6)).toISOString(),
        staff_member: user.id,
        direction: index === 10 ? "inbound" : "outbound",
        disposition,
        summary: "Fictional demo activity; no message or call was actually sent.",
        client_visible_notes: "Demo campaign activity recorded.",
        internal_notes: "Fictional demo only.",
        permitted_staff_user_ids: [user.id],
        is_demo: true,
      })));
      const qualifications = await db.QualificationRecord.bulkCreate([
        {
          client_organization_id: org.id, contact_id: contacts[0].id, campaign_id: campaign.id,
          qualification_date: addDays(Date.now(), -2).toISOString(), completed_by: user.id,
          uses_service_currently: true, current_provider: "Existing vendor (Fictional)",
          contract_status: "upcoming_review", contract_review_date: addDays(Date.now(), 30).toISOString().slice(0, 10),
          service_problem: "Inconsistent quality after business hours.", facility_size: "18,000 sq ft",
          number_of_locations: "1", expected_service_frequency: "5 nights weekly",
          decision_authority: "decision_maker", approximate_opportunity_value: "$2,400 monthly",
          stated_interest: "high", agreed_next_step: "30-minute walkthrough next Tuesday",
          qualification_status: "qualified", notes: "Fictional demo.", permitted_staff_user_ids: [user.id], is_demo: true,
        },
        {
          client_organization_id: org.id, contact_id: contacts[1].id, campaign_id: campaign.id,
          qualification_date: addDays(Date.now(), -1).toISOString(), completed_by: user.id,
          uses_service_currently: true, contract_status: "expiring",
          service_problem: "Needs reliable daytime restroom service.", facility_size: "9,000 sq ft",
          number_of_locations: "2", expected_service_frequency: "3 nights weekly",
          decision_authority: "influencer", approximate_opportunity_value: "$1,600 monthly",
          stated_interest: "medium", agreed_next_step: "Introductory video meeting Thursday",
          qualification_status: "qualified", notes: "Fictional demo.", permitted_staff_user_ids: [user.id], is_demo: true,
        },
        {
          client_organization_id: org.id, contact_id: contacts[2].id, campaign_id: campaign.id,
          qualification_date: now(), completed_by: user.id,
          uses_service_currently: false, contract_status: "unknown",
          service_problem: "", facility_size: "Unknown", number_of_locations: "1",
          expected_service_frequency: "Unknown", decision_authority: "gatekeeper",
          approximate_opportunity_value: "Unknown", stated_interest: "none",
          agreed_next_step: "", qualification_status: "disqualified",
          disqualification_reason: "No decision authority or active need.",
          notes: "Fictional demo.", permitted_staff_user_ids: [user.id], is_demo: true,
        },
      ]);
      const appointmentData = [
        [qualifications[0], accounts[0], contacts[0], "scheduled", 2],
        [qualifications[1], accounts[1], contacts[1], "scheduled", 4],
        [qualifications[0], accounts[0], contacts[0], "held", -1],
        [qualifications[1], accounts[1], contacts[1], "proposal_sent", 0],
      ];
      const appointments = await db.Appointment.bulkCreate(appointmentData.map(([qualification, account, contact, outcome, days], index) => ({
        client_organization_id: org.id,
        campaign_id: campaign.id,
        target_account_id: account.id,
        contact_id: contact.id,
        appointment_title: `${account.company_name} — ${index < 2 ? "Upcoming walkthrough" : "Demo sales meeting"}`,
        date: addDays(Date.now(), days).toISOString().slice(0, 10),
        start_time: index % 2 ? "11:00" : "10:00",
        end_time: index % 2 ? "11:30" : "10:30",
        time_zone: "America/Chicago",
        meeting_type: index % 2 ? "video" : "in_person",
        location_or_link: index % 2 ? "https://meet.google.com/demo-fake-link" : "Fictional facility",
        client_attendee: user.id,
        mooretech_staff_member: user.id,
        qualification_summary: qualification.agreed_next_step,
        confirmation_status: index < 2 ? "confirmed" : "confirmed",
        outcome,
        outcome_notes: "Fictional demo outcome.",
        proposal_value: outcome === "proposal_sent" ? "2400" : "",
        performance_fee_status: outcome === "held" ? "invoiced" : "not_applicable",
        permitted_staff_user_ids: [user.id],
        is_demo: true,
      })));
      const pilotInvoice = await db.BillingRecord.create({
        client_organization_id: org.id, campaign_id: campaign.id,
        billing_type: "pilot_setup", description: "Founding Client Pilot (Fictional Demo)",
        amount: 300, due_date: addDays(Date.now(), -7).toISOString().slice(0, 10),
        payment_status: "paid", payment_method: "manual", paid_date: addDays(Date.now(), -7).toISOString().slice(0, 10),
        invoice_number: "DEMO-PILOT-001", permitted_staff_user_ids: [user.id], is_demo: true,
      });
      const heldFee = await db.BillingRecord.create({
        client_organization_id: org.id, campaign_id: campaign.id,
        billing_type: "held_appointment", description: "Held qualified appointment (Fictional Demo)",
        amount: 150, due_date: addDays(Date.now(), 7).toISOString().slice(0, 10),
        payment_status: "unpaid", payment_method: "manual",
        related_appointment_id: appointments[2].id, invoice_number: "DEMO-HELD-001",
        permitted_staff_user_ids: [user.id], is_demo: true,
      });
      await db.Appointment.update(appointments[2].id, {
        performance_fee_billing_id: heldFee.id,
        performance_fee_status: "invoiced",
      });
      const report = await db.Report.create({
        client_organization_id: org.id, campaign_id: campaign.id,
        reporting_period_start: addDays(Date.now(), -7).toISOString().slice(0, 10),
        reporting_period_end: today(),
        accounts_researched: 12, accounts_approved: 11, contacts_identified: 8,
        emails_sent: 2, calls_attempted: 6, decision_makers_reached: 3,
        conversations: 4, interested_prospects: 2, appointments_scheduled: 4,
        appointments_held: 1, no_shows: 0, proposals: 1, wins: 0,
        revenue_reported: "0",
        summary: "Fictional demo report showing the recorded path from research to appointments.",
        recommendations: "Continue follow-up with review-period accounts and confirm upcoming appointments.",
        client_visible_status: "published",
        permitted_staff_user_ids: [user.id],
        is_demo: true,
      });
      await createTask({
        assigned_user_id: user.id, organization_id: org.id, campaign_id: campaign.id,
        task_type: "approval", due_date: now(), priority: "high",
        title: "Review one pending fictional target account", action_label: "Review targets",
        action_path: `/pipeline/accounts?campaign=${campaign.id}`,
        permitted_staff_user_ids: [user.id], is_demo: true,
      });
      await audit({ entityType: "Organization", recordId: org.id, auditAction: "create", description: "Loaded fictional demo simulator data. No external actions are enabled.", orgId: org.id, newValue: { campaign: campaign.id, accounts: accounts.length }, isDemo: true });
      return Response.json({
        success: true,
        demo: {
          organization: org,
          intake,
          campaign,
          accounts: accounts.length,
          contacts: contacts.length,
          activities: 15,
          qualifications: qualifications.length,
          appointments: appointments.length,
          report,
          invoices: [pilotInvoice, heldFee],
        },
      });
    }

    return Response.json({ error: "Unknown pipeline action." }, { status: 400 });
  } catch (error) {
    console.error("Pipeline API error", error);
    return Response.json(
      { error: error.message || "Pipeline request failed.", details: error.details },
      { status: Number(error.status || 500) },
    );
  }
});
