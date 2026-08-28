import { createClientFromRequest } from "npm:@base44/sdk";

const ADMIN_EMAIL = "admin@ironlineoffice.com";
const VALID_TYPES = new Set(["custom_build", "ironline_office", "business_launch", "partnership", "general"]);
const VALID_CONTACT = new Set(["email", "text", "call"]);
const VALID_STAGES = new Set(["exploring", "comparing", "ready_to_scope", "urgent_need", "not_applicable"]);
const VALID_TIMEFRAMES = new Set(["flexible", "one_to_three_months", "three_to_six_months", "not_sure", "not_applicable"]);

const clean = (value: unknown, maxLength: number) =>
  String(value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength);

const cleanMessage = (value: unknown) =>
  String(value ?? "").trim().replace(/\r\n/g, "\n").slice(0, 5000);

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const input = await req.json();

    // Quietly accept honeypot submissions without saving or sending anything.
    if (clean(input.website, 200)) {
      return Response.json({ success: true });
    }

    const startedAt = Number(input.started_at || 0);
    if (startedAt && Date.now() - startedAt < 1200) {
      return Response.json({ success: true });
    }

    const inquiryType = VALID_TYPES.has(input.inquiry_type) ? input.inquiry_type : "general";
    const name = clean(input.name, 120);
    const email = clean(input.email, 254).toLowerCase();
    const phone = clean(input.phone, 50);
    const company = clean(input.company, 160);
    const preferredContact = VALID_CONTACT.has(input.preferred_contact) ? input.preferred_contact : "email";
    const message = cleanMessage(input.message);
    const projectStage = VALID_STAGES.has(input.project_stage) ? input.project_stage : "exploring";
    const timeframe = VALID_TIMEFRAMES.has(input.timeframe) ? input.timeframe : "not_sure";
    const sourcePage = clean(input.source_page, 500) || "/contact";
    const consentGiven = input.consent_given === true;

    if (name.length < 2) {
      return Response.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if ((preferredContact === "text" || preferredContact === "call") && phone.length < 7) {
      return Response.json({ error: "Please include a phone number for text or call follow-up." }, { status: 400 });
    }
    if (message.length < 20) {
      return Response.json({ error: "Please include a little more detail so we can review the request." }, { status: 400 });
    }
    if (!consentGiven) {
      return Response.json({ error: "Please confirm that MooreTech may contact you about this request." }, { status: 400 });
    }

    const recent = await base44.asServiceRole.entities.Inquiry.filter(
      { email },
      "-created_date",
      1,
      0
    );
    if (recent?.[0]?.created_date) {
      const elapsed = Date.now() - new Date(recent[0].created_date).getTime();
      if (elapsed < 10 * 60 * 1000) {
        return Response.json(
          { error: "We already received a recent request from this email. Please text us if you need to add something." },
          { status: 429 }
        );
      }
    }

    const inquiry = await base44.asServiceRole.entities.Inquiry.create({
      inquiry_type: inquiryType,
      name,
      email,
      phone,
      company,
      preferred_contact: preferredContact,
      message,
      project_stage: projectStage,
      timeframe,
      source_page: sourcePage,
      status: "new",
      consent_given: true
    });

    const labels: Record<string, string> = {
      custom_build: "Custom build",
      ironline_office: "Ironline Office",
      business_launch: "Arkansas Business Launch",
      partnership: "Partnership",
      general: "General"
    };

    const adminBody = `
      <h2>New MooreTech inquiry</h2>
      <p><strong>Type:</strong> ${escapeHtml(labels[inquiryType])}</p>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Company:</strong> ${escapeHtml(company || "Not provided")}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
      <p><strong>Preferred contact:</strong> ${escapeHtml(preferredContact)}</p>
      <p><strong>Project stage:</strong> ${escapeHtml(projectStage)}</p>
      <p><strong>Timeframe:</strong> ${escapeHtml(timeframe)}</p>
      <p><strong>Source:</strong> ${escapeHtml(sourcePage)}</p>
      <hr />
      <p><strong>Message</strong></p>
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    `;

    let adminNotificationSent = false;
    let confirmationSent = false;

    try {
      await base44.integrations.Core.SendEmail({
        to: ADMIN_EMAIL,
        subject: `New MooreTech ${labels[inquiryType]} inquiry — ${name}`,
        body: adminBody,
        from_name: "MooreTech Solutions LLC"
      });
      adminNotificationSent = true;
    } catch (error) {
      console.error("Admin inquiry notification failed", error);
    }

    try {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: "We received your MooreTech request",
        body: `
          <p>Hi ${escapeHtml(name)},</p>
          <p>Thank you for contacting MooreTech Solutions LLC. We received your request and will review it carefully.</p>
          <p>We aim to respond within two business days. If you need to add something, text <strong>870-819-1018</strong>.</p>
          <p>— MooreTech Solutions LLC</p>
        `,
        from_name: "MooreTech Solutions LLC"
      });
      confirmationSent = true;
    } catch (error) {
      console.error("Inquiry confirmation failed", error);
    }

    return Response.json({
      success: true,
      inquiry_id: inquiry.id,
      admin_notification_sent: adminNotificationSent,
      confirmation_sent: confirmationSent
    });
  } catch (error) {
    console.error("Inquiry submission failed", error);
    return Response.json(
      { error: "We could not submit the request right now. Please text 870-819-1018 instead." },
      { status: 500 }
    );
  }
});
