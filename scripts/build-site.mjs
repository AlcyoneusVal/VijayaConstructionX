import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");
const OUTPUT_DIR = path.resolve(process.env.VIJAYA_OUTPUT_DIR || ".");
const IS_ROOT_OUTPUT = OUTPUT_DIR === ROOT;
const SITE_URL = "https://vijaya.construction";
const SITE_VARIANT = process.env.VIJAYA_SITE_VARIANT || "approved";
const IS_ALL_EDITS_PREVIEW = SITE_VARIANT === "all-edits-preview";
const ASSET_VERSION = IS_ALL_EDITS_PREVIEW ? "20260929-ashiyana-refresh-1" : "20260929-approved-1";
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
  email: "info@vijaya.construction",
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
    statusLabel: "Now Selling",
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
    statusLabel: "Sold Out",
    salesStatus: "Sold Out",
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
    statusLabel: "Now Selling",
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
].map(([slug, name, location, city, units, completed, image]) => ({
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
  heroImage: image,
  hasSitePhoto: image.endsWith("-photo"),
  short: `${name} is a completed Vijaya Construction project in ${location}, delivered in ${completed}.`,
  intro: `${name} forms part of Vijaya Construction's delivered portfolio across Assam, showing the on-ground record behind the company's current homes in Guwahati and Tezpur.`,
  highlights: [location, units, `Completed in ${completed}`, "Delivered Vijaya project"],
  gallery: image.endsWith("-photo") ? [[image, `${name} completed building photograph`]] : [],
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

function assetPath(prefix, name) {
  return `${prefix}assets/images/${name}`;
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
      <a href="${prefix}ashiyana-interest.html">Ashiyana details</a>
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
      <a href="${prefix}ashiyana-interest.html">Request Ashiyana details</a>
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
          text: `Send your resume as a PDF to ${site.careersEmail}. Our team will review it for current and future openings.`,
        },
        {
          icon: icons.key,
          heading: "Landowners",
          href: `mailto:${site.email}?subject=Landowner%20partnership%20enquiry`,
          text: `Discuss a development partnership with our team. Email your land details and location to ${site.email}.`,
        },
        {
          icon: icons.plan,
          heading: "Vendors",
          href: `mailto:${site.email}?subject=Vendor%20enquiry%20for%20Vijaya%20Construction`,
          text: `Share your catalogue, company profile, and proposal with ${site.email}.`,
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
    "I would like to know more about the floor plans, pricing, availability and a guided site visit."
  );
  const submitLabel = "Request callback";
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
  <p class="form-status" data-form-status role="status" aria-live="polite"></p>
</form>`;
}

function interestForm() {
  return `<form class="lead-form interest-form" method="POST">
  <input type="hidden" name="access_key" value="ab5435a1-83fa-4dbb-8e8a-6ef8486157ca">
  <input type="hidden" name="subject" value="Vijaya Ashiyana project details request">
  <input type="hidden" name="from_name" value="Vijaya Construction Website">
  <input type="hidden" name="project" value="Vijaya Ashiyana">
  <input type="hidden" name="source" value="website" data-enquiry-source>
  <input class="hp-field" type="text" name="botcheck" tabindex="-1" autocomplete="off">
  <div class="form-grid two">
    <label>Full name <input name="name" type="text" autocomplete="name" maxlength="90" required></label>
    <label>Mobile number <input name="contact" type="tel" autocomplete="tel" inputmode="tel" maxlength="20" required></label>
  </div>
  <div class="form-grid two">
    <label>Email address <input name="email" type="email" autocomplete="email" maxlength="120"></label>
    <label>Home preference <select name="bhk_interest" required><option value="">Choose a home</option><option>3 BHK at Ashiyana</option><option>Other Vijaya options</option><option>Still exploring</option></select></label>
  </div>
  <div class="form-grid two">
    <label>Budget range <select name="budget_range"><option value="">Prefer to discuss</option><option>Under Rs 75 lakh</option><option>Rs 75 lakh to Rs 1 crore</option><option>Rs 1 crore to Rs 1.5 crore</option><option>Above Rs 1.5 crore</option></select></label>
    <label>Best time to call <select name="callback_time" required><option value="">Choose a time</option><option>Weekday morning (10 am - 12 pm IST)</option><option>Weekday afternoon (12 - 4 pm IST)</option><option>Weekday evening (4 - 6 pm IST)</option><option>Saturday (10 am - 6 pm IST)</option></select></label>
  </div>
  <label>What would you like to know? <textarea name="message" maxlength="1200" placeholder="Floor plans, current pricing, a guided visit, or any accessibility needs."></textarea></label>
  <label class="consent-row"><input type="checkbox" name="contact_consent" value="Yes" required><span>I agree to be contacted by Vijaya Construction about this enquiry.</span></label>
  <button class="btn btn-primary submit-btn" type="submit">${icons.arrow} Request project details</button>
  <p class="form-note">No payment or booking commitment is needed to request details. Our team will confirm current availability and pricing directly.</p>
  <p class="form-status" data-form-status role="status" aria-live="polite"></p>
</form>`;
}

function schemaGraph(items) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": items }, null, 2).replaceAll("</", "<\\/");
}

function organizationSchema() {
  return {
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: site.name,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/images/vijaya-logo.png`,
    description: "Vijaya Construction builds luxury flats and premium residential projects in Guwahati and Tezpur, backed by 22 completed projects, 700+ delivered homes and commercial spaces, and membership in AREIDA.",
    slogan: "Luxury flats in Guwahati, built with trust.",
    telephone: site.phone,
    email: site.email,
    image: `${SITE_URL}/assets/images/ashiyana-aerial.webp`,
    hasMap: site.mapsUrl,
    openingHoursSpecification: [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "18:00",
    }],
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
  const ogImage = `${SITE_URL}/assets/images/${image.includes(".") ? image : `${image}.webp`}`;
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
  const featureImage = project.slug === "vijaya-ashiyana" ? assetPath(prefix, "ashiyana-rooftop-pool-aerial.jpg") : imagePath(prefix, project.image);
  const featureAlt = project.slug === "vijaya-ashiyana" ? "Artist's impression of the planned Vijaya Ashiyana rooftop pool and leisure deck" : `${project.name} in ${project.location}`;
  return `<article class="feature-project reveal">
  <a class="feature-media" href="${projectUrl(prefix, project)}" aria-label="Open ${escapeHtml(project.name)}"><img src="${featureImage}" alt="${escapeHtml(featureAlt)}" loading="lazy">${project.slug === "vijaya-ashiyana" ? `<span class="media-credit">Planned amenity, artist's impression</span>` : ""}</a>
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
  <div class="project-card-media">${project.status === "Completed" && !project.hasSitePhoto
    ? `<span class="archive-media"><small>Completed address</small><strong>${escapeHtml(project.name)}</strong><span>${escapeHtml(project.location)}</span></span>`
    : `<img src="${imagePath(prefix, project.image)}" alt="${escapeHtml(project.name)} completed building at ${escapeHtml(project.location)}" loading="lazy">`}</div>
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
  const fourthStat = "Ongoing projects; two currently accepting enquiries";
  return `<section class="section section-tight">
  <div class="section-inner proof-grid">
    <div class="proof-item"><strong class="count-up" data-count-to="22">22</strong><span>Completed projects across Guwahati and Tezpur</span></div>
    <div class="proof-item"><strong class="count-up" data-count-to="700" data-count-suffix="+">700+</strong><span>Homes and commercial spaces delivered</span></div>
    <div class="proof-item"><strong class="count-up" data-count-to="2002">2002</strong><span>Shaping Assam's skyline and building excellence for over 2 decades</span></div>
    <div class="proof-item"><strong class="count-up" data-count-to="3">3</strong><span>${fourthStat}</span></div>
  </div>
</section>`;
}

function posterFeature() {
  const posters = [
    ["ashiyana-poster-01.jpg", "Vijaya Ashiyana architecture campaign artwork"],
    ["ashiyana-poster-03.jpg", "Vijaya Ashiyana editorial campaign artwork"],
    ["ashiyana-poster-05.jpg", "Vijaya Ashiyana rooftop campaign artwork"],
  ];
  return `<section class="section poster-feature" id="ashiyana-campaign">
  <div class="section-inner">
    <div class="section-head reveal"><h2 class="section-heading">Ashiyana, from another perspective.</h2><p class="section-copy">A selection from our recent Ashiyana campaign. Explore the visuals, then request the official brochure, current price guidance and a time to speak with our team.</p></div>
    <div class="poster-rail">${posters.map(([file, alt]) => `<a href="ashiyana-interest.html?source=campaign" aria-label="Request Vijaya Ashiyana details"><img src="${assetPath("", file)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async"></a>`).join("")}</div>
    <div class="poster-actions"><a class="btn btn-primary" href="ashiyana-interest.html?source=campaign">${icons.arrow} Request Ashiyana details</a><a class="text-link" href="https://vijaya-ashiyana-poster-gallery-sfr907ws2-alcyoneusvals-projects.vercel.app" target="_blank" rel="noopener noreferrer">Explore the poster collection</a></div>
  </div>
</section>`;
}

function homePage() {
  const mini = displayOngoingProjects
    .map((project) => `<a class="mini-project" href="${projectUrl("", project)}"><img src="${imagePath("", project.image)}" alt="${escapeHtml(project.name)} thumbnail"><span><strong>${escapeHtml(project.name)}</strong><span>${escapeHtml(project.location)}</span></span></a>`)
    .join("");
  const heroTitle = previewCopy(
    "Luxury flats in Guwahati, built with trust.",
    "A new Vijaya address is rising in Guwahati."
  );
  const ongoingCopy = previewCopy(
    "Explore detailed architectural visuals that bring your future home to life, then review brochures, RERA references where available, and direct sales paths before taking the next step.",
    "Compare project imagery and layouts, then check each project's RERA reference and brochure. Our team can help with current availability, price guidance, and a guided visit."
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
      ["AREIDA membership", "Vijaya Construction is a member of the Assam Real Estate and Infrastructure Developers' Association. Explore our project records and RERA references alongside that membership."],
      ]
    : [
        ["A Trusted Legacy", "22 completed projects across Guwahati and Tezpur make the Vijaya record visible before a site visit."],
        ["Complete Transparency", "Location, unit count, completion timeline, RERA references where available, and brochures are easy to review."],
        ["Support on Your Terms", "Call, WhatsApp, and enquiry paths stay close for buyers ready to compare options with a real person."],
      ["AREIDA membership", `Vijaya Construction is part of ${site.membershipFullName}, a useful trust marker for buyers comparing homes in Guwahati.`],
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
    "Ask our team for floor plans, price guidance, current availability, and a guided site visit for Vijaya Ashiyana or Vijaya Sapphire."
  );
  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: [
      ["Which luxury flats in Guwahati does Vijaya Construction offer?", "Vijaya Ashiyana on Rajgarh Link Road is Vijaya Construction's active Guwahati enquiry path for buyers comparing luxury flats and premium apartments. Vijaya Sterling Heights in Kerakuchi is sold out."],
      ["Is Vijaya Construction part of AREIDA?", "Yes. Vijaya Construction is a member of AREIDA, the Assam Real Estate and Infrastructure Developers Association connected with CREDAI Assam."],
      ["Does Vijaya Construction have completed projects in Guwahati?", "Yes. The portfolio includes completed residential projects in Ulubari, Beltola, Kharghuli, New Guwahati, Panjabari, Hatigaon, Kerakuchi, and more."],
      ["How can I get floor plans and pricing for Vijaya flats?", "Use the enquiry form, call the sales team, or WhatsApp Vijaya Construction to request current availability, floor plans, pricing, and guided site visit slots."],
      ["Can I compare homes across different budgets?", "Yes. Tell the Vijaya sales team your preferred home size and budget. They can explain current options and pricing without requiring a booking payment to make an enquiry."],
    ].map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
  };

  return pageShell({
    title: "Flats in Guwahati | Vijaya Ashiyana & Vijaya Construction",
    description: "Explore Vijaya Ashiyana flats in Guwahati, planned rooftop amenities, project facts and floor plans. Compare current options with an AREIDA member developer and request pricing or a guided visit.",
    image: "ashiyana-aerial",
    schema: [faqSchema],
    children: `<section class="hero">
  <div class="hero-media"><img src="${imagePath("", "ashiyana-aerial")}" alt="Artist's impression of Vijaya Ashiyana tower and rooftop in Guwahati" fetchpriority="high" loading="eager"><span class="hero-image-caption">Artist's impression</span></div>
  <div class="hero-content">
    <div>
      <h1>${heroTitle}</h1>
      <p class="hero-copy">Meet Vijaya Ashiyana on Rajgarh Link Road: planned rooftop leisure, a central Guwahati address, and the record of 22 completed Vijaya projects. Completion is currently targeted for December 2029.</p>
      <div class="hero-actions">
        <a class="btn btn-gold" href="ashiyana-interest.html">${icons.arrow} Explore Ashiyana</a>
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
<section class="ashiyana-spotlight" aria-label="Vijaya Ashiyana rooftop vision">
  <img src="${assetPath("", "ashiyana-pool-deck-dusk.jpg")}" alt="Artist's impression of Vijaya Ashiyana's planned rooftop pool deck at dusk" loading="lazy" decoding="async">
  <div class="ashiyana-spotlight-copy"><h2>Room to rise. Space to unwind.</h2><p>A second view of Ashiyana's planned rooftop leisure deck. Artist's impression; final specifications are subject to the official brochure and sales confirmation.</p><a href="buildings/vijaya-ashiyana.html">Explore the project ${icons.arrow}</a></div>
</section>
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
    <div class="membership-proof reveal">
      <span>Member association</span>
      <img src="${assetPath("", "areida-logo.png")}" alt="AREIDA, CREDAI Assam logo" loading="lazy" width="199" height="94">
      <p>Membership sits alongside our delivered project record. Check each active project's own RERA reference and brochure when comparing homes.</p>
      <a href="https://www.areida.org.in/" target="_blank" rel="noopener noreferrer">Learn about AREIDA ${icons.arrow}</a>
    </div>
  </div>
</section>
<section class="section section-dark completed-proof">
  <div class="section-inner">
    <div class="section-head reveal">
      <h2 class="section-heading">The Proof is in our Completed Projects.</h2>
      <p class="section-copy">${completedCopy}</p>
    </div>
    <div class="cards-grid">${completedProjects.filter((project) => project.hasSitePhoto).slice(-6).reverse().map((project) => projectCard(project)).join("")}</div>
    <div class="hero-actions reveal"><a class="btn btn-light" href="completed.html">${icons.arrow} View Completed Projects</a></div>
  </div>
</section>
${posterFeature()}
<section class="section faq-section" aria-labelledby="buyer-questions">
  <div class="section-inner faq-layout"><div><h2 class="section-heading" id="buyer-questions">Questions buyers ask first.</h2><p>Clear answers before you arrange a visit.</p></div>
    <div class="faq-list">${faqSchema.mainEntity.map(({name, acceptedAnswer}) => `<details><summary>${escapeHtml(name)}</summary><p>${escapeHtml(acceptedAnswer.text)}</p></details>`).join("")}</div>
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

function interestPage() {
  const ashiyana = ongoingProjects.find((project) => project.slug === "vijaya-ashiyana");
  return pageShell({
    pathName: "ashiyana-interest.html",
    title: "Vijaya Ashiyana Project Details & Site Visit | Guwahati",
    description: "Request Vijaya Ashiyana floor plans, current pricing and a guided site visit for flats on Rajgarh Link Road, Guwahati. Tell our team your preferred home size and callback time.",
    image: "ashiyana-aerial",
    schema: [breadcrumbSchema([{ name: "Home", url: "" }, { name: "Vijaya Ashiyana", url: "buildings/vijaya-ashiyana.html" }, { name: "Request details", url: "ashiyana-interest.html" }])],
    children: `<section class="interest-hero">
  <div class="interest-image"><img src="${imagePath("", "ashiyana-aerial")}" alt="Artist's impression of Vijaya Ashiyana residential tower in Guwahati" fetchpriority="high"><span class="interest-image-caption">Artist's impression</span></div>
  <div class="interest-heading"><h1>Discover Vijaya Ashiyana.</h1><p>Premium flats on Rajgarh Link Road, Guwahati. Request the official floor plans, current pricing and a guided site visit at a time that works for you.</p><div class="interest-facts"><span>70 planned residences</span><span>RERA: ${escapeHtml(ashiyana.rera)}</span><span>Completion target: December 2029</span></div></div>
</section>
<section class="interest-content" id="details">
  <div class="section-inner interest-layout"><div class="interest-editorial"><span class="eyebrow">Your next conversation</span><h2>Tell us what feels like home.</h2><p>Whether you are comparing a luxury address or working within a particular budget, our sales team can explain the available choices without a booking commitment.</p><ul><li>Floor plans and home configurations</li><li>Current availability and price guidance</li><li>RERA and brochure details</li><li>A guided visit when you are ready</li></ul><a class="text-link" href="${brochureUrl("", ashiyana)}">View the Ashiyana brochure</a></div>
  <div class="interest-form-wrap"><h2>Request project details</h2><p>Our Guwahati sales desk will contact you during your selected window.</p>${interestForm()}</div></div>
</section>
<section class="interest-visual"><img src="${assetPath("", "ashiyana-rooftop-pool-aerial.jpg")}" alt="Artist's impression of Vijaya Ashiyana's proposed rooftop pool and recreation space" loading="lazy"><div><h2>A closer look at life above the city.</h2><p>Rooftop amenities shown as artist's impressions. Confirm final specifications in the official project documents.</p><a href="buildings/vijaya-ashiyana.html">Explore the full project ${icons.arrow}</a></div></section>
<section class="booking-confidence"><div class="section-inner"><div><span class="eyebrow">Buyer information</span><h2>Book with confidence.</h2><p>Verify project information on the official Assam RERA website. The customer information form is for buyers who have already paid a booking amount; it is separate from the enquiry form above.</p></div><div class="booking-links"><a href="https://rera.assam.gov.in/" target="_blank" rel="noopener noreferrer">Visit Assam RERA ${icons.arrow}</a><a href="https://forms.gle/piDFx9xmtopN8ErE7" target="_blank" rel="noopener noreferrer">Already booked? Open customer information form ${icons.arrow}</a></div></div></section>`,
  });
}

function projectSchema(project) {
  return {
    "@type": "ApartmentComplex",
    name: project.name,
    url: `${SITE_URL}/buildings/${project.slug}.html`,
    ...(project.status === "Ongoing" || project.hasSitePhoto ? { image: `${SITE_URL}/assets/images/${project.image}.webp` } : {}),
    description: project.short,
    address: { "@type": "PostalAddress", streetAddress: project.location, addressLocality: project.city, addressRegion: "Assam", addressCountry: "IN" },
    numberOfAccommodationUnits: Number.parseInt(project.units, 10),
    ...(project.rera ? { identifier: project.rera } : {}),
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
    : `<p class="section-copy">${isOngoing ? "Browse visuals and layouts, then come back to the highlights before connecting with sales." : project.hasSitePhoto ? "View the completed building photograph from our archive." : "We do not have a verified photograph of this completed building in our archive."}</p>`;
  const highlightsCopy = isAshiyanaPreview
    ? "Browse the highlights before connecting with our Sales Team so the call can focus on availability, budget, and right fit."
    : isOngoing
    ? "Browse highlights before connecting so the conversation can focus on availability, budget, and fit."
    : "Trust comes from what has already been completed. These records support current buyers comparing builders in Guwahati and Tezpur.";
  const contactCopy = isAshiyanaPreview
    ? `Ask our team for ${project.name} floor plans, current availability, price guidance, and a guided site visit.`
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
    image: project.status === "Completed" && !project.hasSitePhoto ? "vijaya-logo.png" : project.heroImage || project.image,
    schema,
    children: `<section class="hero project-hero">
  <div class="hero-media${project.status === "Completed" && !project.hasSitePhoto ? " hero-media-archive" : ""}">${project.status === "Completed" && !project.hasSitePhoto
    ? `<span>Completed Vijaya address in ${escapeHtml(project.location)}</span>`
    : `<img src="${imagePath(prefix, project.heroImage || project.image)}" alt="${escapeHtml(project.status === "Completed" ? `Completed ${project.name} building at ${project.location}` : `Artist's impression of ${project.name} at ${project.location}`)}">`}</div>
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
    <div class="proof-photo reveal">${project.status === "Completed" && !project.hasSitePhoto ? `<div class="archive-media"><small>Completed address</small><strong>${escapeHtml(project.name)}</strong><span>Project photograph not available in our archive</span></div>` : `<img src="${imagePath(prefix, project.image)}" alt="${escapeHtml(project.name)} ${project.status === "Completed" ? "completed building photograph" : "artist's impression"}" loading="lazy">`}</div>
  </div>
</section>
<section class="section">
  <div class="section-inner">
    <div class="section-head reveal">
      <h2 class="section-heading">${isOngoing ? "Explore the Vision: Gallery & Layouts." : project.hasSitePhoto ? "The completed address." : "Project photo archive."}</h2>
      ${galleryCopy}
    </div>
    ${project.status === "Completed" && !project.hasSitePhoto ? `<p class="archive-note">No verified project photograph is available in our archive. Contact our team for the delivered address details.</p>` : `<div class="gallery-grid">${gallery}${project.slug === "vijaya-ashiyana" ? `<figure class="gallery-item reveal"><img src="${assetPath(prefix, "ashiyana-rooftop-pool-aerial.jpg")}" alt="Artist's impression of Vijaya Ashiyana planned rooftop pool from above" loading="lazy"><figcaption class="gallery-caption">Planned rooftop pool, aerial artist's impression</figcaption></figure><figure class="gallery-item reveal"><img src="${assetPath(prefix, "ashiyana-pool-deck-dusk.jpg")}" alt="Artist's impression of Vijaya Ashiyana planned rooftop deck at dusk" loading="lazy"><figcaption class="gallery-caption">Planned pool deck, dusk artist's impression</figcaption></figure>` : ""}</div>`}
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
${project.slug === "vijaya-ashiyana" ? `<section class="interest-jump"><div class="section-inner"><div><h2>Want the details that matter to you?</h2><p>Share your home preference, requirements and a good time to call.</p></div><a class="btn btn-primary" href="${prefix}ashiyana-interest.html">${icons.arrow} Request project details</a></div></section>` : ""}
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
    "ashiyana-interest.html",
    ...allProjects.map((project) => `buildings/${project.slug}.html`),
    ...ongoingProjects.map((project) => `brochures/${project.brochurePage}`),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${SITE_URL}/${url}</loc></url>`).join("\n")}
</urlset>
`;
}

ensureDirs();
write("index.html", homePage());
write("completed.html", completedPage());
write("ashiyana-interest.html", interestPage());
allProjects.forEach((project) => write(`buildings/${project.slug}.html`, projectPage(project)));
ongoingProjects.forEach((project) => write(`brochures/${project.brochurePage}`, brochurePage(project)));
write("robots.txt", robotsTxt());
write("sitemap.xml", sitemapXml());
write(".well-known/security.txt", securityTxt());

if (IS_ROOT_OUTPUT) {
  write("vercel.json", vercelJson());
  write("_headers", headersFile());
}

console.log(`Built ${3 + allProjects.length + ongoingProjects.length} HTML pages plus robots.txt and sitemap.xml in ${path.relative(ROOT, OUTPUT_DIR) || "."}.`);
