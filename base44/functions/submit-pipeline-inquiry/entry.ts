import { createClientFromRequest } from "npm:@base44/sdk";

const clean = (value, max = 1000) =>
  String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);

const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const phoneKey = (value) => clean(value, 50).replace(/\D/g, "");

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const input = await req.json();

    if (clean(input.website_check, 200)) {
      return Response.json({ success: true });
    }

    const startedAt = Number(input.started_at || 0);
    if (startedAt && Date.now() - startedAt < 1200) {
      return Response.json({ success: true });
    }

    const name = clean(input.name, 120);
    const company = clean(input.company, 200);
    const email = clean(input.email, 254).toLowerCase();
    const phone = clean(input.phone, 50);
    const website = clean(input.website, 500);
    const industry = clean(input.industry, 120) || "Commercial cleaning and janitorial";
    const location = clean(input.city_state, 240);
    const territory = clean(input.service_territory, 500);
    const accepting = clean(input.accepting_new_clients, 80);
    const accountWanted = clean(input.account_type_wanted, 1000);
    const minimumValue = clean(input.minimum_contract_value, 200);
    const interest = clean(input.interest, 80);
    const preferredContact = ["email", "call", "text"].includes(input.preferred_contact)
      ? input.preferred_contact
      : "email";
    const notes = clean(input.notes, 3000);
    const consentGiven = input.consent_given === true;

    if (name.length < 2 || company.length < 2) {
      return Response.json({ error: "Please enter your name and company." }, { status: 400 });
    }
    if (!emailOk(email)) {
      return Response.json({ error: "Please enter a valid business email." }, { status: 400 });
    }
    if ((preferredContact === "call" || preferredContact === "text") && phoneKey(phone).length < 7) {
      return Response.json({ error: "Please include a valid phone number." }, { status: 400 });
    }
    if (!territory) {
      return Response.json({ error: "Please enter the service territory." }, { status: 400 });
    }
    if (!consentGiven) {
      return Response.json({ error: "Please confirm MooreTech may contact you about this request." }, { status: 400 });
    }

    const db = base44.asServiceRole.entities;
    const recent = await db.MooreTechSalesProspect.filter({ email }, "-created_date", 1, 0);
    if (recent?.[0]?.created_date) {
      const elapsed = Date.now() - new Date(recent[0].created_date).getTime();
      if (elapsed < 10 * 60 * 1000) {
        return Response.json(
          { error: "We already received a recent request from this email." },
          { status: 429 },
        );
      }
    }

    const [city = "", state = ""] = location.split(",").map((part) => part.trim());
    const prospect = await db.MooreTechSalesProspect.create({
      company,
      owner_or_decision_maker: name,
      industry,
      city,
      state,
      website,
      phone,
      email,
      lead_source: "public_lead_generation_form",
      current_sales_process: [
        `Accepting new clients: ${accepting || "Not provided"}`,
        `Commercial account wanted: ${accountWanted || "Not provided"}`,
        `Minimum contract value: ${minimumValue || "Not provided"}`,
      ].join("\n"),
      capacity_for_new_business: accepting,
      estimated_fit: "unknown",
      personalized_observation: "",
      preferred_contact_method: preferredContact,
      sales_stage: interest === "pilot" ? "conversation" : "free_sample_requested",
      free_sample_status: interest === "pilot" ? "not_requested" : "requested",
      notes: [
        `Service territory: ${territory}`,
        `Interest: ${interest || "free_sample"}`,
        notes ? `Notes: ${notes}` : "",
      ].filter(Boolean).join("\n"),
    });

    const admins = await db.User.filter({ role: "admin" }, "-created_date", 10, 0);
    const owner = admins?.[0];
    await db.Task.create({
      assigned_user_id: owner?.id || "mooretech-owner",
      task_type: "follow_up",
      due_date: new Date().toISOString(),
      priority: interest === "pilot" ? "urgent" : "high",
      status: "open",
      title: `New ${interest === "pilot" ? "pilot" : "sample"} inquiry — ${company}`,
      notes: `${name} prefers ${preferredContact}. Territory: ${territory}.`,
      action_label: "Review prospect",
      action_path: `/pipeline/prospects?prospect=${prospect.id}`,
      client_visible: false,
      is_demo: false,
    });

    await db.AuditLog.create({
      entity_type: "MooreTechSalesProspect",
      record_id: prospect.id,
      action: "create",
      changed_by: "public-form",
      changed_by_email: email,
      description: "Created from the public MooreTech Commercial Pipeline inquiry form.",
      new_value: JSON.stringify({ company, email, territory, interest }),
      is_demo: false,
    });

    return Response.json({
      success: true,
      prospect_id: prospect.id,
      message: interest === "pilot"
        ? "Your founding-client pilot request is in MooreTech's review queue."
        : "Your free 10-account sample request is in MooreTech's review queue.",
    });
  } catch (error) {
    console.error("Pipeline inquiry submission failed", error);
    return Response.json(
      { error: "We could not submit the request right now. Please call or text 870-819-1018." },
      { status: 500 },
    );
  }
});
