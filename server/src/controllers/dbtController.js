import { DbtApplication, DBT_STATUSES } from "../models/DbtApplication.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Simulated scheme DBT dataset — 3 representative entries
const SIMULATED_SCHEMES = [
  {
    schemeName: "PM-KISAN Samman Nidhi",
    schemeCategory: "Income Support",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    disbursedAmount: 6000,
    bankAccountMasked: "XXXX XXXX 7412",
    ifscCode: "SBIN0001234",
    status: "disbursed",
    appliedDaysAgo: 180,
    disbursedDaysAgo: 90,
    referencePrefix: "PMKISAN"
  },
  {
    schemeName: "Pradhan Mantri Fasal Bima Yojana",
    schemeCategory: "Crop Insurance",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    disbursedAmount: 0,
    bankAccountMasked: "XXXX XXXX 7412",
    ifscCode: "SBIN0001234",
    status: "under_review",
    appliedDaysAgo: 45,
    disbursedDaysAgo: null,
    referencePrefix: "PMFBY"
  },
  {
    schemeName: "PM Krishi Sinchai Yojana",
    schemeCategory: "Irrigation",
    ministry: "Ministry of Jal Shakti",
    disbursedAmount: 0,
    bankAccountMasked: "XXXX XXXX 7412",
    ifscCode: "SBIN0001234",
    status: "applied",
    appliedDaysAgo: 10,
    disbursedDaysAgo: null,
    referencePrefix: "PMKSY"
  }
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function buildTimeline(scheme) {
  const statusOrder = ["applied", "under_review", "approved", "disbursed"];
  const idx = statusOrder.indexOf(scheme.status);
  const events = [];

  for (let i = 0; i <= idx; i++) {
    const dayOffset = Math.floor((scheme.appliedDaysAgo / (idx + 1)) * i);
    events.push({
      status: statusOrder[i],
      date: daysAgo(scheme.appliedDaysAgo - dayOffset),
      note:
        statusOrder[i] === "applied"
          ? "Application submitted successfully"
          : statusOrder[i] === "under_review"
            ? "Documents under verification by department"
            : statusOrder[i] === "approved"
              ? "Application approved by authority"
              : `Payment of ₹${scheme.disbursedAmount.toLocaleString("en-IN")} credited to bank account`
    });
  }
  return events;
}

async function seedDbtForUser(userId) {
  // Always reset to exactly the current SIMULATED_SCHEMES list
  const existing = await DbtApplication.countDocuments({ userId });
  if (existing === SIMULATED_SCHEMES.length) return; // already correct

  // Clear old seeded data and re-seed fresh
  await DbtApplication.deleteMany({ userId });

  const docs = SIMULATED_SCHEMES.map((s, i) => ({
    userId,
    schemeName: s.schemeName,
    schemeCategory: s.schemeCategory,
    ministry: s.ministry,
    appliedOn: daysAgo(s.appliedDaysAgo),
    status: s.status,
    disbursedAmount: s.disbursedAmount,
    paymentDate: s.disbursedDaysAgo ? daysAgo(s.disbursedDaysAgo) : null,
    bankAccountMasked: s.bankAccountMasked,
    ifscCode: s.ifscCode,
    referenceNumber: `${s.referencePrefix}${userId.toString().slice(-6).toUpperCase()}${1000 + i}`,
    remarks: s.status === "rejected" ? "Ineligible based on land record verification" : "",
    timeline: buildTimeline(s)
  }));

  await DbtApplication.insertMany(docs, { ordered: false }).catch(() => {});
}

// GET /api/dbt
export const getDbtApplications = asyncHandler(async (req, res) => {
  await seedDbtForUser(req.user._id);

  const { status } = req.query;
  const filter = { userId: req.user._id };
  if (status && DBT_STATUSES.includes(status)) filter.status = status;

  const applications = await DbtApplication.find(filter).sort({ appliedOn: -1 }).lean();

  res.json({ success: true, applications });
});

// GET /api/dbt/summary
export const getDbtSummary = asyncHandler(async (req, res) => {
  await seedDbtForUser(req.user._id);

  const apps = await DbtApplication.find({ userId: req.user._id }).lean();

  const summary = {
    total: apps.length,
    applied: apps.filter((a) => a.status === "applied").length,
    under_review: apps.filter((a) => a.status === "under_review").length,
    approved: apps.filter((a) => a.status === "approved").length,
    disbursed: apps.filter((a) => a.status === "disbursed").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
    totalDisbursed: apps.reduce((sum, a) => sum + (a.disbursedAmount || 0), 0)
  };

  res.json({ success: true, summary });
});
