import fs from "node:fs";

const entityNames = [
  "Organization", "MooreTechSalesProspect", "ClientIntakeProfile", "Campaign",
  "TargetAccount", "Contact", "OutreachActivity", "QualificationRecord",
  "Appointment", "Task", "SuppressionRecord", "Report", "BillingRecord",
  "AuditLog", "Template", "MooreTechSettings"
];

const adminOnly = {
  create: { user_condition: { role: "admin" } },
  read: { user_condition: { role: "admin" } },
  update: { user_condition: { role: "admin" } },
  delete: { user_condition: { role: "admin" } }
};

const add = (schema, key, definition) => {
  if (!schema.properties[key]) schema.properties[key] = definition;
};

for (const name of entityNames) {
  const path = `base44/entities/${name}.jsonc`;
  const schema = JSON.parse(fs.readFileSync(path, "utf8"));
  schema.rls = adminOnly;

  if (name === "Organization") {
    add(schema, "is_demo", { type: "boolean", default: false });
    add(schema, "permitted_staff_user_ids", { type: "array", items: { type: "string" }, description: "MooreTech users explicitly assigned to this client." });
  }
  if (name === "MooreTechSalesProspect") {
    add(schema, "sample_campaign_id", { type: "string", description: "Internal sample campaign id." });
    add(schema, "free_sample_status", { type: "string", enum: ["not_requested", "requested", "in_progress", "delivered"], default: "not_requested" });
    add(schema, "preferred_contact_method", { type: "string", enum: ["email", "call", "text"], default: "email" });
  }
  if (name === "ClientIntakeProfile") {
    add(schema, "is_demo", { type: "boolean", default: false });
  }
  if (name === "Campaign") {
    add(schema, "campaign_type", { type: "string", enum: ["sample", "founding_pilot", "service"], default: "founding_pilot" });
    add(schema, "sales_prospect_id", { type: "string", description: "Source MooreTech sales prospect for samples and conversions." });
    add(schema, "intake_status", { type: "string", enum: ["not_started", "in_progress", "complete"], default: "not_started" });
    add(schema, "payment_status", { type: "string", enum: ["not_required", "awaiting_payment", "paid", "waived"], default: "awaiting_payment" });
    add(schema, "permitted_staff_user_ids", { type: "array", items: { type: "string" }, description: "MooreTech users explicitly assigned to this campaign." });
  }
  if (name === "TargetAccount") {
    add(schema, "client_note", { type: "string", maxLength: 2000, description: "Client-visible targeting review note." });
    add(schema, "permitted_staff_user_ids", { type: "array", items: { type: "string" } });
  }
  if (name === "Contact") {
    add(schema, "do_not_text_status", { type: "boolean", default: false });
    add(schema, "opt_out_request_date", { type: "string", format: "date-time" });
    add(schema, "permitted_staff_user_ids", { type: "array", items: { type: "string" } });
  }
  if (["OutreachActivity", "QualificationRecord", "Appointment", "Task", "SuppressionRecord", "Report", "BillingRecord"].includes(name)) {
    add(schema, "permitted_staff_user_ids", { type: "array", items: { type: "string" } });
  }
  if (name === "Task") {
    add(schema, "title", { type: "string", maxLength: 240 });
    add(schema, "action_label", { type: "string", maxLength: 120 });
    add(schema, "action_path", { type: "string", maxLength: 500 });
    add(schema, "client_visible", { type: "boolean", default: false });
  }
  if (name === "SuppressionRecord") {
    add(schema, "is_demo", { type: "boolean", default: false });
  }
  if (name === "Report") {
    add(schema, "accounts_approved", { type: "number", default: 0 });
  }
  if (name === "BillingRecord") {
    add(schema, "invoice_number", { type: "string", maxLength: 100 });
  }
  if (name === "MooreTechSettings") {
    add(schema, "default_qualification_criteria", { type: "string", maxLength: 5000 });
    add(schema, "setup_complete", { type: "boolean", default: false });
  }

  fs.writeFileSync(path, JSON.stringify(schema, null, 2) + "\n");
}

console.log(`Updated ${entityNames.length} pipeline schemas with gateway-only RLS and workflow fields.`);
