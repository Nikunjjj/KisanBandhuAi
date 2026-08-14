import { connectDb } from "../config/db.js";
import { validateEnv } from "../config/env.js";
import { Scheme } from "../models/Scheme.js";

const schemes = [
  {
    schemeName: "Pradhan Mantri Kisan Samman Nidhi",
    description: "A central sector DBT scheme providing income support to eligible farmer families for agricultural and allied needs.",
    benefits: ["Rs. 6,000 per year in three equal installments", "Direct transfer to Aadhaar-linked bank account", "Support for crop inputs and household farming expenses"],
    eligibilityCriteria: ["Farmer family with cultivable landholding", "Valid Aadhaar and bank account", "Not covered under exclusion categories such as institutional landholders"],
    requiredDocuments: ["Aadhaar card", "Land records", "Bank passbook", "Mobile number"],
    applicationDeadline: "2027-03-31",
    stateApplicability: ["All India"],
    ministryDepartment: "Ministry of Agriculture and Farmers Welfare",
    applicationLink: "https://pmkisan.gov.in/",
    category: "DBT schemes",
    isTrending: true,
    status: "Published"
  },
  {
    schemeName: "Pradhan Mantri Fasal Bima Yojana",
    description: "Crop insurance scheme that protects farmers against crop loss due to natural calamities, pests, and diseases.",
    benefits: ["Affordable crop insurance premium", "Coverage for prevented sowing and post-harvest losses", "Claim support for notified crops and areas"],
    eligibilityCriteria: ["Farmer growing notified crop in notified area", "Enrollment within notified season window", "Tenant and sharecropper farmers may apply with valid proof"],
    requiredDocuments: ["Land record or tenancy proof", "Bank account details", "Crop sowing certificate", "Aadhaar card"],
    applicationDeadline: "2026-07-31",
    stateApplicability: ["All India"],
    ministryDepartment: "Ministry of Agriculture and Farmers Welfare",
    applicationLink: "https://pmfby.gov.in/",
    category: "Crop damage and insurance schemes",
    isTrending: true,
    status: "Published"
  },
  {
    schemeName: "PM-KUSUM Solar Pump Subsidy",
    description: "Renewable energy scheme supporting farmers with solar pumps, solarization of existing pumps, and decentralized solar power generation.",
    benefits: ["Subsidy support for solar irrigation pumps", "Reduced diesel and electricity dependency", "Income opportunity through solar power generation"],
    eligibilityCriteria: ["Individual farmer, cooperative, panchayat, or farmer producer organization", "Suitable land or existing pump connection", "State nodal agency approval"],
    requiredDocuments: ["Aadhaar card", "Land ownership proof", "Bank details", "Pump connection details"],
    applicationDeadline: "2026-12-31",
    stateApplicability: ["All India"],
    ministryDepartment: "Ministry of New and Renewable Energy",
    applicationLink: "https://pmkusum.mnre.gov.in/",
    category: "Solar panel subsidy schemes",
    isTrending: true,
    status: "Published"
  },
  {
    schemeName: "Per Drop More Crop Micro Irrigation",
    description: "Scheme promoting drip and sprinkler irrigation for efficient water use and improved crop productivity.",
    benefits: ["Financial assistance for drip irrigation systems", "Support for sprinkler irrigation equipment", "Improved water-use efficiency"],
    eligibilityCriteria: ["Farmer with cultivable agricultural land", "Micro-irrigation installation through approved vendors", "Compliance with state horticulture or agriculture department rules"],
    requiredDocuments: ["Land record", "Aadhaar card", "Bank passbook", "Quotation from approved vendor"],
    applicationDeadline: "2026-10-15",
    stateApplicability: ["All India"],
    ministryDepartment: "Department of Agriculture and Farmers Welfare",
    applicationLink: "https://pmksy.gov.in/",
    category: "Drip and sprinkler subsidies",
    isTrending: false,
    status: "Published"
  },
  {
    schemeName: "Rashtriya Gokul Mission",
    description: "Livestock development scheme focused on bovine breed improvement, dairy productivity, and farmer income enhancement.",
    benefits: ["Support for breed improvement services", "Artificial insemination and animal productivity programs", "Dairy entrepreneurship support through linked initiatives"],
    eligibilityCriteria: ["Dairy farmer or livestock owner", "Eligible bovine animals as per local department norms", "Registration with veterinary or dairy department where required"],
    requiredDocuments: ["Aadhaar card", "Livestock ownership details", "Bank account", "Veterinary department certificate if applicable"],
    applicationDeadline: "2027-01-31",
    stateApplicability: ["All India"],
    ministryDepartment: "Department of Animal Husbandry and Dairying",
    applicationLink: "https://dahd.nic.in/",
    category: "Livestock and dairy schemes",
    isTrending: false,
    status: "Published"
  },
  {
    schemeName: "Pradhan Mantri Awas Yojana Gramin",
    description: "Rural housing scheme that assists eligible households in constructing pucca houses with basic amenities.",
    benefits: ["Financial assistance for rural house construction", "Convergence with sanitation, electricity, and drinking water schemes", "Support for vulnerable rural households"],
    eligibilityCriteria: ["Eligible rural household based on deprivation parameters", "No existing pucca house", "Verification through gram sabha and official records"],
    requiredDocuments: ["Aadhaar card", "Job card if available", "Bank account details", "Residence proof"],
    applicationDeadline: "2026-09-30",
    stateApplicability: ["All India"],
    ministryDepartment: "Ministry of Rural Development",
    applicationLink: "https://pmayg.nic.in/",
    category: "Housing schemes",
    isTrending: false,
    status: "Published"
  },
  {
    schemeName: "Kisan Credit Card Scheme",
    description: "Provides farmers with timely and adequate credit for crop cultivation, post-harvest expenses, and allied agriculture activities at subsidized interest rates.",
    benefits: ["Revolving credit up to Rs. 3 lakh at 7% interest", "Additional 3% interest subvention for timely repayment", "Coverage for crop, equipment, and personal accident insurance"],
    eligibilityCriteria: ["Farmers owning or leasing agricultural land", "Individual or joint borrowers including tenant farmers", "Valid Aadhaar and active bank account"],
    requiredDocuments: ["Aadhaar card", "Land records or lease agreement", "Recent passport photo", "Bank account details"],
    applicationDeadline: "2027-03-31",
    stateApplicability: ["All India"],
    ministryDepartment: "Ministry of Finance",
    applicationLink: "https://www.nabard.org/",
    category: "Financial assistance schemes",
    isTrending: true,
    status: "Published"
  },
  {
    schemeName: "National Food Security Mission",
    description: "Scheme to increase production of rice, wheat, pulses, coarse cereals, and commercial crops through area expansion and productivity enhancement.",
    benefits: ["Subsidized certified seeds supply", "Demonstrations of improved varieties", "Farmer training and capacity building"],
    eligibilityCriteria: ["Farmer cultivating notified crops in targeted districts", "Registered with local agriculture department", "Willing to adopt improved seed and technology packages"],
    requiredDocuments: ["Aadhaar card", "Land record", "Crop cultivation declaration", "Bank account"],
    applicationDeadline: "2026-06-30",
    stateApplicability: ["All India"],
    ministryDepartment: "Ministry of Agriculture and Farmers Welfare",
    applicationLink: "https://nfsm.gov.in/",
    category: "Crop seed purchase schemes",
    isTrending: false,
    status: "Published"
  },
  {
    schemeName: "Paramparagat Krishi Vikas Yojana",
    description: "Promotes organic farming through cluster-based approach, providing financial assistance for organic inputs, certification, and market linkage.",
    benefits: ["Rs. 50,000 per hectare assistance over 3 years", "Support for organic input procurement and certification", "Access to organic produce markets and e-commerce platforms"],
    eligibilityCriteria: ["Farmers forming cluster groups of 20 or more", "Agricultural land suitable for organic conversion", "Willingness to follow organic farming practices for 3 years"],
    requiredDocuments: ["Aadhaar card", "Land records", "Group formation certificate", "Bank account details"],
    applicationDeadline: "2026-11-30",
    stateApplicability: ["All India"],
    ministryDepartment: "Ministry of Agriculture and Farmers Welfare",
    applicationLink: "https://pgsindia-ncof.gov.in/",
    category: "Agriculture schemes",
    isTrending: false,
    status: "Published"
  },
  {
    schemeName: "Pradhan Mantri Krishi Sinchai Yojana",
    description: "Ensuring access to protective irrigation for all agricultural farms to expand cultivated area and improve on-farm water use efficiency.",
    benefits: ["Financial support for micro-irrigation infrastructure", "Water source creation and strengthening", "Participatory irrigation management support"],
    eligibilityCriteria: ["Farmer with agricultural land", "Area under command of project or eligible irrigation source", "Registration with state agriculture or water department"],
    requiredDocuments: ["Land records", "Aadhaar card", "Bank passbook", "Irrigation source certificate if applicable"],
    applicationDeadline: "2027-01-15",
    stateApplicability: ["All India"],
    ministryDepartment: "Ministry of Jal Shakti",
    applicationLink: "https://pmksy.gov.in/",
    category: "Irrigation support",
    isTrending: true,
    status: "Published"
  },
  {
    schemeName: "Sub-Mission on Agricultural Mechanization",
    description: "Scheme to increase the reach of farm mechanization to small and marginal farmers and promote high-tech and precision farming technologies.",
    benefits: ["40–50% subsidy on farm equipment purchase", "Custom Hiring Centres for shared machinery", "Support for high-tech farming tools"],
    eligibilityCriteria: ["Small, marginal, or SC/ST farmer preferred", "Individual farmer or farmer group", "First-time equipment buyer preferred for subsidy"],
    requiredDocuments: ["Aadhaar card", "Land records", "Quotation from authorized dealer", "Bank passbook"],
    applicationDeadline: "2026-08-31",
    stateApplicability: ["All India"],
    ministryDepartment: "Ministry of Agriculture and Farmers Welfare",
    applicationLink: "https://agrimachinery.nic.in/",
    category: "Agriculture schemes",
    isTrending: false,
    status: "Published"
  },
  {
    schemeName: "Soil Health Card Scheme",
    description: "Issues soil health cards to farmers carrying crop-wise recommendations of nutrients and fertilizers required for individual farms.",
    benefits: ["Free soil testing every 2 years", "Crop-specific fertilizer recommendations", "Guidance to reduce input costs and improve yield"],
    eligibilityCriteria: ["Any farmer with cultivable agricultural land", "Registration with village-level or district agriculture office", "Cooperation with soil sample collection process"],
    requiredDocuments: ["Aadhaar card", "Land record", "Bank account", "Mobile number for SMS alerts"],
    applicationDeadline: "2027-03-31",
    stateApplicability: ["All India"],
    ministryDepartment: "Ministry of Agriculture and Farmers Welfare",
    applicationLink: "https://soilhealth.dac.gov.in/",
    category: "Agriculture schemes",
    isTrending: false,
    status: "Published"
  },
  {
    schemeName: "Jal Jeevan Mission",
    description: "Provides safe and adequate drinking water through individual household tap connections to every rural household by 2024.",
    benefits: ["Functional household tap connection for every rural home", "55 litres per capita per day clean drinking water", "Water quality monitoring and surveillance"],
    eligibilityCriteria: ["Rural household not covered by piped water", "Below-poverty-line households prioritized", "Willingness to contribute nominal user charges"],
    requiredDocuments: ["Aadhaar card", "Residence proof", "Bank account", "BPL certificate if applicable"],
    applicationDeadline: "2026-12-31",
    stateApplicability: ["All India"],
    ministryDepartment: "Ministry of Jal Shakti",
    applicationLink: "https://jaljeevanmission.gov.in/",
    category: "Water and clean drinking water schemes",
    isTrending: false,
    status: "Published"
  },
  {
    schemeName: "National Horticulture Mission",
    description: "Holistic development of horticulture crops to ensure nutritional security, income support, and demand-supply balance of fruits, vegetables, and flowers.",
    benefits: ["Subsidy on planting material, infrastructure, and cold storage", "Support for post-harvest management and processing", "Market development assistance for horticultural produce"],
    eligibilityCriteria: ["Farmer growing horticultural crops", "Small and marginal farmers given priority", "Compliance with state horticulture department guidelines"],
    requiredDocuments: ["Aadhaar card", "Land records", "Horticulture crop declaration", "Bank passbook"],
    applicationDeadline: "2026-09-30",
    stateApplicability: ["All India"],
    ministryDepartment: "Ministry of Agriculture and Farmers Welfare",
    applicationLink: "https://nhm.nic.in/",
    category: "Agriculture schemes",
    isTrending: false,
    status: "Published"
  },
  {
    schemeName: "Modified Interest Subvention Scheme",
    description: "Provides short-term credit to farmers at a subsidized 7% interest rate per annum, with additional 3% incentive for prompt repayment.",
    benefits: ["Crop loan at 7% interest rate", "Additional 3% subvention for timely repayment — effectively 4%", "Covers all Kisan Credit Card holders growing food and non-food crops"],
    eligibilityCriteria: ["Farmer with Kisan Credit Card", "Loan amount up to Rs. 3 lakh", "Repayment within prescribed time period"],
    requiredDocuments: ["Kisan Credit Card", "Aadhaar card", "Land record", "Bank account details"],
    applicationDeadline: "2027-03-31",
    stateApplicability: ["All India"],
    ministryDepartment: "Ministry of Finance",
    applicationLink: "https://www.nabard.org/",
    category: "Financial assistance schemes",
    isTrending: false,
    status: "Published"
  },
  {
    schemeName: "Rashtriya Krishi Vikas Yojana",
    description: "Incentivizes states to increase public investment in agriculture and allied sectors, enhancing production and farmer income.",
    benefits: ["Project-based funding for farm infrastructure", "Support for seed villages, FPOs, and market linkage", "Assistance for post-harvest and storage infrastructure"],
    eligibilityCriteria: ["Applied through state government schemes", "Individual farmer, cooperative, or SHG", "Project must align with district agriculture plan"],
    requiredDocuments: ["Aadhaar card", "Land records", "Project proposal or state scheme enrollment", "Bank account"],
    applicationDeadline: "2026-12-31",
    stateApplicability: ["All India"],
    ministryDepartment: "Ministry of Agriculture and Farmers Welfare",
    applicationLink: "https://rkvy.nic.in/",
    category: "Agriculture schemes",
    isTrending: false,
    status: "Published"
  },
  {
    schemeName: "Pradhan Mantri Kisan Maandhan Yojana",
    description: "Voluntary and contributory pension scheme for small and marginal farmers ensuring a minimum pension of Rs. 3,000 per month after age 60.",
    benefits: ["Rs. 3,000 per month pension after 60 years of age", "Matching government contribution equal to farmer's monthly contribution", "Nominee benefit in case of farmer's death"],
    eligibilityCriteria: ["Small and marginal farmer aged 18–40 years", "Land holding up to 2 hectares", "Not covered under any other pension scheme"],
    requiredDocuments: ["Aadhaar card", "Land records", "Bank account linked to Aadhaar", "Mobile number"],
    applicationDeadline: "2027-03-31",
    stateApplicability: ["All India"],
    ministryDepartment: "Ministry of Agriculture and Farmers Welfare",
    applicationLink: "https://maandhan.in/",
    category: "DBT schemes",
    isTrending: false,
    status: "Published"
  },
  {
    schemeName: "Agriculture Infrastructure Fund",
    description: "Medium to long-term debt financing facility for agriculture infrastructure such as warehouses, cold storage, and processing units.",
    benefits: ["Loans up to Rs. 2 crore at 3% interest subvention", "Credit guarantee for loans up to Rs. 2 crore", "Support for primary agriculture cooperative societies and FPOs"],
    eligibilityCriteria: ["Farmer, FPO, PACS, cooperative society, agri-entrepreneur", "Project for post-harvest infrastructure or community farming assets", "Must apply through financial institution or NABARD"],
    requiredDocuments: ["Aadhaar card", "Project detailed report", "Land records or lease document", "Business plan"],
    applicationDeadline: "2032-03-31",
    stateApplicability: ["All India"],
    ministryDepartment: "Ministry of Agriculture and Farmers Welfare",
    applicationLink: "https://agriinfra.dac.gov.in/",
    category: "Financial assistance schemes",
    isTrending: true,
    status: "Published"
  },
  {
    schemeName: "Mahila Kisan Sashaktikaran Pariyojana",
    description: "Empowers women farmers through capacity building, improved technologies, and market access to increase their sustainable agricultural productivity.",
    benefits: ["Skill development training for women farmers", "Financial support for women-led SHGs in agriculture", "Access to better seeds, inputs, and implements"],
    eligibilityCriteria: ["Women farmer or women-led self-help group", "Engaged in crop cultivation, livestock, or allied activities", "Member of a registered SHG or cooperative preferred"],
    requiredDocuments: ["Aadhaar card", "SHG registration certificate if applicable", "Land record or cultivation proof", "Bank account"],
    applicationDeadline: "2026-11-30",
    stateApplicability: ["All India"],
    ministryDepartment: "Ministry of Rural Development",
    applicationLink: "https://aajeevika.gov.in/",
    category: "Agriculture schemes",
    isTrending: false,
    status: "Published"
  },
  {
    schemeName: "National Livestock Mission",
    description: "Focuses on sustainable development of livestock sector by enhancing productivity, ensuring availability of quality fodder, and risk management.",
    benefits: ["Subsidy for feed, fodder, and livestock breed improvement", "Entrepreneurship development in poultry, sheep, goat, and pig rearing", "Credit guarantee for livestock-based enterprises"],
    eligibilityCriteria: ["Farmer engaged in livestock rearing", "Individual, SHG, FPO, or cooperative", "State government livestock department registration"],
    requiredDocuments: ["Aadhaar card", "Livestock details and ownership proof", "Bank account", "State department registration certificate"],
    applicationDeadline: "2026-10-31",
    stateApplicability: ["All India"],
    ministryDepartment: "Department of Animal Husbandry and Dairying",
    applicationLink: "https://dahd.nic.in/",
    category: "Livestock and dairy schemes",
    isTrending: false,
    status: "Published"
  }
];


async function seedSchemes() {
  validateEnv();
  await connectDb();

  await Scheme.deleteMany({ schemeName: { $in: schemes.map((scheme) => scheme.schemeName) } });
  await Scheme.insertMany(schemes);

  console.log(`Seeded ${schemes.length} government schemes`);
  process.exit(0);
}

seedSchemes().catch((error) => {
  console.error("Failed to seed schemes:", error);
  process.exit(1);
});
