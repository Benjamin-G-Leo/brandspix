// Business details printed on quotations and invoices.
// PLACEHOLDERS: the owner has not yet supplied legal name, address, PAN or GSTIN.
// Replace these before any quotation is sent to a real customer.
export const BUSINESS = {
  legalName: "Brandspix",
  address: "Tamil Nadu, India",
  email: "support@brandspix.com",
  phone: "",
  gstin: "", // empty = not shown
  pan: "",
  placeholder: true,
};

export const QUOTE_DEFAULTS = {
  validityDays: 15,
  taxRatePercent: 18,
  advancePercent: 50,
};
