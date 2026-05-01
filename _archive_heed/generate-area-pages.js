#!/usr/bin/env node
/**
 * Generate Service × City landing pages for Heed Business Solutions
 * Run: node generate-area-pages.js
 * Full LA metro coverage × all services
 */

const fs = require('fs');
const path = require('path');

const AREAS_DIR = path.join(__dirname, 'areas');

// ══════════════════════════════════════════════════════════════
// CITIES — Full LA Metro + surrounding areas
// ══════════════════════════════════════════════════════════════
const cities = [
  // West San Fernando Valley
  { name: 'Woodland Hills',    slug: 'woodland-hills',    county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'Calabasas',         slug: 'calabasas',         county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'Hidden Hills',      slug: 'hidden-hills',      county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'West Hills',        slug: 'west-hills',        county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'Canoga Park',       slug: 'canoga-park',       county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'Chatsworth',        slug: 'chatsworth',        county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'Porter Ranch',      slug: 'porter-ranch',      county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'Granada Hills',     slug: 'granada-hills',     county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'Northridge',        slug: 'northridge',        county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'Reseda',            slug: 'reseda',            county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'Winnetka',          slug: 'winnetka',          county: 'Los Angeles', region: 'San Fernando Valley' },
  // Central San Fernando Valley
  { name: 'Encino',            slug: 'encino',            county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'Tarzana',           slug: 'tarzana',           county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'Sherman Oaks',      slug: 'sherman-oaks',      county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'Van Nuys',          slug: 'van-nuys',          county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'Studio City',       slug: 'studio-city',       county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'Valley Village',    slug: 'valley-village',    county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'North Hollywood',   slug: 'north-hollywood',   county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'Toluca Lake',       slug: 'toluca-lake',       county: 'Los Angeles', region: 'San Fernando Valley' },
  // East San Fernando Valley
  { name: 'Burbank',           slug: 'burbank',           county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'Glendale',          slug: 'glendale',          county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'San Fernando',      slug: 'san-fernando',      county: 'Los Angeles', region: 'San Fernando Valley' },
  { name: 'Panorama City',     slug: 'panorama-city',     county: 'Los Angeles', region: 'San Fernando Valley' },
  // Westside
  { name: 'Beverly Hills',     slug: 'beverly-hills',     county: 'Los Angeles', region: 'Westside' },
  { name: 'Brentwood',         slug: 'brentwood',         county: 'Los Angeles', region: 'Westside' },
  { name: 'Pacific Palisades', slug: 'pacific-palisades', county: 'Los Angeles', region: 'Westside' },
  { name: 'Malibu',            slug: 'malibu',            county: 'Los Angeles', region: 'Westside' },
  { name: 'Santa Monica',      slug: 'santa-monica',      county: 'Los Angeles', region: 'Westside' },
  { name: 'Century City',      slug: 'century-city',      county: 'Los Angeles', region: 'Westside' },
  { name: 'West Hollywood',    slug: 'west-hollywood',    county: 'Los Angeles', region: 'Westside' },
  { name: 'Culver City',       slug: 'culver-city',       county: 'Los Angeles', region: 'Westside' },
  { name: 'West Los Angeles',  slug: 'west-los-angeles',  county: 'Los Angeles', region: 'Westside' },
  { name: 'Mar Vista',         slug: 'mar-vista',         county: 'Los Angeles', region: 'Westside' },
  { name: 'Venice',            slug: 'venice',            county: 'Los Angeles', region: 'Westside' },
  // Central / Downtown LA
  { name: 'Los Angeles',       slug: 'los-angeles',       county: 'Los Angeles', region: 'Central Los Angeles' },
  { name: 'Downtown Los Angeles', slug: 'downtown-la',    county: 'Los Angeles', region: 'Central Los Angeles' },
  { name: 'Hollywood',         slug: 'hollywood',         county: 'Los Angeles', region: 'Central Los Angeles' },
  { name: 'Los Feliz',         slug: 'los-feliz',         county: 'Los Angeles', region: 'Central Los Angeles' },
  { name: 'Silver Lake',       slug: 'silver-lake',       county: 'Los Angeles', region: 'Central Los Angeles' },
  { name: 'Echo Park',         slug: 'echo-park',         county: 'Los Angeles', region: 'Central Los Angeles' },
  { name: 'Koreatown',         slug: 'koreatown',         county: 'Los Angeles', region: 'Central Los Angeles' },
  { name: 'Hancock Park',      slug: 'hancock-park',      county: 'Los Angeles', region: 'Central Los Angeles' },
  // San Gabriel Valley
  { name: 'Pasadena',          slug: 'pasadena',          county: 'Los Angeles', region: 'San Gabriel Valley' },
  { name: 'South Pasadena',    slug: 'south-pasadena',    county: 'Los Angeles', region: 'San Gabriel Valley' },
  { name: 'Arcadia',           slug: 'arcadia',           county: 'Los Angeles', region: 'San Gabriel Valley' },
  { name: 'Alhambra',          slug: 'alhambra',          county: 'Los Angeles', region: 'San Gabriel Valley' },
  { name: 'San Marino',        slug: 'san-marino',        county: 'Los Angeles', region: 'San Gabriel Valley' },
  // South Bay
  { name: 'Manhattan Beach',   slug: 'manhattan-beach',   county: 'Los Angeles', region: 'South Bay' },
  { name: 'Hermosa Beach',     slug: 'hermosa-beach',     county: 'Los Angeles', region: 'South Bay' },
  { name: 'Redondo Beach',     slug: 'redondo-beach',     county: 'Los Angeles', region: 'South Bay' },
  { name: 'Palos Verdes',      slug: 'palos-verdes',      county: 'Los Angeles', region: 'South Bay' },
  { name: 'Torrance',          slug: 'torrance',          county: 'Los Angeles', region: 'South Bay' },
  { name: 'El Segundo',        slug: 'el-segundo',        county: 'Los Angeles', region: 'South Bay' },
  // South LA / Inglewood
  { name: 'Inglewood',         slug: 'inglewood',         county: 'Los Angeles', region: 'South Los Angeles' },
  { name: 'Hawthorne',         slug: 'hawthorne',         county: 'Los Angeles', region: 'South Los Angeles' },
  { name: 'Gardena',           slug: 'gardena',           county: 'Los Angeles', region: 'South Los Angeles' },
  // Conejo Valley / Ventura
  { name: 'Westlake Village',  slug: 'westlake-village',  county: 'Los Angeles', region: 'Conejo Valley' },
  { name: 'Thousand Oaks',     slug: 'thousand-oaks',     county: 'Ventura',     region: 'Conejo Valley' },
  { name: 'Agoura Hills',      slug: 'agoura-hills',      county: 'Los Angeles', region: 'Conejo Valley' },
  { name: 'Simi Valley',       slug: 'simi-valley',       county: 'Ventura',     region: 'Conejo Valley' },
  // Santa Clarita
  { name: 'Santa Clarita',     slug: 'santa-clarita',     county: 'Los Angeles', region: 'Santa Clarita Valley' },
  { name: 'Valencia',          slug: 'valencia',          county: 'Los Angeles', region: 'Santa Clarita Valley' },
];

// ══════════════════════════════════════════════════════════════
// SERVICES — All services offered by Heed Business Solutions
// ══════════════════════════════════════════════════════════════
const services = [
  {
    name: 'Web Design',
    slug: 'web-design',
    icon: 'fa-globe',
    metaDesc: (c) => `Custom web design for businesses in ${c}. Heed Business Solutions builds high-performance websites that position ${c} service firms, attorneys, and professionals to attract high-value clients.`,
    heroH1: (c) => `Web Design for Businesses in ${c}`,
    heroLead: (c) => `Your website is the first thing a prospective client evaluates. If it does not match your reputation, you lose the opportunity before the first conversation. Heed Business Solutions builds custom websites for ${c} businesses that convert high-value prospects into long-term clients.`,
    problemTitle: () => 'Your Website Should Work as Hard as You Do',
    problems: (c) => [
      `Prospective clients in ${c} compare your website to competitors within seconds. A template site on Wix or Squarespace signals that your business is new, underinvested, or not operating at their level.`,
      'Slow load times, poor mobile experience, and missing structured data mean search engines and AI tools cannot recommend you even when you are the best option.',
      'Your website, intake process, and follow-up should tell one consistent story. Disconnected systems create friction that costs you qualified clients.',
    ],
    solutions: () => [
      'Custom HTML websites built for speed, credibility, and conversion',
      'Authority-positioned content that reflects your credentials and expertise',
      'GEO-optimized structured data so AI search engines cite and recommend you',
      'Mobile-first responsive design that works flawlessly on every device',
      'AI-powered intake integration with your CRM or practice management system',
      'Ongoing performance monitoring and conversion optimization',
    ],
    related: '/services/web-design.html',
  },
  {
    name: 'SEO',
    slug: 'seo',
    icon: 'fa-magnifying-glass-chart',
    metaDesc: (c) => `SEO services for businesses in ${c}. Heed Business Solutions helps ${c} service firms, attorneys, and professionals rank for high-intent search terms and attract qualified clients.`,
    heroH1: (c) => `SEO Services for Businesses in ${c}`,
    heroLead: (c) => `High-value clients search for specific services in specific locations. If your ${c} business does not appear for those queries, your competitors capture those clients by default. Heed Business Solutions builds SEO strategies that position ${c} businesses as the local authority.`,
    problemTitle: () => 'Ranking on Page One Is No Longer Enough',
    problems: (c) => [
      `Google now shows AI Overviews, local packs, and featured snippets before organic results. If your ${c} business is not structured for all three, you are losing visibility to competitors who are.`,
      'Generic SEO tactics like keyword stuffing and purchased backlinks do not work for professional services. High-value clients evaluate authority signals, not advertising.',
      'Most business websites lack the structured data, service page depth, and local signals that both traditional and AI search engines need to recommend them.',
    ],
    solutions: () => [
      'Service × location page strategy that captures high-intent local search traffic',
      'Technical SEO audit and implementation including site speed and structured data',
      'Google Business Profile optimization for local pack visibility',
      'Authority content creation focused on client questions and expertise',
      'Competitor gap analysis to identify ranking opportunities',
      'Monthly reporting with metrics tied to client acquisition, not just traffic',
    ],
    related: '/services/digital-intelligence.html',
  },
  {
    name: 'GEO Optimization',
    slug: 'geo-optimization',
    icon: 'fa-robot',
    metaDesc: (c) => `Generative Engine Optimization for businesses in ${c}. Heed Business Solutions structures your content so ChatGPT, Google AI Overviews, and Perplexity can cite and recommend your ${c} business.`,
    heroH1: (c) => `GEO Optimization for Businesses in ${c}`,
    heroLead: (c) => `More than 40% of online searches now involve AI-generated answers. When a potential client asks ChatGPT or Google AI for a service provider in ${c}, will your business be cited? Heed Business Solutions specializes in Generative Engine Optimization — structuring your content so AI search engines recommend you.`,
    problemTitle: () => 'AI Search Engines Cannot Recommend What They Cannot Understand',
    problems: (c) => [
      `Most business websites in ${c} are invisible to AI search engines because they lack structured data, clear entity definitions, and FAQ-formatted content that AI models can extract and cite.`,
      'Traditional SEO optimizes for links and rankings. GEO optimizes for how AI models interpret, summarize, and recommend your business in conversational answers. Both matter, but GEO is the fastest-growing channel.',
      'Businesses that optimize for GEO now will own the citation space for their industry in their area. Waiting means ceding that ground to competitors who move first.',
    ],
    solutions: () => [
      'Comprehensive GEO Readiness Audit evaluating 12 factors for AI search visibility',
      'Schema markup implementation including Organization, Service, FAQPage, and Speakable',
      'Entity definition optimization so AI engines know exactly who you are and what you do',
      'FAQ content creation formatted for direct AI extraction and citation',
      'Authority content positioning with clear, declarative statements AI can quote',
      'Competitive GEO benchmarking against other businesses in your area',
    ],
    related: '/geo-audit.html',
  },
  {
    name: 'Marketing',
    slug: 'marketing',
    icon: 'fa-bullhorn',
    metaDesc: (c) => `Strategic marketing services for businesses in ${c}. Heed Business Solutions helps ${c} service firms attract high-value clients through precision positioning, not volume marketing.`,
    heroH1: (c) => `Marketing Services for Businesses in ${c}`,
    heroLead: (c) => `High-value clients do not respond to mass marketing. They respond to precision, reputation, and experience. Heed Business Solutions builds marketing systems for ${c} businesses that earn trust and convert selective clients who have options and expect more.`,
    problemTitle: () => 'Volume Marketing Does Not Work for High-Value Clients',
    problems: (c) => [
      `Discerning clients in ${c} are not browsing generic ads or responding to mass email campaigns. They evaluate businesses through referrals, search results, and the quality of your digital presence.`,
      'Generic marketing agencies sell tactics — ads, social posts, email blasts. None of these address the fundamental question: does your business look and feel like the right choice for a selective client?',
      'Disconnected marketing efforts from multiple vendors create an inconsistent experience that erodes trust with exactly the clients you want to attract.',
    ],
    solutions: () => [
      'Market positioning analysis that identifies your unique authority in your industry and geography',
      'Integrated marketing strategy that aligns messaging across every touchpoint',
      'Content marketing that demonstrates expertise to clients evaluating your business',
      'Email nurture sequences that build trust over time with qualified prospects',
      'Reputation management and review strategy that reinforces credibility',
      'Monthly strategy calls with clear performance metrics tied to client acquisition',
    ],
    related: '/services/marketing.html',
  },
  {
    name: 'PPC Advertising',
    slug: 'ppc',
    icon: 'fa-chart-line',
    metaDesc: (c) => `PPC advertising and Google Ads management for businesses in ${c}. Heed Business Solutions builds paid search campaigns that target high-value clients in ${c} and surrounding areas.`,
    heroH1: (c) => `PPC Advertising for Businesses in ${c}`,
    heroLead: (c) => `Pay-per-click advertising in ${c} is competitive and expensive. Most businesses waste budget on broad targeting that attracts price shoppers instead of qualified clients. Heed Business Solutions builds PPC campaigns designed to attract the high-value clients your ${c} business actually wants.`,
    problemTitle: () => 'Most PPC Campaigns Attract the Wrong Clients',
    problems: (c) => [
      `The cost per click for competitive service keywords in ${c} can exceed $50 to $200+. If your landing pages and targeting are not engineered for high-value conversion, you are burning budget on leads that never convert.`,
      'Broad match keywords and generic ad copy attract price-sensitive shoppers, not discerning clients with real needs and real budgets.',
      'Without proper tracking and attribution, you cannot know which campaigns generate the high-value engagements your business needs.',
    ],
    solutions: () => [
      'High-intent keyword targeting focused on specific services and client profiles',
      'Custom landing pages engineered for high-value client conversion',
      'Negative keyword strategy that filters out price shoppers and low-value queries',
      'Geographic targeting precision including neighborhoods, zip codes, and radius',
      'Conversion tracking tied to actual client intake, not just form submissions',
      'Monthly reporting with cost-per-qualified-lead metrics',
    ],
    related: '/services/ppc-ads.html',
  },
  {
    name: 'Social Media Marketing',
    slug: 'social-media',
    icon: 'fa-share-nodes',
    metaDesc: (c) => `Social media marketing for businesses in ${c}. Heed Business Solutions builds authority-driven social presence for ${c} service firms and professionals serving high-value clients.`,
    heroH1: (c) => `Social Media Marketing for Businesses in ${c}`,
    heroLead: (c) => `Social media for ${c} businesses is not about going viral or accumulating followers. It is about building a consistent authority presence that reinforces trust with clients evaluating your business. Heed Business Solutions creates social strategies that position ${c} professionals as the clear expert.`,
    problemTitle: () => 'Posting Without Strategy Damages Your Brand',
    problems: (c) => [
      `Prospective clients in ${c} check social media, but they are not looking for entertainment. They look for authority signals, thought leadership, and consistency that confirms what they heard through a referral or found in search.`,
      'Generic posts, stock images, and inconsistent schedules signal to discerning clients that your business does not take its own marketing seriously.',
      'Most social media is managed by generalists who do not understand your industry, your client psychology, or what differentiates your practice.',
    ],
    solutions: () => [
      'Authority-driven content calendar with industry-specific topics',
      'LinkedIn thought leadership positioning for the business principal',
      'Consistent visual branding that reflects the quality of your practice',
      'Community management and reputation monitoring',
      'Integration with your website and email for unified messaging',
      'Monthly analytics tied to engagement quality, not vanity metrics',
    ],
    related: '/services/social-media.html',
  },
  {
    name: 'Business Consulting',
    slug: 'business-consulting',
    icon: 'fa-rocket',
    metaDesc: (c) => `Business consulting sprints for companies in ${c}. Heed Business Solutions delivers time-boxed intensive consulting from discovery to 90-day growth execution plans for ${c} businesses.`,
    heroH1: (c) => `Business Consulting for Companies in ${c}`,
    heroLead: (c) => `Sometimes you do not need a retainer. You need a focused sprint that identifies the gaps, builds the plan, and gets your ${c} business moving in the right direction fast. Heed Business Solutions delivers time-boxed consulting engagements that produce clear, actionable outcomes.`,
    problemTitle: () => 'Most Consulting Is Long on Advice and Short on Execution',
    problems: (c) => [
      `${c} business owners are tired of consultants who deliver reports and recommendations but never build anything. You need a partner who executes, not just advises.`,
      'Generic growth advice from consultants who do not understand your specific market, competitive landscape, or client profile wastes time and money.',
      'Without a structured, time-boxed approach, consulting engagements drag on and never reach a clear conclusion or measurable outcome.',
    ],
    solutions: () => [
      'Discovery sprint that maps your business landscape, gaps, and opportunities',
      '90-day growth execution plan with clear deliverables and timelines',
      'Competitive analysis specific to your industry and geography',
      'Client acquisition system design from positioning to retention',
      'Technology and workflow audit to eliminate inefficiencies',
      'Post-sprint handoff with everything documented and actionable',
    ],
    related: '/services/business-sprints.html',
  },
  {
    name: 'AI Client Intake',
    slug: 'ai-client-intake',
    icon: 'fa-headset',
    metaDesc: (c) => `AI-powered client intake systems for businesses in ${c}. Heed Business Solutions builds AI phone reception and intake workflows that qualify leads and book appointments 24/7.`,
    heroH1: (c) => `AI Client Intake Systems for Businesses in ${c}`,
    heroLead: (c) => `When a prospective client calls your ${c} business after hours, does someone answer? Most firms lose their best prospects to voicemail and slow follow-up. Heed Business Solutions builds AI-powered intake systems that qualify leads, capture information, and book appointments around the clock.`,
    problemTitle: () => 'Every Missed Call Is a Lost Client',
    problems: (c) => [
      `Prospective clients in ${c} often reach out during evenings, weekends, or moments of urgency. If your phone goes to voicemail, they call the next business on their list.`,
      'Manual intake processes — writing down information, entering it into the CRM later, forgetting to follow up — create friction that loses qualified clients at the moment they are ready to engage.',
      'Your competitors who respond within minutes convert at dramatically higher rates than businesses that respond hours or days later.',
    ],
    solutions: () => [
      'AI phone reception that answers calls 24/7 with professionalism and precision',
      'Automated lead qualification based on service type, urgency, and client profile',
      'Direct appointment booking into your calendar or CRM system',
      'Instant notification for high-priority inquiries',
      'Follow-up sequence automation for leads not ready to book immediately',
      'Full CRM integration so no lead information is ever lost or re-entered',
    ],
    related: '/services/technology.html',
  },
  {
    name: 'CRM Implementation',
    slug: 'crm',
    icon: 'fa-database',
    metaDesc: (c) => `CRM implementation for businesses in ${c}. Heed Business Solutions builds and integrates CRM workflows that track every client relationship from first contact to referral.`,
    heroH1: (c) => `CRM Implementation for Businesses in ${c}`,
    heroLead: (c) => `A client relationship does not end at the first engagement. It compounds through excellent service, strategic follow-up, and referral cultivation. Heed Business Solutions builds CRM systems for ${c} businesses that track every relationship from first contact to long-term growth.`,
    problemTitle: () => 'Spreadsheets and Memory Are Not Relationship Systems',
    problems: (c) => [
      `Most ${c} businesses track client relationships through email, sticky notes, and memory. This works until it does not — and the failure usually costs you the client or referral you can least afford to lose.`,
      'Without systematic follow-up, past clients forget about you. The work you completed should be generating referrals today, but only if you have a system to stay top of mind.',
      'Manual data entry between intake forms, your systems, and marketing tools wastes hours every week and introduces errors that damage client experience.',
    ],
    solutions: () => [
      'CRM platform selection and implementation tailored to your business size and workflow',
      'Automated intake-to-CRM pipeline so lead information flows without manual entry',
      'Client lifecycle tracking from prospect to active client to referral source',
      'Automated follow-up sequences for post-engagement relationship nurturing',
      'Integration with practice management systems and marketing tools',
      'Dashboard and reporting showing pipeline health and referral tracking',
    ],
    related: '/services/sales-bd.html',
  },
  {
    name: 'Sales Strategy',
    slug: 'sales-strategy',
    icon: 'fa-handshake',
    metaDesc: (c) => `Sales strategy and business development for companies in ${c}. Heed Business Solutions builds sales systems, CRM workflows, and BD strategy for ${c} service firms.`,
    heroH1: (c) => `Sales Strategy for Businesses in ${c}`,
    heroLead: (c) => `Winning high-value clients in ${c} requires more than a good pitch. It requires a system — from how prospects discover you, to how you qualify them, to how you close and retain them. Heed Business Solutions builds sales systems that convert consistently.`,
    problemTitle: () => 'Sales Without Systems Is Just Hustle',
    problems: (c) => [
      `Most ${c} businesses rely on the owner's network and word of mouth for new business. That works until growth stalls, key relationships change, or the market shifts.`,
      'Without a defined sales process, every prospect interaction is improvised. This leads to inconsistent close rates, lost follow-ups, and unpredictable revenue.',
      'Hiring salespeople without building the system first means you are paying for activity without accountability or scalability.',
    ],
    solutions: () => [
      'Sales process mapping from lead identification to close to retention',
      'CRM implementation with pipeline stages, automation, and reporting',
      'Proposal and pricing strategy that positions value over cost',
      'Follow-up workflow design so no qualified lead falls through the cracks',
      'Fractional sales leadership when you need strategic direction without full-time overhead',
      'Monthly pipeline review and strategy adjustment',
    ],
    related: '/services/sales-bd.html',
  },
  {
    name: 'Technology Solutions',
    slug: 'technology',
    icon: 'fa-microchip',
    metaDesc: (c) => `Technology consulting and implementation for businesses in ${c}. Heed Business Solutions provides smart office, AV integration, and technology system design for ${c} companies.`,
    heroH1: (c) => `Technology Solutions for Businesses in ${c}`,
    heroLead: (c) => `Technology should make your ${c} business more efficient, more professional, and more competitive. Heed Business Solutions designs and implements technology systems that integrate with how you actually work — from smart office automation to AV solutions to software integration.`,
    problemTitle: () => 'Technology Should Serve Your Business, Not Complicate It',
    problems: (c) => [
      `Most ${c} businesses have technology stacks that evolved accidentally — a mix of tools that do not talk to each other, require manual workarounds, and create more friction than they eliminate.`,
      'Off-the-shelf solutions are designed for average businesses. Your specific workflow, client experience, and growth goals require systems tailored to how you actually operate.',
      'Without a technology strategy, every new tool adds complexity instead of efficiency.',
    ],
    solutions: () => [
      'Technology audit and systems architecture tailored to your business',
      'Smart office and AV design for conference rooms, client spaces, and operations',
      'Software integration connecting your CRM, marketing, intake, and operations tools',
      'Automation workflows that eliminate repetitive manual tasks',
      'Vendor-neutral recommendations so you get the best tools, not the most advertised',
      'Ongoing technology management and support',
    ],
    related: '/services/technology.html',
  },
  {
    name: 'Digital Intelligence',
    slug: 'digital-intelligence',
    icon: 'fa-magnifying-glass-chart',
    metaDesc: (c) => `Digital intelligence and analytics for businesses in ${c}. Heed Business Solutions provides SEO audits, competitive research, reporting dashboards, and data-driven growth strategy.`,
    heroH1: (c) => `Digital Intelligence for Businesses in ${c}`,
    heroLead: (c) => `You cannot improve what you do not measure. Heed Business Solutions provides ${c} businesses with the data, analytics, and competitive intelligence needed to make informed decisions about marketing, positioning, and growth.`,
    problemTitle: () => 'Guessing Is Not a Growth Strategy',
    problems: (c) => [
      `Most ${c} businesses make marketing and growth decisions based on intuition rather than data. This leads to wasted budget on channels that do not convert and missed opportunities in channels that do.`,
      'Without competitive intelligence, you do not know where you stand relative to other businesses in your market. Your competitors may be outranking, outspending, or outpositioning you without your knowledge.',
      'Generic analytics dashboards show traffic and clicks but not the metrics that matter: qualified leads, client acquisition cost, and lifetime value.',
    ],
    solutions: () => [
      'Comprehensive SEO and digital presence audit with prioritized recommendations',
      'Competitive research and benchmarking against businesses in your market',
      'Custom reporting dashboards showing metrics that matter for client acquisition',
      'Conversion funnel analysis identifying where prospects drop off',
      'Market opportunity mapping for underserved search terms and geographic areas',
      'Quarterly strategy reviews informed by real performance data',
    ],
    related: '/services/digital-intelligence.html',
  },
];

// ══════════════════════════════════════════════════════════════
// PAGE TEMPLATE
// ══════════════════════════════════════════════════════════════
function buildPage(service, city) {
  const title = `${service.name} for Businesses in ${city.name} | Heed Business Solutions`;
  const slug = `${service.slug}-${city.slug}`;
  const url = `https://heedbusinesssolutions.com/areas/${slug}.html`;
  const problems = service.problems(city.name);
  const solutions = service.solutions();

  // Find nearby cities in same region for cross-linking
  const nearby = cities
    .filter(c => c.region === city.region && c.slug !== city.slug)
    .slice(0, 5);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/png" href="../images/logos/image_e43fb0dc-dabb-48f3-a17a-817ce837ff65.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${service.metaDesc(city.name)}" />
  <meta name="keywords" content="${service.name.toLowerCase()} ${city.name.toLowerCase()}, ${service.slug} services ${city.name.toLowerCase()} CA, ${city.name.toLowerCase()} business consulting, Heed Business Solutions ${city.name.toLowerCase()}" />
  <meta name="author" content="Michael Bowers" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${service.metaDesc(city.name)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="https://heedbusinesssolutions.com/images/logos/image_f47409d4-5904-41c8-a00e-84279fcd534c.png" />
  <meta property="og:site_name" content="Heed Business Solutions" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${service.metaDesc(city.name)}" />
  <title>${title}</title>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "name": "${service.name} in ${city.name}",
      "description": "${service.metaDesc(city.name).replace(/"/g, '\\"')}",
      "provider": {
        "@type": "ProfessionalService",
        "name": "Heed Business Solutions",
        "url": "https://heedbusinesssolutions.com",
        "telephone": "+13103630826",
        "address": { "@type": "PostalAddress", "addressLocality": "Los Angeles", "addressRegion": "CA", "addressCountry": "US" }
      },
      "areaServed": {
        "@type": "City",
        "name": "${city.name}",
        "containedInPlace": { "@type": "AdministrativeArea", "name": "${city.county} County, California" }
      },
      "serviceType": "${service.name}"
    },
    {
      "@type": "WebPage",
      "name": "${title}",
      "url": "${url}",
      "isPartOf": { "@type": "WebSite", "name": "Heed Business Solutions", "url": "https://heedbusinesssolutions.com" },
      "speakable": { "@type": "SpeakableSpecification", "cssSelector": [".hero--sm__heading", ".hero--sm__lead", ".faq-answer"] }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Who provides ${service.name.toLowerCase()} services in ${city.name}?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Heed Business Solutions provides ${service.name.toLowerCase()} services for businesses in ${city.name}, California. We specialize in helping service firms, attorneys, and professionals attract high-value clients through precision positioning, GEO-optimized digital presence, and integrated client acquisition systems."
          }
        },
        {
          "@type": "Question",
          "name": "How much does ${service.name.toLowerCase()} cost for a business in ${city.name}?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pricing for ${service.name.toLowerCase()} in ${city.name} depends on the scope of your business and current digital presence. Heed Business Solutions offers a free 20-minute clarity call to assess your needs and provide a custom proposal. Most engagements begin with a focused project and scale into ongoing support."
          }
        },
        {
          "@type": "Question",
          "name": "Does Heed Business Solutions serve businesses outside of ${city.name}?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. While this page focuses on ${city.name}, Heed Business Solutions serves businesses throughout the Greater Los Angeles area including the ${city.region} region. We also work with businesses nationally when the engagement is a fit."
          }
        }
      ]
    }
  ]
}
</script>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,900;1,9..40,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="../css/styles.css" />
  <script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/23411980.js"></script>
</head>
<body>
<a href="#main-content" class="skip-nav">Skip to main content</a>

  <header class="site-header" id="site-header">
    <nav class="site-nav container">
      <a href="/index.html" class="site-nav__logo" aria-label="Heed Business Solutions Home">
        <img src="../images/logos/image_63845eb1-132b-4180-a8d3-2ceaebd41aa4.png" alt="Heed Business Solutions" class="site-nav__logo-img" onerror="this.style.display='none'; document.getElementById('logo-text-nav').style.display='inline';" />
        <span id="logo-text-nav" class="site-nav__logo-text" style="display:none;">Heed<span> Business Solutions</span></span>
      </a>
      <ul class="site-nav__links" id="nav-links">
        <li><a href="/index.html" class="site-nav__link">Home</a></li>
        <li><a href="/about.html" class="site-nav__link">About</a></li>
        <li class="site-nav__item--dropdown">
          <a href="#" class="site-nav__link site-nav__link--dropdown" aria-haspopup="true" aria-expanded="false"><span>Services</span> <i class="fa-solid fa-chevron-down site-nav__chevron"></i></a>
          <ul class="site-nav__dropdown" role="menu">
            <li role="none"><a href="/services/web-design.html" role="menuitem"><i class="fa-solid fa-globe"></i> Web Design</a></li>
            <li role="none"><a href="/services/marketing.html" role="menuitem"><i class="fa-solid fa-bullhorn"></i> Marketing</a></li>
            <li role="none"><a href="/services/ppc-ads.html" role="menuitem"><i class="fa-solid fa-chart-line"></i> PPC &amp; Ads</a></li>
            <li role="none"><a href="/services/social-media.html" role="menuitem"><i class="fa-solid fa-share-nodes"></i> Social Media</a></li>
            <li role="none"><a href="/services/sales-bd.html" role="menuitem"><i class="fa-solid fa-handshake"></i> Sales &amp; BD</a></li>
            <li role="none"><a href="/services/technology.html" role="menuitem"><i class="fa-solid fa-microchip"></i> Technology</a></li>
            <li role="none"><a href="/services/business-sprints.html" role="menuitem"><i class="fa-solid fa-rocket"></i> Consulting Sprints</a></li>
          </ul>
        </li>
        <li><a href="/portfolio.html" class="site-nav__link">Portfolio</a></li>
        <li><a href="/blog.html" class="site-nav__link">Blog</a></li>
        <li><a href="/contact.html" class="site-nav__link">Contact</a></li>
      </ul>
      <a href="https://calendar.app.google/G6oc9Q7uRibsczeR9" class="btn btn--gold site-nav__cta" target="_blank" rel="noopener">Book a Call</a>
      <button class="site-nav__hamburger" id="hamburger" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button>
    </nav>
  </header>

  <main id="main-content">

    <section class="hero hero--sm">
      <div class="container hero--sm__inner">
        <p class="eyebrow reveal"><i class="fa-solid ${service.icon}"></i> ${service.name} &middot; ${city.name}, CA</p>
        <h1 class="hero--sm__heading reveal reveal-delay-1">${service.heroH1(city.name)}</h1>
        <p class="hero--sm__lead reveal reveal-delay-2">${service.heroLead(city.name)}</p>
        <div style="margin-top:var(--space-2xl); display:flex; flex-wrap:wrap; gap:var(--space-md);" class="reveal reveal-delay-3">
          <a href="https://calendar.app.google/G6oc9Q7uRibsczeR9" class="btn btn--gold" target="_blank" rel="noopener">Book a Clarity Call</a>
          <a href="/geo-audit.html" class="btn btn--outline">Get Your Free GEO Audit</a>
        </div>
      </div>
    </section>

    <section class="section bg-off-white">
      <div class="container">
        <div class="section-header reveal">
          <p class="eyebrow">The Challenge</p>
          <h2>${service.problemTitle()}</h2>
        </div>
        <div class="value-pillars">
${problems.map((p, i) => `          <div class="pillar-card reveal${i > 0 ? ' reveal-delay-' + i : ''}">
            <div class="pillar-card__icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <h3 class="pillar-card__title">Challenge ${String(i + 1).padStart(2, '0')}</h3>
            <p class="pillar-card__desc">${p}</p>
          </div>`).join('\n')}
        </div>
      </div>
    </section>

    <section class="section bg-white">
      <div class="container">
        <div class="section-header reveal">
          <p class="eyebrow">What We Deliver</p>
          <h2>${service.name} Solutions for ${city.name} Businesses</h2>
        </div>
        <div class="services-grid__grid">
${solutions.map((s, i) => `          <div class="service-card reveal${i > 0 ? ' reveal-delay-' + (i % 4) : ''}">
            <div class="service-card__icon"><i class="fa-solid fa-check"></i></div>
            <h3 class="service-card__title">${s.split(' — ')[0].split(' including ')[0].split(' that ')[0]}</h3>
            <p class="service-card__desc">${s}</p>
          </div>`).join('\n')}
        </div>
      </div>
    </section>

    <section class="section bg-navy">
      <div class="container">
        <div class="section-header section-header--light reveal">
          <p class="eyebrow eyebrow--light">Service Area</p>
          <h2>Serving ${city.name} and the ${city.region}</h2>
          <p class="section-lead">Heed Business Solutions is based in Los Angeles and serves businesses throughout the ${city.region} region including ${city.name}. We understand the competitive landscape, demographics, and market dynamics that shape how clients choose service providers in this area.</p>
        </div>
${nearby.length > 0 ? `        <div style="display:flex; flex-wrap:wrap; gap:var(--space-md); justify-content:center; margin-top:var(--space-2xl);">
${nearby.map(c => `          <a href="/areas/${service.slug}-${c.slug}.html" class="btn btn--outline-light" style="font-size:0.85rem;">${service.name} in ${c.name}</a>`).join('\n')}
        </div>` : ''}
        <div style="text-align:center; margin-top:var(--space-xl);">
          <a href="/sitemap-page.html" style="color:rgba(255,255,255,0.6); font-size:0.85rem;">View all service areas &rarr;</a>
        </div>
      </div>
    </section>

    <section class="faq section bg-off-white">
      <div class="container">
        <div class="section-header reveal">
          <p class="eyebrow">Frequently Asked Questions</p>
          <h2>${service.name} in ${city.name}</h2>
        </div>
        <div class="faq-list" style="max-width:780px; margin:0 auto;">
          <div class="faq-item reveal">
            <button class="faq-question" aria-expanded="false">
              <span>Who provides ${service.name.toLowerCase()} services in ${city.name}?</span>
              <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="faq-answer">
              <p>Heed Business Solutions provides ${service.name.toLowerCase()} services for businesses in ${city.name}, California. We specialize in helping service firms, attorneys, and professionals attract high-value clients through precision positioning, GEO-optimized digital presence, and integrated client acquisition systems.</p>
            </div>
          </div>
          <div class="faq-item reveal reveal-delay-1">
            <button class="faq-question" aria-expanded="false">
              <span>How much does ${service.name.toLowerCase()} cost for a ${city.name} business?</span>
              <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="faq-answer">
              <p>Pricing for ${service.name.toLowerCase()} in ${city.name} depends on the scope of your business and current digital presence. Heed Business Solutions offers a free 20-minute clarity call to assess your needs and provide a custom proposal. Most engagements begin with a focused project and scale into ongoing support.</p>
            </div>
          </div>
          <div class="faq-item reveal reveal-delay-2">
            <button class="faq-question" aria-expanded="false">
              <span>Does Heed Business Solutions serve businesses outside of ${city.name}?</span>
              <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="faq-answer">
              <p>Yes. While this page focuses on ${city.name}, we serve businesses throughout the Greater Los Angeles area including the ${city.region} region. We also work with businesses nationally when the engagement is a fit.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section section bg-navy">
      <div class="container">
        <div class="cta-section__inner reveal">
          <h2 class="cta-section__heading">Ready to Grow Your ${city.name} Business?</h2>
          <p class="cta-section__lead">Book a 20-minute clarity call and find out where your business is leaving opportunities on the table.</p>
          <div class="cta-section__actions">
            <a href="https://calendar.app.google/G6oc9Q7uRibsczeR9" class="btn btn--gold" target="_blank" rel="noopener">Book Your Clarity Call</a>
            <a href="/geo-audit.html" class="btn btn--outline-light">Get Your Free GEO Audit</a>
          </div>
        </div>
      </div>
    </section>

  </main>

  <footer class="site-footer">
    <div class="container">
      <div class="site-footer__top">
        <div class="site-footer__brand">
          <a href="/index.html" class="site-footer__logo-link"><img src="../images/logos/image_f47409d4-5904-41c8-a00e-84279fcd534c.png" alt="Heed Business Solutions" class="site-footer__logo-img" /></a>
          <p class="site-footer__tagline">Win high-value clients who expect more. Built in LA.</p>
        </div>
        <div class="site-footer__col">
          <h4 class="site-footer__col-heading">Company</h4>
          <ul class="site-footer__col-list">
            <li><a href="/about.html">About</a></li>
            <li><a href="/geo-audit.html">GEO Readiness Audit</a></li>
            <li><a href="/sitemap-page.html">All Service Areas</a></li>
            <li><a href="/contact.html">Contact</a></li>
          </ul>
        </div>
        <div class="site-footer__col">
          <h4 class="site-footer__col-heading">Contact</h4>
          <ul class="site-footer__col-list site-footer__col-list--contact">
            <li><a href="tel:3103630826"><i class="fa-solid fa-phone"></i> 310-363-0826</a></li>
            <li><a href="mailto:reachus@heedbusinesssolutions.com"><i class="fa-solid fa-envelope"></i> reachus@heedbusinesssolutions.com</a></li>
            <li><span><i class="fa-solid fa-map-pin"></i> Los Angeles, CA</span></li>
          </ul>
        </div>
      </div>
      <div class="site-footer__bottom">
        <p>&copy; 2025 Heed Business Solutions. All rights reserved.</p>
        <div class="site-footer__bottom-links"><a href="/privacy.html">Privacy Policy</a> <span aria-hidden="true">|</span> <a href="/terms.html">Terms</a></div>
      </div>
    </div>
  </footer>

  <script src="../js/main.js"></script>
</body>
</html>`;
}

// ══════════════════════════════════════════════════════════════
// GENERATE
// ══════════════════════════════════════════════════════════════
if (!fs.existsSync(AREAS_DIR)) fs.mkdirSync(AREAS_DIR, { recursive: true });

let count = 0;
const allPages = [];

for (const service of services) {
  for (const city of cities) {
    const filename = `${service.slug}-${city.slug}.html`;
    fs.writeFileSync(path.join(AREAS_DIR, filename), buildPage(service, city), 'utf-8');
    allPages.push({ service: service.name, city: city.name, file: `/areas/${filename}` });
    count++;
  }
}

fs.writeFileSync(path.join(AREAS_DIR, '_page-list.json'), JSON.stringify(allPages, null, 2), 'utf-8');
fs.writeFileSync(path.join(AREAS_DIR, '_page-list.txt'), allPages.map(p => p.file).join('\n'), 'utf-8');

console.log(`Generated ${count} area pages (${services.length} services × ${cities.length} cities)`);
console.log(`Cities: ${cities.length}`);
console.log(`Services: ${services.length}`);
console.log(`Page list saved to /areas/_page-list.json`);
