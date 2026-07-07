import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");
const OUTPUT_DIR = path.resolve(process.env.VIJAYA_OUTPUT_DIR || ".");
const IS_ROOT_OUTPUT = OUTPUT_DIR === ROOT;
const SITE_URL = "https://vijaya.construction";
const TODAY = new Date().toISOString().slice(0, 10);
const SITE_VARIANT = process.env.VIJAYA_SITE_VARIANT || "approved";
const IS_ALL_EDITS_PREVIEW = SITE_VARIANT === "all-edits-preview";
const ASSET_VERSION = IS_ALL_EDITS_PREVIEW ? "20260707-all-edits-preview-2" : "20260707-approved-copy-1";
const SECURITY_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "img-src 'self' data: https:",
  "font-src 'self' https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline'",
  "script-src-attr 'none'",
  "connect-src 'self' https://api.web3forms.com",
  "frame-src https://www.google.com https://maps.google.com",
  "form-action 'self' https://api.web3forms.com",
  "manifest-src 'self'",
  "media-src 'self'",
  "worker-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const site = {
  name: "Vijaya Construction",
  legalName: "Vijaya Construction",
  phone: "+91 93958-63300",
  phoneHref: "tel:+919395863300",
  whatsapp: "https://wa.me/919395863300",
  email: "partner@vijaya.construction",
  careersEmail: "careers@vijaya.construction",
  facebook: "https://www.facebook.com/profile.php?id=100064843146162&mibextid=ZbWKwL",
  instagram: "https://www.instagram.com/vijayaconstruction/",
  membershipName: "AREIDA",
  membershipFullName: "Assam Real Estate and Infrastructure Developers Association (CREDAI Assam)",
  address: "Floor 1, Vijaya Kamal Kutir, MC Road, Chenikuthi, Guwahati, Assam 781003",
  officeHours: "Monday to Saturday: 10:00 am to 06:00 pm",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Vijaya%20Construction%20Floor%201%20Vijaya%20Kamal%20Kutir%20MC%20Road%20Chenikuthi%20Guwahati%20Assam%20781003",
  mapsEmbed: "https://www.google.com/maps?q=Vijaya%20Construction%2C%20Floor%201%2C%20Vijaya%20Kamal%20Kutir%2C%20MC%20Road%2C%20Chenikuthi%2C%20Guwahati%2C%20Assam%20781003&output=embed",
};

const bhkOptions = ["1 BHK", "2 BHK", "3 BHK", "4+ BHK"];

function previewCopy(current, allEdits) {
  return IS_ALL_EDITS_PREVIEW ? allEdits : current;
}

const icons = {
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z"></path></svg>',
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.3 8.3 0 0 1-3.8-.9L3 21l1.9-5.7a8.3 8.3 0 0 1-.9-3.8A8.4 8.4 0 0 1 12.5 3H13a8.5 8.5 0 0 1 8 8.5z"></path></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>',
  shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
  key: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 2l-2 2"></path><path d="m15 8 2-2"></path><circle cx="7.5" cy="14.5" r="5.5"></circle><path d="m12 10 8-8"></path></svg>',
  plan: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h18v18H3z"></path><path d="M9 3v18"></path><path d="M15 3v8"></path><path d="M9 11h12"></path></svg>',
};

const ongoingProjects = [
  {
    slug: "vijaya-ashiyana",
    name: "Vijaya Ashiyana",
    status: "Ongoing",
    statusLabel: "Now selling",
    location: "Rajgarh Link Road, Guwahati",
    city: "Guwahati",
    units: "70 Flats",
    completion: "December 2029",
    rera: "RERAA KM 88 OF 2025-2026",
    type: "Premium Residential Apartments",
    image: "ashiyana-hero",
    heroImage: "home-hero",
    brochurePage: "ashiyana-brochure.html",
    brochurePdf: "vijaya-ashiyana.pdf",
    short: "A high-rise on Rajgarh Link Road with planned rooftop leisure, swimming pool, gymnasium, banquet hall, landscaped open spaces, EV charging, and family amenities.",
    intro: "Discover Vijaya Ashiyana, redefining luxury living in central Guwahati. It is thoughtfully designed for discerning homebuyers who seek a prime location, world-class amenities, and a truly refined lifestyle.",
    highlights: ["Rajgarh Link Road address", "Rooftop leisure planning", "Swimming pool", "Gymnasium and banquet hall", "EV charging and family amenities"],
    amenities: [
      ["Health and wellness", "Swimming pool, yoga and meditation pavilion, walking and jogging track, and acupressure pathway."],
      ["Recreation and play", "Multipurpose sports turf, kids' play area, and kids' splash pool for daily family use."],
      ["Community and leisure", "Outdoor barbeque, party area, sitting spaces, and a senior citizens' corner."],
      ["Convenience and security", "Designer lobby, two advanced spacious lifts, 24x7 CCTV, society office, and common-service backup."],
      ["EV-ready planning", "Charging provision shown in the amenity render set."],
      ["Central Guwahati", "A location positioned for buyers searching apartments in Guwahati."],
    ],
    gallery: [
      ["ashiyana-hero", "Drive Way View"],
      ["ashiyana-aerial", "Aerial View"],
      ["ashiyana-gate", "Entrance Gate"],
      ["ashiyana-rooftop", "Rooftop Amenities Plan"],
      ["ashiyana-garden", "Landscaped Garden"],
      ["ashiyana-lobby", "Premium Lobby and Reception"],
      ["ashiyana-gym", "Modern Gymnasium"],
      ["ashiyana-banquet", "Exclusive Banquet Hall"],
      ["ashiyana-plan-01", "Floor Plan"],
      ["ashiyana-plan-04", "Floor Plan with Terrace Garden"],
    ],
  },
  {
    slug: "vijaya-sterling-heights",
    name: "Vijaya Sterling Heights",
    status: "Ongoing",
    statusLabel: "Sold out",
    salesStatus: "Sold out",
    enquiryEnabled: false,
    location: "Kerakuchi, Guwahati",
    city: "Guwahati",
    units: "49 Flats",
    completion: "December 2026",
    rera: "RERAA KM 05",
    type: "Residential Apartments",
    image: "sterling-heights-hero",
    heroImage: "sterling-heights-hero",
    brochurePage: "sterling-heights-brochure.html",
    brochurePdf: "vijaya-sterling-heights.pdf",
    short: "A premium residential development in Kerakuchi with an elegant gated entrance and signature Vijaya architecture. Sterling Heights is now sold out.",
    intro: "Vijaya Sterling Heights is an ongoing Kerakuchi residential project with an elegant gated entrance, signature Vijaya architecture, and sold-out buyer interest.",
    highlights: ["Kerakuchi, Guwahati", "49 flats", "Sold out", "December 2026 completion target", "RERA reference available"],
    amenities: [
      ["Gated arrival", "Architectural entrance planning with controlled residential access."],
      ["Family-sized homes", "A sold-out Vijaya address that continues to show buyer confidence in the brand."],
      ["Near-term timeline", "A December 2026 completion target for buyers seeking earlier possession."],
      ["Developer record", "Backed by Vijaya's 22 completed projects across Assam."],
    ],
    gallery: [
      ["sterling-heights-hero", "Vijaya Sterling Heights architectural rendering"],
      ["sterling-heights-view", "Vijaya Sterling Heights street elevation rendering"],
    ],
  },
  {
    slug: "vijaya-sapphire",
    name: "Vijaya Sapphire",
    status: "Ongoing",
    statusLabel: "Now selling",
    location: "Kachari Gaon, Tezpur",
    city: "Tezpur",
    units: "24 Flats + 2 Commercial Floors",
    completion: "December 2026",
    rera: "RERAA ST 149 OF 2024-2025",
    type: "Residential and Commercial",
    image: "sapphire-hero",
    heroImage: "sapphire-hero",
    brochurePage: "sapphire-brochure.html",
    brochurePdf: "vijaya-sapphire.pdf",
    short: "A premier mixed-use development in Kachari Gaon, Tezpur, with a striking facade and street-facing presence in the heart of the city.",
    intro: "Vijaya Sapphire extends the Vijaya Construction standard to Tezpur with residences and commercial frontage for a visible, connected city address.",
    highlights: ["Kachari Gaon, Tezpur", "24 flats plus 2 commercial floors", "December 2026 completion target", "RERA reference available", "Dedicated brochure"],
    amenities: [
      ["Street presence", "Designed with a visible commercial frontage and residential upper floors."],
      ["Compact inventory", "A limited 24-flat project for focused buyer attention."],
      ["Tezpur location", "A dedicated option for homebuyers looking beyond Guwahati."],
      ["Developer record", "Delivered by the same team behind Vijaya's Guwahati portfolio."],
    ],
    gallery: [["sapphire-hero", "Vijaya Sapphire architectural rendering in Tezpur"]],
  },
];

const completedProjects = [
  ["vijaya-apartments", "Vijaya Apartments", "Ulubari, Guwahati", "Guwahati", "90 Flats", "2006", "apartments-photo"],
  ["vijaya-complex", "Vijaya Complex", "Beltola, Guwahati", "Guwahati", "104 Flats", "2010", "complex-photo"],
  ["vijaya-crescent", "Vijaya Crescent", "Kharghuli, Guwahati", "Guwahati", "22 Flats", "2013", "crescent-photo"],
  ["vijaya-heights", "Vijaya Heights", "New Guwahati, Guwahati", "Guwahati", "56 Flats", "2014", "heights-photo"],
  ["vijaya-enclave", "Vijaya Enclave", "Beltola, Guwahati", "Guwahati", "119 Flats", "2016", "enclave-photo"],
  ["vijaya-kamal-kutir", "Vijaya Kamal Kutir", "Chenikuthi, Guwahati", "Guwahati", "4 Flats + 16 Shops", "2016", "kamal-kutir-photo"],
  ["vijaya-residency", "Vijaya Residency", "Zoo-Narengi Road, Guwahati", "Guwahati", "32 Flats", "2016", "residency-photo", "residency-render"],
  ["vijaya-orchid", "Vijaya Orchid", "Beltola, Guwahati", "Guwahati", "32 Flats", "2017", "orchid-photo", "orchid-render"],
  ["vijaya-classic", "Vijaya Classic", "Pub Sarania, Guwahati", "Guwahati", "15 Flats", "2017", "classic-photo"],
  ["vijaya-royal-crest", "Vijaya Royal Crest", "Zoo-Narengi Road, Guwahati", "Guwahati", "16 Flats", "2017", "royal-crest-photo", "royal-crest-render"],
  ["vijaya-mrinalini", "Vijaya Mrinalini", "Silpukhuri, Guwahati", "Guwahati", "18 Flats", "2017", "mrinalini-photo"],
  ["vijaya-mayfair-manor", "Vijaya Mayfair Manor", "Beltola, Guwahati", "Guwahati", "15 Flats", "2017", "mayfair-manor-photo"],
  ["vijaya-heritage", "Vijaya Heritage", "Kachari Gaon, Tezpur", "Tezpur", "18 Flats + 2 Commercial", "2018", "heritage-photo"],
  ["vijaya-ashrayam", "Vijaya Ashrayam", "Bamunimaidan, Guwahati", "Guwahati", "13 Flats", "2019", "ashrayam-render"],
  ["vijaya-white-orchid", "Vijaya White Orchid", "Hatigaon, Guwahati", "Guwahati", "12 Flats", "2020", "white-orchid-photo"],
  ["vijaya-serenity", "Vijaya Serenity", "Pub Sarania, Guwahati", "Guwahati", "8 Flats", "2020", "serenity-render"],
  ["vijaya-golden-crest", "Vijaya Golden Crest", "Panjabari, Guwahati", "Guwahati", "24 Flats", "2020", "golden-crest-photo", "golden-crest-render"],
  ["vijaya-jyoti", "Vijaya Jyoti", "New Guwahati, Guwahati", "Guwahati", "20 Flats", "2021", "jyoti-photo", "jyoti-render"],
  ["vijaya-emerald", "Vijaya Emerald", "Wireless, Guwahati", "Guwahati", "8 Flats", "2022", "emerald-photo", "emerald-render"],
  ["vijaya-eternity", "Vijaya Eternity", "Survey, Guwahati", "Guwahati", "24 Flats", "2022", "eternity-render"],
  ["vijaya-imperial-towers", "Vijaya Imperial Towers", "Kerakuchi, Guwahati", "Guwahati", "44 Flats", "2024", "imperial-towers-photo", "imperial-towers-day"],
  ["vijaya-golden-orchid", "Vijaya Golden Orchid", "Kharghuli, Guwahati", "Guwahati", "21 Flats", "2024", "golden-orchid-day", "golden-orchid-night"],
].map(([slug, name, location, city, units, completed, image, proofImage]) => ({
  slug,
  name,
  status: "Completed",
  statusLabel: "Delivered",
  location,
  city,
  units,
  completed,
  type: "Completed residential project",
  image,
  heroImage: proofImage || image,
  proofImage,
  short: `${name} is a completed Vijaya Construction project in ${location}, delivered in ${completed}.`,
  intro: `${name} forms part of Vijaya Construction's delivered portfolio across Assam, showing the on-ground record behind the company's current homes in Guwahati and Tezpur.`,
  highlights: [location, units, `Completed in ${completed}`, "Delivered Vijaya project"],
  gallery: [
    [proofImage || image, `${name} completed exterior or architectural archive image`],
    ...(proofImage ? [[image, `${name} architectural archive rendering`]] : []),
  ],
}));

if (IS_ALL_EDITS_PREVIEW) {
  const ashiyana = ongoingProjects.find((project) => project.slug === "vijaya-ashiyana");
  if (ashiyana) {
    Object.assign(ashiyana, {
      short: "A high-rise residential address on Rajgarh Link Road with planned rooftop leisure, swimming pool, gymnasium, banquet hall, landscaped open spaces, EV charging, and curated family amenities.",
      intro: "Discover Vijaya Ashiyana - redefining luxury living in central Guwahati. It is thoughtfully designed for discerning homebuyers who seek a prime location, world-class amenities, and a truly refined lifestyle.",
      amenities: [
        ["Health & Wellness", "A refreshing swimming pool, a tranquil yoga/meditation pavilion, a walking/jogging track, and a dedicated acupressure pathway."],
        ["Recreation & Play", "A multipurpose sports turf, a vibrant kids' play area, and a kids' splash pool."],
        ["Community & Leisure", "An outdoor barbeque zone, a party area, relaxed sitting spaces, and a thoughtful senior citizens' corner."],
        ["Convenience & Security", "A stunning designer lobby, two advanced spacious lifts, 24x7 CCTV monitoring, a dedicated society office, and adequate power backup for common services."],
      ],
      lifestyleCopy: "Rising above Rajgarh Link Road, this premium high-rise contains lush, landscaped open spaces, exclusive rooftop leisure zones, a modern gymnasium, an elegant banquet hall, and future-ready EV charging. Every amenity has been curated to offer a seamless, elevated living experience.",
    });
  }

  const sterling = ongoingProjects.find((project) => project.slug === "vijaya-sterling-heights");
  if (sterling) {
    Object.assign(sterling, {
      short: "A premium residential development in Kerakuchi, Guwahati, welcoming you with an elegant gated entrance and our signature Vijaya Construction architecture.",
      intro: "Vijaya Sterling Heights is ongoing but sold out, with an elegant gated entrance and signature Vijaya Construction architecture in Kerakuchi, Guwahati.",
    });
  }

  const sapphire = ongoingProjects.find((project) => project.slug === "vijaya-sapphire");
  if (sapphire) {
    Object.assign(sapphire, {
      short: "A premier mixed-use development in Kachari Gaon, Tezpur, featuring a striking facade with a convenient street-facing presence in the heart of the city.",
    });
  }
}

const allProjects = [...ongoingProjects, ...completedProjects];
const displayOngoingProjects = ["vijaya-sterling-heights", "vijaya-sapphire", "vijaya-ashiyana"]
  .map((slug) => ongoingProjects.find((project) => project.slug === slug))
  .filter(Boolean);
const enquiryProjects = ongoingProjects.filter((project) => project.enquiryEnabled !== false);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function imagePath(prefix, name) {
  return `${prefix}assets/images/${name}.webp`;
}

function brochurePath(prefix, file) {
  return `${prefix}assets/brochures/${file}`;
}

function brochurePreviewPath(prefix, file) {
  return `${prefix}assets/images/${file.replace(/\.pdf$/i, "-preview.webp")}`;
}

function projectUrl(prefix, project) {
  return `${prefix}buildings/${project.slug}.html`;
}

function brochureUrl(prefix, project) {
  return `${prefix}brochures/${project.brochurePage}`;
}

function whatsappLink(message) {
  return `${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

function header(prefix = "") {
  const brandPlace = IS_ALL_EDITS_PREVIEW ? "" : '<span class="brand-place">Assam</span>';
  return `<header class="site-header">
  <div class="nav-shell">
    <a class="brand" href="${prefix}index.html" aria-label="Vijaya Construction home">
      <span class="brand-logo"><img src="${prefix}assets/images/vijaya-logo.png" alt="" aria-hidden="true"></span>
      <span class="brand-text"><span class="brand-name">Vijaya Construction</span>${brandPlace}</span>
    </a>
    <nav class="primary-nav" data-primary-nav aria-label="Primary navigation">
      <a href="${prefix}index.html#ongoing">Ongoing Projects</a>
      <a href="${prefix}completed.html">${previewCopy("Completed", "Completed Projects")}</a>
      <a href="${prefix}index.html#why-vijaya">${previewCopy("Why Vijaya", "Why Vijaya Construction")}</a>
      <a href="${prefix}index.html#contact">Contact</a>
    </nav>
    <div class="nav-actions">
      <a class="btn btn-primary desktop-only" href="${site.phoneHref}">${icons.phone} Call Sales</a>
      <button class="nav-toggle" type="button" data-nav-toggle aria-label="Open navigation" aria-expanded="false"><span></span></button>
    </div>
  </div>
</header>`;
}

function footer(prefix = "") {
  const footerCopy = previewCopy(
    `Vijaya Construction develops luxury flats and premium residential projects in Guwahati and Tezpur, backed by 22 completed developments, RERA references where available, and membership in ${site.membershipName}.`,
    `Vijaya Construction brings premium residential and commercial projects to life in Guwahati and Tezpur. With 22 completed developments, transparent RERA-registered projects, and our proud ${site.membershipName} membership, our commitment to quality is a record you can verify.`
  );
  const footerBrandline = IS_ALL_EDITS_PREVIEW ? '      <div class="footer-brandline">Vijaya Construction</div>\n' : "";
  return `<footer class="site-footer">
  <div class="footer-grid">
    <div>
${footerBrandline}      <h2>Crafting Homes for Families. A Legacy You Can Trust.</h2>
      <p>${footerCopy}</p>
    </div>
    <div>
      <h3>Projects</h3>
      <a href="${prefix}index.html#ongoing">Ongoing Projects</a>
      <a href="${prefix}completed.html">Completed Projects</a>
      <a href="${prefix}buildings/vijaya-ashiyana.html">Vijaya Ashiyana</a>
      <a href="${prefix}buildings/vijaya-sapphire.html">Vijaya Sapphire</a>
    </div>
    <div>
      <h3>Contact</h3>
      <a href="${site.phoneHref}">${site.phone}</a>
      <a href="mailto:${site.email}">${site.email}</a>
      <a href="mailto:${site.careersEmail}?subject=Careers%20at%20Vijaya%20Construction">Careers</a>
      <a href="mailto:${site.email}?subject=Landowner%20partnership%20enquiry">Landowner partnerships</a>
      <a href="mailto:${site.email}?subject=Vendor%20enquiry%20for%20Vijaya%20Construction">Vendor enquiries</a>
    </div>
    <div>
      <h3>Social</h3>
      <a href="${site.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>
      <a href="${site.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a>
      <a href="${site.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
    </div>
  </div>
  <div class="footer-bottom">
    <span>Copyright ${new Date().getFullYear()} Vijaya Construction. Project availability, specifications, and timelines are subject to official sales confirmation.</span>
    <span class="footer-credit">Developed by <a href="https://quasont.dev" target="_blank" rel="noopener noreferrer">QuaSont Creative Labs</a></span>
  </div>
  <div class="footer-wordmark" aria-hidden="true">VIJAYA CONSTRUCTION</div>
</footer>`;
}

function mobileCta() {
  return `<div class="mobile-cta" aria-label="Quick contact">
  <a class="btn btn-primary" href="${site.phoneHref}">${icons.phone} Call</a>
  <a class="btn btn-whatsapp" href="${whatsappLink("Hi Vijaya Construction, I would like to chat with a sales agent.")}" target="_blank" rel="noopener noreferrer">${icons.chat} WhatsApp</a>
</div>`;
}

function agentChat() {
  return `<details class="agent-chat">
  <summary aria-label="Chat with a Vijaya sales agent">${icons.chat}<span>Chat with our agent</span></summary>
  <div class="agent-chat-panel">
    <strong>Vijaya sales desk</strong>
    <p>Ask for pricing, availability, floor plans, or a guided site visit slot.</p>
    <a class="btn btn-gold" href="${whatsappLink("Hi Vijaya Construction, I would like to chat with a sales agent.")}" target="_blank" rel="noopener noreferrer">${icons.chat} WhatsApp</a>
    <a class="btn btn-subtle" href="${site.phoneHref}">${icons.phone} Call</a>
  </div>
</details>`;
}

function officeLocation() {
  const appointmentCopy = previewCopy("By appointment only", "(By Appointment Only)");
  const readyCopy = previewCopy("Ready to book?", "Ready To Book?");
  return `<section class="office-section" id="office">
  <div class="section-inner">
    <div class="office-cards">
      <article class="office-card">
        <span class="office-icon">${icons.clock}</span>
        <h2>We are open</h2>
        <p>Monday to Saturday<br>10:00 am to 06:00 pm</p>
        <p>${appointmentCopy}</p>
      </article>
      <article class="office-card">
        <span class="office-icon">${icons.pin}</span>
        <h2>Head office</h2>
        <p>${escapeHtml(site.address)}</p>
        <a href="${site.mapsUrl}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
      </article>
      <article class="office-card">
        <span class="office-icon">${icons.phone}</span>
        <h2>Call us</h2>
        <p>${readyCopy}</p>
        <a href="${site.phoneHref}">${site.phone}</a>
      </article>
    </div>
    <div class="office-map">
      <iframe title="Vijaya Construction office location on Google Maps" src="${site.mapsEmbed}" loading="eager" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
    </div>
  </div>
</section>`;
}

function workWithVijaya() {
  const workCards = IS_ALL_EDITS_PREVIEW
    ? [
        {
          icon: icons.shield,
          heading: "Careers",
          href: `mailto:${site.careersEmail}?subject=Careers%20at%20Vijaya%20Construction`,
          text: `Interested in building your career with Vijaya Construction? Please email your resume in PDF format with a recent passport-sized photograph on a white background to ${site.careersEmail}. Our hiring team will review your profile to find the best possible fit. If there are no openings at the time, we will keep your resume on record and reach out as soon as the right opportunity arises.`,
        },
        {
          icon: icons.key,
          heading: "Landowners",
          href: `mailto:${site.email}?subject=Landowner%20partnership%20enquiry`,
          text: `If you own land and are looking to develop it, we will be happy to explore business possibilities with you. Please email your land specifications along with all related legal documents to ${site.email}.`,
        },
        {
          icon: icons.plan,
          heading: "Vendors",
          href: `mailto:${site.email}?subject=Vendor%20enquiry%20for%20Vijaya%20Construction`,
          text: "We welcome high-quality suppliers. Please use the email address above to share your product catalogues, quotes, or company profiles with our team.",
        },
      ]
    : [
        {
          icon: icons.key,
          heading: "Landowners",
          href: `mailto:${site.email}?subject=Landowner%20partnership%20enquiry`,
          text: "Discuss development partnerships and site opportunities with the Vijaya team.",
        },
        {
          icon: icons.shield,
          heading: "Careers",
          href: `mailto:${site.careersEmail}?subject=Careers%20at%20Vijaya%20Construction`,
          text: "Send your profile for construction, operations, sales, or office roles.",
        },
        {
          icon: icons.plan,
          heading: "Vendors",
          href: `mailto:${site.email}?subject=Vendor%20enquiry%20for%20Vijaya%20Construction`,
          text: "Share material, service, and project support proposals for consideration.",
        },
      ];
  const cards = workCards
    .map(
      (card) => `<a class="work-card" href="${card.href}">
        <span>${card.icon}</span>
        <h3>${card.heading}</h3>
        <p>${escapeHtml(card.text)}</p>
      </a>`
    )
    .join("\n      ");
  return `<section class="work-section" id="work-with-vijaya">
  <div class="section-inner">
    <div class="work-head">
      <span class="eyebrow">Work with Vijaya</span>
      <h2>Partnerships, careers, and vendor conversations handled directly.</h2>
      <p>Reach the right desk for landowner partnerships, career applications, and vendor proposals connected to Vijaya Construction projects in Assam.</p>
    </div>
    <div class="work-grid">
      ${cards}
    </div>
  </div>
</section>`;
}

function leadForm(subject, selectedProject = "") {
  const projectOptions = enquiryProjects
    .map((project) => `<option value="${escapeHtml(project.name)}"${project.name === selectedProject ? " selected" : ""}>${escapeHtml(project.name)}</option>`)
    .join("");
  const bhk = bhkOptions.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("");
  const messagePlaceholder = previewCopy(
    "I would like to know more about the floor plans, pricing, availability and a call to schedule a guided site visit.",
    "I would like to know more about the floor plans, pricing, availability and a call to schedule a safe site visit."
  );
  const submitLabel = previewCopy("Request callback", "Request Callback?");
  const formNote = previewCopy(
    "A Vijaya sales representative can guide active project availability, floor plans, pricing, and guided site visit timing.",
    "A Vijaya Construction sales representative will be in touch shortly with all the information you need to choose your perfect home."
  );

  return `<form class="lead-form" method="POST">
  <input type="hidden" name="access_key" value="ab5435a1-83fa-4dbb-8e8a-6ef8486157ca">
  <input type="hidden" name="subject" value="${escapeHtml(subject)}">
  <input type="hidden" name="from_name" value="Vijaya Construction Website">
  <input class="hp-field" type="text" name="botcheck" tabindex="-1" autocomplete="off">
  <div class="form-grid two">
    <label>Full Name <input name="name" type="text" autocomplete="name" required></label>
    <label>Phone or Email <input name="contact" type="text" autocomplete="email" required></label>
  </div>
  <div class="form-grid two">
    <label>Preferred Project <select name="project" required><option value="">Select Project</option>${projectOptions}</select></label>
    <label>BHK Preference <select name="bhk_interest" required><option value="">Select BHK</option>${bhk}</select></label>
  </div>
  <label>Message <textarea name="message" placeholder="${messagePlaceholder}"></textarea></label>
  <div class="form-foot">
    <button class="btn btn-primary submit-btn" type="submit">${icons.arrow} ${submitLabel}</button>
    <a class="btn btn-whatsapp" href="${site.whatsapp}" target="_blank" rel="noopener noreferrer">${icons.chat} WhatsApp</a>
  </div>
  <p class="form-note">${formNote}</p>
</form>`;
}

function schemaGraph(items) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": items }, null, 2).replaceAll("</", "<\\/");
}

function organizationSchema() {
  return {
    "@type": ["Organization", "RealEstateAgent"],
    "@id": `${SITE_URL}/#organization`,
    name: site.name,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/images/vijaya-logo.png`,
    description: "Vijaya Construction builds luxury flats and premium residential projects in Guwahati and Tezpur, backed by 22 completed projects, 700+ delivered homes and commercial spaces, and membership in AREIDA.",
    slogan: "Luxury flats in Guwahati, built with trust.",
    telephone: site.phone,
    email: site.email,
    areaServed: [
      { "@type": "City", name: "Guwahati" },
      { "@type": "City", name: "Tezpur" },
      { "@type": "State", name: "Assam" },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Floor 1, Vijaya Kamal Kutir, MC Road, Chenikuthi",
      addressLocality: "Guwahati",
      addressRegion: "Assam",
      postalCode: "781003",
      addressCountry: "IN",
    },
    memberOf: {
      "@type": "Organization",
      name: site.membershipName,
      alternateName: site.membershipFullName,
    },
    sameAs: [site.instagram, site.facebook],
  };
}

function webSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Vijaya Construction luxury flats in Guwahati",
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-IN",
    about: [
      "luxury flats in Guwahati",
      "premium apartments in Guwahati",
      "AREIDA member real estate developer in Assam",
      "RERA-listed residential projects in Guwahati",
    ],
  };
}

function breadcrumbSchema(pathItems) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: pathItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}/${item.url}`,
    })),
  };
}

function pageShell({ prefix = "", pathName = "", title, description, image = "home-hero", children, schema = [] }) {
  const canonical = pathName ? `${SITE_URL}/${pathName}` : `${SITE_URL}/`;
  const ogImage = `${SITE_URL}/assets/images/${image}.webp`;
  const robots = IS_ALL_EDITS_PREVIEW ? "noindex, nofollow" : "index, follow";
  const bodyClass = IS_ALL_EDITS_PREVIEW ? ' class="variant-all-edits-preview"' : "";
  return `<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="${escapeHtml(SECURITY_CSP)}">
  <meta name="theme-color" content="#151827">
  <script>document.documentElement.className+=" js";</script>
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${ogImage}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;650;750;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
  <link rel="icon" href="${prefix}assets/images/vijaya-logo.png" type="image/png">
  <link rel="stylesheet" href="${prefix}assets/css/site.css?v=${ASSET_VERSION}">
  <script type="application/ld+json">${schemaGraph([organizationSchema(), webSiteSchema(), ...schema])}</script>
</head>
<body${bodyClass}>
${header(prefix)}
<main class="page-main">
${children}
</main>
${officeLocation(prefix)}
${workWithVijaya(prefix)}
${footer(prefix)}
${mobileCta()}
${agentChat()}
<script src="${prefix}assets/js/site.js?v=${ASSET_VERSION}" defer></script>
</body>
</html>`;
}

function detailList(project) {
  const completionLabel = project.status === "Completed" ? "Completed" : "Completion";
  const completionValue = project.status === "Completed" ? project.completed : project.completion;
  const rows = [
    ["Location", project.location],
    ...(project.salesStatus ? [["Sales status", project.salesStatus]] : []),
    ["Project type", project.type],
    ["Homes", project.units],
    [completionLabel, completionValue],
  ];
  if (project.rera) rows.push(["ASSAM RERA #", project.rera]);
  return `<ul class="detail-list">${rows.map(([label, value]) => `<li><strong>${escapeHtml(label)}</strong>${escapeHtml(value)}</li>`).join("")}</ul>`;
}

function projectFeature(project, prefix = "") {
  return `<article class="feature-project reveal">
  <a class="feature-media" href="${projectUrl(prefix, project)}" aria-label="Open ${escapeHtml(project.name)}"><img src="${imagePath(prefix, project.image)}" alt="${escapeHtml(project.name)} in ${escapeHtml(project.location)}" loading="lazy"></a>
  <div class="feature-body">
    <span class="project-status${project.salesStatus ? " status-sold-out" : ""}">${escapeHtml(project.statusLabel)}</span>
    <h3>${escapeHtml(project.name)}</h3>
    <p class="project-location">${icons.pin} ${escapeHtml(project.location)}</p>
    <p>${escapeHtml(project.short)}</p>
    ${detailList(project)}
    <div class="project-actions">
      <a class="btn btn-primary" href="${projectUrl(prefix, project)}">${icons.arrow} View Project</a>
      ${project.brochurePage ? `<a class="btn btn-outline" href="${brochureUrl(prefix, project)}">View Brochure</a>` : ""}
    </div>
  </div>
</article>`;
}

function projectCard(project, prefix = "") {
  const salesStatusTag = project.salesStatus
    ? `      <span class="tag tag-strong">${escapeHtml(project.salesStatus)}</span>\n`
    : "";
  return `<a class="project-card reveal" href="${projectUrl(prefix, project)}">
  <div class="project-card-media"><img src="${imagePath(prefix, project.image)}" alt="${escapeHtml(project.name)} at ${escapeHtml(project.location)}" loading="lazy"></div>
  <div class="project-card-body">
    <h3>${escapeHtml(project.name)}</h3>
    <p>${escapeHtml(project.location)}</p>
    <div class="tag-row">
      <span class="tag">${escapeHtml(project.units)}</span>
${salesStatusTag}      <span class="tag">${escapeHtml(project.status === "Completed" ? project.completed : project.completion)}</span>
    </div>
  </div>
</a>`;
}

function proofStats() {
  const fourthStat = previewCopy("Active Project Enquiries", "Ongoing Projects Selling Out Fast");
  return `<section class="section section-tight">
  <div class="section-inner proof-grid">
    <div class="proof-item"><strong class="count-up" data-count-to="22">22</strong><span>Completed projects across Guwahati and Tezpur</span></div>
    <div class="proof-item"><strong class="count-up" data-count-to="700" data-count-suffix="+">700+</strong><span>Homes and commercial spaces delivered</span></div>
    <div class="proof-item"><strong class="count-up" data-count-to="2002">2002</strong><span>Shaping Assam's skyline and building excellence for over 2 decades</span></div>
    <div class="proof-item"><strong class="count-up" data-count-to="3">3</strong><span>${fourthStat}</span></div>
  </div>
</section>`;
}

function homePage() {
  const mini = displayOngoingProjects
    .map((project) => `<a class="mini-project" href="${projectUrl("", project)}"><img src="${imagePath("", project.image)}" alt="${escapeHtml(project.name)} thumbnail"><span><strong>${escapeHtml(project.name)}</strong><span>${escapeHtml(project.location)}</span></span></a>`)
    .join("");
  const heroTitle = previewCopy(
    "Luxury flats in Guwahati, built with trust.",
    "Vijaya Ashiyana, backed by a proven Vijaya record."
  );
  const ongoingCopy = previewCopy(
    "Explore detailed architectural visuals that bring your future home to life, then review brochures, RERA references where available, and direct sales paths before taking the next step.",
    "Explore detailed architectural visuals that bring your future home to life. Backed by RERA compliance, comprehensive brochures, and easy ways to connect with our team, taking the next step is effortless for families seeking premium apartments in Guwahati."
  );
  const trustHeading = previewCopy("More Than Just a Vision. A Proven Promise.", "More Than Just a Vision&mdash;A Proven Promise");
  const trustCopy = previewCopy(
    `For real estate buyers in Guwahati and Tezpur, trust is built through delivered addresses, clear project facts, transparent sales conversations, RERA references where available, and ${site.membershipName} membership.`,
    "When you choose your future home, you deserve total confidence. We believe that transparency is the foundation of every successful home purchase. We lead with striking architectural visuals, and back them up with a proven track record of delivered homes across Guwahati and Tezpur, clear project information, RERA Registration, AREIDA membership, and a dedicated team ready to assist you."
  );
  const trustItems = IS_ALL_EDITS_PREVIEW
    ? [
        ["A Trusted Legacy", "With a strong portfolio of successfully completed and sold-out developments, you can easily explore our established communities and verify our commitment to quality before you even step foot on a new site."],
        ["Complete Transparency", "We respect your time. Essential details, including exact locations, unit availability, completion timelines, RERA registrations, and comprehensive brochures, are completely open for you to browse at your own pace."],
        ["Support on Your Terms", "Whenever you are ready to take the next step, our team is just a click away. Whether you prefer a quick WhatsApp message, a phone call, or an online enquiry, we are here to help you seamlessly compare your options."],
        ["The AREIDA Assurance", "As a proud and active member of the Assam Real Estate and Infrastructure Developers' Association, Vijaya Construction upholds the highest standards of integrity, adding a vital layer of security to your premium property investment."],
      ]
    : [
        ["A Trusted Legacy", "22 completed projects across Guwahati and Tezpur make the Vijaya record visible before a site visit."],
        ["Complete Transparency", "Location, unit count, completion timeline, RERA references where available, and brochures are easy to review."],
        ["Support on Your Terms", "Call, WhatsApp, and enquiry paths stay close for buyers ready to compare options with a real person."],
        ["The AREIDA Assurance", `Vijaya Construction is part of ${site.membershipFullName}, adding another trust marker for buyers comparing luxury flats in Guwahati.`],
      ];
  const trustList = trustItems
    .map(([heading, text], index) => `<div class="trust-item${index === 3 ? " trust-member" : ""}"><span class="trust-icon">${index === 1 ? icons.plan : index === 2 ? icons.key : icons.shield}</span><div><h3>${heading}</h3><p>${escapeHtml(text)}</p></div></div>`)
    .join("\n        ");
  const completedCopy = previewCopy(
    "True luxury is built on certainty. Vijaya's completed portfolio gives buyers a visible record before they enquire for a current project.",
    "True luxury is built on certainty. At Vijaya Construction, our track record is our strongest credential. Explore our portfolio of completed addresses and see exactly how we turn architectural promises into thriving communities."
  );
  const ctaCopy = previewCopy(
    "Request floor plans, price guidance, availability, and a guided site visit for Vijaya Ashiyana or Vijaya Sapphire.",
    "Reach out directly to our team to find the perfect match for your lifestyle. Connect with us to request floor plans, pricing guidance, current availability, and to schedule a guided safe site visit for Vijaya Ashiyana or Vijaya Sapphire."
  );
  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: [
      ["Which luxury flats in Guwahati does Vijaya Construction offer?", "Vijaya Ashiyana on Rajgarh Link Road is Vijaya Construction's active Guwahati enquiry path for buyers comparing luxury flats and premium apartments. Vijaya Sterling Heights in Kerakuchi is sold out."],
      ["Is Vijaya Construction part of AREIDA?", "Yes. Vijaya Construction is a member of AREIDA, the Assam Real Estate and Infrastructure Developers Association connected with CREDAI Assam."],
      ["Does Vijaya Construction have completed projects in Guwahati?", "Yes. The portfolio includes completed residential projects in Ulubari, Beltola, Kharghuli, New Guwahati, Panjabari, Hatigaon, Kerakuchi, and more."],
      ["How can I get floor plans and pricing for Vijaya flats?", "Use the enquiry form, call the sales team, or WhatsApp Vijaya Construction to request current availability, floor plans, pricing, and guided site visit slots."],
    ].map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
  };

  return pageShell({
    title: "Luxury Flats in Guwahati | Vijaya Construction",
    description: "Explore luxury flats in Guwahati from Vijaya Construction, an AREIDA member developer with 22 completed projects, 700+ delivered homes and commercial spaces, RERA-listed projects, and direct sales support.",
    image: "home-hero",
    schema: [faqSchema],
    children: `<section class="hero">
  <div class="hero-media"><img src="${imagePath("", "home-hero")}" alt="Vijaya Ashiyana premium apartment tower rendering in Guwahati"></div>
  <div class="hero-content">
    <div>
      <h1>${heroTitle}</h1>
      <p class="hero-copy">Vijaya Construction brings 22 completed projects, 700+ successfully delivered homes and commercial spaces, the credibility of an accredited AREIDA membership, and a clear local record to homebuyers searching for premium apartments in Guwahati and Tezpur.</p>
      <div class="hero-actions">
        <a class="btn btn-gold" href="#contact">${icons.arrow} Guided Site Visit</a>
        <a class="btn btn-light" href="${whatsappLink("Hi Vijaya Construction, I want details for your ongoing projects in Guwahati.")}" target="_blank" rel="noopener noreferrer">${icons.chat} WhatsApp</a>
        <a class="btn btn-outline desktop-hero-call" href="${site.phoneHref}">${icons.phone} Call now</a>
      </div>
    </div>
    <aside class="hero-panel" aria-label="Ongoing Vijaya projects">
      <h2>Ongoing projects</h2>
      <p>Select a project to explore images, brochures, and connect with our team.</p>
      <div class="mini-project-list">${mini}</div>
    </aside>
  </div>
</section>
${proofStats()}
<section class="section section-warm" id="ongoing">
  <div class="section-inner">
    <div class="section-head reveal">
      <h2 class="section-heading">Ongoing projects designed for serious homebuyers.</h2>
      <p class="section-copy">${ongoingCopy}</p>
    </div>
    <div class="project-feature-list">${displayOngoingProjects.map((project) => projectFeature(project)).join("")}</div>
  </div>
</section>
<section class="section trust-proof" id="why-vijaya">
  <div class="section-inner split-band">
    <div class="reveal">
      <h2 class="section-heading">${trustHeading}</h2>
      <p class="section-copy">${trustCopy}</p>
      <div class="trust-list">
        ${trustList}
      </div>
    </div>
    <div class="media-mosaic reveal" aria-label="Vijaya proof imagery">
      <img src="${imagePath("", "ashiyana-lobby")}" alt="Premium lobby rendering for Vijaya Ashiyana" loading="lazy">
      <div class="stack">
        <img src="${imagePath("", "ashiyana-garden")}" alt="Vijaya Ashiyana landscaped garden rendering" loading="lazy">
        <img src="${imagePath("", "golden-orchid-day")}" alt="Vijaya Golden Orchid architectural rendering" loading="lazy">
      </div>
    </div>
  </div>
</section>
<section class="section section-dark completed-proof">
  <div class="section-inner">
    <div class="section-head reveal">
      <h2 class="section-heading">The Proof is in our Completed Projects.</h2>
      <p class="section-copy">${completedCopy}</p>
    </div>
    <div class="cards-grid">${completedProjects.slice(-6).reverse().map((project) => projectCard(project)).join("")}</div>
    <div class="hero-actions reveal"><a class="btn btn-light" href="completed.html">${icons.arrow} View all completed projects</a></div>
  </div>
</section>
<section class="cta-band" id="contact">
  <div class="cta-card">
    <div>
      <h2>Take the Next Step Toward Your Luxury Home.</h2>
      <p>${ctaCopy}</p>
    </div>
    ${leadForm("New website enquiry - Vijaya Construction")}
  </div>
</section>`,
  });
}

function completedPage() {
  const completedHeroCopy = previewCopy(
    "True luxury is built on certainty. Delivered Vijaya addresses in Guwahati and Tezpur give buyers a visible record before they enquire for a current project.",
    "True luxury is built on certainty. At Vijaya Construction, our track record is our strongest credential. Explore our portfolio of completed addresses and see exactly how we turn architectural promises into thriving communities."
  );
  return pageShell({
    title: "Completed Vijaya Construction Projects in Guwahati and Tezpur",
    description: "Browse 22 completed Vijaya Construction projects across Guwahati and Tezpur, including delivered residential addresses in Beltola, Kharghuli, Ulubari, Hatigaon, Kerakuchi, and more.",
    pathName: "completed.html",
    image: "imperial-towers-photo",
    schema: [breadcrumbSchema([{ name: "Home", url: "" }, { name: "Completed Projects", url: "completed.html" }])],
    children: `<section class="page-hero">
  <div class="page-hero-inner">
    <div>
      <h1>The Proof is in our Completed Projects.</h1>
      <p>${completedHeroCopy}</p>
    </div>
    <div class="project-meta-panel">${detailList({ location: "Guwahati and Tezpur", type: "Completed residential portfolio", units: "700+ homes and commercial spaces", status: "Completed", completed: "2006-2024" })}</div>
  </div>
</section>
<section class="section">
  <div class="section-inner">
    <div class="cards-grid">${completedProjects.slice().reverse().map((project) => projectCard(project)).join("")}</div>
  </div>
</section>
<section class="cta-band" id="contact">
  <div class="cta-card">
    <div>
      <h2>Take the Next Step Toward Your Luxury Home.</h2>
      <p>Use the delivered portfolio as proof, then speak with sales about active Vijaya Ashiyana and Vijaya Sapphire enquiries.</p>
    </div>
    ${leadForm("Completed portfolio enquiry - Vijaya Construction")}
  </div>
</section>`,
  });
}

function projectSchema(project) {
  return {
    "@type": "ApartmentComplex",
    name: project.name,
    url: `${SITE_URL}/buildings/${project.slug}.html`,
    image: `${SITE_URL}/assets/images/${project.heroImage || project.image}.webp`,
    description: project.short,
    address: { "@type": "PostalAddress", streetAddress: project.location, addressLocality: project.city, addressRegion: "Assam", addressCountry: "IN" },
    numberOfAccommodationUnits: project.units,
  };
}

function projectPage(project) {
  const prefix = "../";
  const isOngoing = project.status === "Ongoing";
  const isSoldOut = project.enquiryEnabled === false;
  const canEnquire = isOngoing && !isSoldOut;
  const title = isOngoing
    ? `${project.name} | ${isSoldOut ? "Sold Out Project" : `Luxury Flats in ${project.city}`} | Vijaya Construction`
    : `${project.name} | Completed Project in ${project.city} | Vijaya Construction`;
  const description = isSoldOut
    ? `${project.name} is a sold-out Vijaya Construction project in ${project.city}. View images, facts, RERA details, brochure, and active Vijaya enquiry options.`
    : isOngoing
    ? `${project.name} is an ongoing Vijaya Construction project for buyers comparing luxury flats in ${project.city}. View images, facts, RERA details, brochure, BHK enquiry options, and sales contact.`
    : `${project.name} is a completed Vijaya Construction project at ${project.location}, delivered in ${project.completed}. View project facts and contact sales for current luxury flats in Guwahati and Tezpur.`;
  const gallery = (project.gallery || [[project.image, project.name]])
    .map(([img, caption], index) => `<figure class="gallery-item ${index === 0 ? "large" : ""} reveal"><img src="${imagePath(prefix, img)}" alt="${escapeHtml(caption)}" loading="${index === 0 ? "eager" : "lazy"}"><figcaption class="gallery-caption">${escapeHtml(caption)}</figcaption></figure>`)
    .join("");
  const amenities = (project.amenities || [
    ["Delivered address", "Part of the Vijaya completed-project record."],
    ["Local proof", "Use this completed project to verify construction experience in the area."],
    ["Sales continuity", "The same brand record supports ongoing buyer conversations today."],
    ["Archive imagery", "Older projects may use a mix of real photos and architectural archive images."],
  ])
    .map(([heading, text]) => `<article class="amenity"><h3>${escapeHtml(heading)}</h3><p>${escapeHtml(text)}</p></article>`)
    .join("");
  const leadSubject = `${project.name} enquiry - Vijaya Construction website`;
  const schema = [
    breadcrumbSchema([{ name: "Home", url: "" }, { name: project.status === "Completed" ? "Completed Projects" : "Ongoing Projects", url: project.status === "Completed" ? "completed.html" : "index.html#ongoing" }, { name: project.name, url: `buildings/${project.slug}.html` }]),
    projectSchema(project),
  ];
  const isAshiyanaPreview = IS_ALL_EDITS_PREVIEW && project.slug === "vijaya-ashiyana";
  const projectHeroActions = (
    isAshiyanaPreview
      ? [
          `<a class="btn btn-gold" href="#contact">${icons.arrow} Request Callback</a>`,
          `<a class="btn btn-light" href="${brochureUrl(prefix, project)}">View Brochure</a>`,
          `<a class="btn btn-outline" href="${whatsappLink(`Hi Vijaya Construction, I want details for ${project.name}.`)}" target="_blank" rel="noopener noreferrer">${icons.chat} WhatsApp</a>`,
        ]
      : [
          `<a class="btn btn-gold" href="${whatsappLink(canEnquire ? `Hi Vijaya Construction, I want details for ${project.name}.` : `Hi Vijaya Construction, I viewed ${project.name} and want details for active projects.`)}" target="_blank" rel="noopener noreferrer">${icons.chat} WhatsApp</a>`,
          `<a class="btn btn-light" href="#contact">${icons.arrow} ${canEnquire ? "Request Callback" : "Ask About Active Projects"}</a>`,
          isOngoing ? `<a class="btn btn-outline" href="${brochureUrl(prefix, project)}">View Brochure</a>` : `<a class="btn btn-outline" href="${prefix}completed.html">Completed Portfolio</a>`,
        ]
  ).join("\n        ");
  const storyHeading = isOngoing ? (project.slug === "vijaya-ashiyana" ? "Discover the Lifestyle." : "What buyers should know.") : "A delivered proof point.";
  const storyText = isAshiyanaPreview ? project.lifestyleCopy : project.short;
  const galleryCopy = isAshiyanaPreview
    ? ""
    : `<p class="section-copy">${isOngoing ? "Browse visuals and layouts, then come back to the highlights before connecting with sales." : "Completed projects may include real exterior photos and archive architectural images where older project photography is limited."}</p>`;
  const highlightsCopy = isAshiyanaPreview
    ? "Browse the highlights before connecting with our Sales Team so the call can focus on availability, budget, and right fit."
    : isOngoing
    ? "Browse highlights before connecting so the conversation can focus on availability, budget, and fit."
    : "Trust comes from what has already been completed. These records support current buyers comparing builders in Guwahati and Tezpur.";
  const contactCopy = isAshiyanaPreview
    ? `Reach out directly to our team to find the perfect match for your lifestyle. Connect with us to request floor plans, pricing guidance, current availability, and to schedule a guided safe site visit for ${project.name}.`
    : canEnquire
    ? `Get the latest pricing, BHK availability, floor plans, and guided site visit options for ${project.name}.`
    : isSoldOut
    ? "Sales can guide you to active Vijaya Ashiyana and Vijaya Sapphire enquiries."
    : "This page shows a completed project record. Sales can guide you to active Vijaya projects now available in Guwahati and Tezpur.";

  return pageShell({
    prefix,
    pathName: `buildings/${project.slug}.html`,
    title,
    description,
    image: project.heroImage || project.image,
    schema,
    children: `<section class="hero project-hero">
  <div class="hero-media"><img src="${imagePath(prefix, project.heroImage || project.image)}" alt="${escapeHtml(project.name)} at ${escapeHtml(project.location)}"></div>
  <div class="hero-content">
    <div>
      <h1 class="project-title">${escapeHtml(project.name)}</h1>
      <p class="hero-copy">${escapeHtml(project.intro)}</p>
      <div class="hero-actions">
        ${projectHeroActions}
      </div>
    </div>
    <aside class="project-meta-panel">${detailList(project)}</aside>
  </div>
</section>
<section class="section section-tight section-warm">
  <div class="section-inner project-story">
    <div class="reveal">
      <h2 class="section-heading">${storyHeading}</h2>
      <p>${escapeHtml(storyText)}</p>
      <div class="tag-row">${project.highlights.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}</div>
    </div>
    <div class="proof-photo reveal"><img src="${imagePath(prefix, project.image)}" alt="${escapeHtml(project.name)} project image" loading="lazy"></div>
  </div>
</section>
<section class="section">
  <div class="section-inner">
    <div class="section-head reveal">
      <h2 class="section-heading">${isOngoing ? "Explore the Vision: Gallery & Layouts." : "Project record and archive images."}</h2>
      ${galleryCopy}
    </div>
    <div class="gallery-grid">${gallery}</div>
  </div>
</section>
<section class="section section-warm">
  <div class="section-inner">
    <div class="section-head reveal">
      <h2 class="section-heading">${isOngoing ? "Designed to guide your site visit." : "Why this project matters to today's buyer."}</h2>
      <p class="section-copy">${highlightsCopy}</p>
    </div>
    <div class="amenity-grid reveal">${amenities}</div>
  </div>
</section>
<span class="anchor-target" id="enquire" aria-hidden="true"></span>
<section class="cta-band" id="contact">
  <div class="cta-card">
    <div>
      <h2>${canEnquire ? `Ask for ${project.name} availability.` : isSoldOut ? `${project.name} is sold out. Ask about active Vijaya homes.` : "Ask about current Vijaya availability."}</h2>
      <p>${contactCopy}</p>
    </div>
    ${leadForm(leadSubject, canEnquire ? project.name : "")}
  </div>
</section>`,
  });
}

function brochurePage(project) {
  const prefix = "../";
  const canEnquire = project.enquiryEnabled !== false;
  return pageShell({
    prefix,
    pathName: `brochures/${project.brochurePage}`,
    title: `${project.name} Brochure | Vijaya Construction`,
    description: `View the official ${project.name} brochure, project facts, and enquiry options from Vijaya Construction.`,
    image: project.image,
    schema: [breadcrumbSchema([{ name: "Home", url: "" }, { name: project.name, url: `buildings/${project.slug}.html` }, { name: "Brochure", url: `brochures/${project.brochurePage}` }])],
    children: `<section class="page-hero">
  <div class="page-hero-inner">
    <div>
      <h1>${escapeHtml(project.name)} brochure.</h1>
      <p>Review the brochure, then speak with the Vijaya sales team for ${canEnquire ? "current pricing, availability, and guided site visit coordination" : "active Vijaya project options"}.</p>
    </div>
    <div class="project-meta-panel">${detailList(project)}</div>
  </div>
</section>
<section class="brochure-shell">
  <div class="pdf-frame brochure-preview">
    <img src="${brochurePreviewPath(prefix, project.brochurePdf)}" alt="${escapeHtml(project.name)} brochure cover preview" loading="eager">
    <div class="brochure-preview-meta">
      <span>Official PDF brochure</span>
      <a href="${brochurePath(prefix, project.brochurePdf)}" target="_blank" rel="noopener noreferrer">Open PDF</a>
    </div>
  </div>
  <aside class="brochure-aside">
    <h2>Ready to compare?</h2>
    <p class="section-copy">Brochures are helpful, but availability changes. Ask sales for the latest active units, payment milestones, and floor plans.</p>
    <div class="project-actions brochure-actions">
      <a class="btn btn-primary" href="${brochurePath(prefix, project.brochurePdf)}" download>${icons.arrow} Download PDF</a>
      <a class="btn btn-gold" href="${whatsappLink(`Hi Vijaya Construction, I want the latest details for ${project.name}.`)}" target="_blank" rel="noopener noreferrer">${icons.chat} WhatsApp</a>
      <a class="btn btn-subtle" href="${prefix}buildings/${project.slug}.html">Back to project</a>
    </div>
    <div class="brochure-form">${leadForm(`${project.name} brochure enquiry`, canEnquire ? project.name : "")}</div>
  </aside>
</section>`,
  });
}

function write(file, content) {
  writeFileSync(path.join(OUTPUT_DIR, file), content);
}

function ensureDirs() {
  if (!IS_ROOT_OUTPUT) {
    rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }

  mkdirSync(path.join(OUTPUT_DIR, "buildings"), { recursive: true });
  mkdirSync(path.join(OUTPUT_DIR, "brochures"), { recursive: true });
  mkdirSync(path.join(OUTPUT_DIR, ".well-known"), { recursive: true });

  if (!IS_ROOT_OUTPUT) {
    cpSync(path.join(ROOT, "assets"), path.join(OUTPUT_DIR, "assets"), { recursive: true });
  }
}

function robotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

function securityHeaders() {
  return [
    ["Content-Security-Policy", `${SECURITY_CSP}; frame-ancestors 'self'`],
    ["X-Content-Type-Options", "nosniff"],
    ["X-Frame-Options", "SAMEORIGIN"],
    ["Referrer-Policy", "strict-origin-when-cross-origin"],
    ["Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=()"],
    ["Cross-Origin-Opener-Policy", "same-origin-allow-popups"],
    ["Strict-Transport-Security", "max-age=31536000"],
    ["X-Permitted-Cross-Domain-Policies", "none"],
    ["X-DNS-Prefetch-Control", "on"],
  ];
}

function vercelJson() {
  return `${JSON.stringify(
    {
      buildCommand: "npm run build",
      outputDirectory: "dist",
      headers: [
        {
          source: "/(.*)",
          headers: securityHeaders().map(([key, value]) => ({ key, value })),
        },
        {
          source: "/assets/(.*)",
          headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
        },
      ],
    },
    null,
    2
  )}\n`;
}

function headersFile() {
  return `/*
${securityHeaders().map(([key, value]) => `  ${key}: ${value}`).join("\n")}

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;
}

function securityTxt() {
  return `Contact: mailto:${site.email}
Preferred-Languages: en
Canonical: ${SITE_URL}/.well-known/security.txt
Policy: ${SITE_URL}/SECURITY.md
`;
}

function sitemapXml() {
  const urls = [
    "",
    "completed.html",
    ...allProjects.map((project) => `buildings/${project.slug}.html`),
    ...ongoingProjects.map((project) => `brochures/${project.brochurePage}`),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${SITE_URL}/${url}</loc><lastmod>${TODAY}</lastmod><changefreq>${url === "" ? "weekly" : "monthly"}</changefreq><priority>${url === "" ? "1.0" : "0.8"}</priority></url>`).join("\n")}
</urlset>
`;
}

ensureDirs();
write("index.html", homePage());
write("completed.html", completedPage());
allProjects.forEach((project) => write(`buildings/${project.slug}.html`, projectPage(project)));
ongoingProjects.forEach((project) => write(`brochures/${project.brochurePage}`, brochurePage(project)));
write("robots.txt", robotsTxt());
write("sitemap.xml", sitemapXml());
write(".well-known/security.txt", securityTxt());

if (IS_ROOT_OUTPUT) {
  write("vercel.json", vercelJson());
  write("_headers", headersFile());
}

console.log(`Built ${2 + allProjects.length + ongoingProjects.length} HTML pages plus robots.txt and sitemap.xml in ${path.relative(ROOT, OUTPUT_DIR) || "."}.`);
