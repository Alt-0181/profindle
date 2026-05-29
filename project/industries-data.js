/* ─────────────────────────────────────────────────────────────
 * Profindle — shared Industries & Services data
 *
 * This is the single source of truth for industry / service lookups
 * across the platform. Both `Admin Panel.html` (manage screen) and
 * `Broadcast Request.html` (buyer service picker) read from this.
 *
 * In production, this will come from the database via a /api/industries
 * endpoint. The mock just exposes it on `window`.
 * ───────────────────────────────────────────────────────────── */

(function () {
  // 8-color palette — industries are assigned deterministically by index
  // so the same industry always gets the same color.
  const PALETTE = [
    'linear-gradient(135deg,#0F6F73,#1A9DA3)', // teal
    'linear-gradient(135deg,#22262F,#444B5A)', // slate
    'linear-gradient(135deg,#F77F00,#E06B00)', // amber
    'linear-gradient(135deg,#2BBEC5,#0F6F73)', // cyan
    'linear-gradient(135deg,#1A9DA3,#2BBEC5)', // mint
    'linear-gradient(135deg,#444B5A,#22262F)', // graphite
    'linear-gradient(135deg,#0F6F73,#22262F)', // forest
    'linear-gradient(135deg,#E06B00,#F77F00)', // sunset
  ];

  const BRIEFCASE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>';

  // Raw industry list — name + Thai translation.
  // Service lists are the seed catalog that ships in the production DB.
  // Order matters; it controls color assignment via index.
  const RAW = [
    { name: 'Accounting / Auditing / Taxation', th: 'บัญชี / ตรวจสอบ / ภาษี',
      services: ['Bookkeeping Services','Financial Reporting','Tax Preparation & Planning','Audit Services','Payroll Management','Financial Consulting','Budget Planning','Accounting Software Setup','CFO Services','Expense Management'] },
    { name: 'Admin / Secretarial', th: 'ธุรการ / เลขานุการ',
      services: ['Office Administration','Document Management','Meeting Coordination','Travel Arrangements','Calendar Management','Data Entry Services','Filing & Organization','Reception Services','Office Support','Virtual Assistant'] },
    { name: 'Advertising / Marketing / Promotion / PR', th: 'โฆษณา / การตลาด / ประชาสัมพันธ์',
      services: ['Digital Marketing Strategy','Social Media Marketing','Content Marketing','SEO/SEM Services','Email Marketing','Influencer Marketing','Brand Strategy & Consulting','Market Research','PR & Communications','Performance Marketing'] },
    { name: 'Architecture / Interior Design', th: 'สถาปัตยกรรม / ตกแต่งภายใน',
      services: ['Architectural Design','Interior Design','Space Planning','3D Visualization','Renovation Consulting','Furniture Design','Lighting Design','Landscape Architecture','Building Information Modeling (BIM)','Design Consultation'] },
    { name: 'Banking / Finance', th: 'ธนาคาร / การเงิน',
      services: ['Financial Advisory','Investment Consulting','Wealth Management','Corporate Finance','Risk Management','Financial Planning','Treasury Services','Credit Analysis','Portfolio Management','Financial Modeling'] },
    { name: 'Building / Construction', th: 'ก่อสร้าง',
      services: ['Construction Management','Project Planning','Site Supervision','Renovation Services','Building Inspection','Cost Estimation','Contract Management','Safety Compliance','Quality Control','Facilities Management'] },
    { name: 'Computer / IT', th: 'คอมพิวเตอร์ / ไอที',
      services: ['Web Development','Website Maintenance','Mobile App Development','Software Development','ERP Implementation','Cloud Solutions','IT Infrastructure','Cybersecurity Services','System Integration','IT Consulting','Database Management','DevOps Services'] },
    { name: 'Consulting', th: 'ที่ปรึกษา',
      services: ['Business Consulting','Management Consulting','Strategy Consulting','Process Improvement','Change Management','Performance Optimization','Market Entry Strategy','Digital Transformation','Organizational Development','Risk Consulting'] },
    { name: 'Customer Service', th: 'บริการลูกค้า',
      services: ['Customer Support','Call Center Services','Help Desk Services','Customer Experience Design','Client Relations Management','Customer Satisfaction Surveys','Complaint Handling','Live Chat Support','Technical Support','Customer Training'] },
    { name: 'Design / Creative', th: 'ดีไซน์ / ครีเอทีฟ',
      services: ['Graphic Design','Brand Identity Design','UI/UX Design','Web Design','Print Design','Packaging Design','Video Production','Photography Services','Animation & Motion Graphics','3D Modeling & Rendering'] },
    { name: 'Education / Training', th: 'การศึกษา / ฝึกอบรม',
      services: ['Corporate Training','Employee Development','Skills Training','Leadership Development','E-Learning Development','Training Program Design','Workshop Facilitation','Coaching Services','Certification Programs','Professional Development'] },
    { name: 'Electronics', th: 'อิเล็กทรอนิกส์',
      services: ['Electronics Design','Circuit Design','PCB Design','Embedded Systems','IoT Solutions','Electronics Testing','Product Development','Prototyping','Electronics Consulting','Quality Testing'] },
    { name: 'Engineering', th: 'วิศวกรรม',
      services: ['Mechanical Engineering','Electrical Engineering','Civil Engineering','Structural Engineering','Industrial Engineering','Systems Engineering','Process Engineering','Engineering Design','Technical Consulting','Project Engineering'] },
    { name: 'Entertainment / Recreation', th: 'บันเทิง / นันทนาการ',
      services: ['Event Entertainment','Performance Services','Recreation Planning','Entertainment Consulting','Talent Management','Show Production','Entertainment Technology','Venue Management','Artist Booking','Entertainment Marketing'] },
    { name: 'Event Management', th: 'จัดอีเวนต์',
      services: ['Event Organizer','Event Planning & Management','Corporate Events','Product Launch Events','Brand Activation','Exhibition & Trade Shows','Conferences & Seminars','Venue Management','Audio/Visual Setup','Event Catering Coordination','Event Photography & Videography'] },
    { name: 'Food & Beverage', th: 'อาหารและเครื่องดื่ม',
      services: ['Menu Development','Food Safety Consulting','Recipe Development','Catering Services','Food Photography','Restaurant Consulting','Kitchen Design','Nutrition Consulting','Food Production','Quality Assurance'] },
    { name: 'General Business', th: 'ธุรกิจทั่วไป',
      services: ['Business Planning','Business Development','Operations Management','Strategic Planning','Market Analysis','Feasibility Studies','Business Process Outsourcing','General Administration','Project Management','Business Support Services'] },
    { name: 'Government / Non-Profit', th: 'ภาครัฐ / องค์กรไม่แสวงหากำไร',
      services: ['Policy Development','Public Affairs','Grant Writing','Program Management','Community Outreach','Compliance Consulting','Public Sector Consulting','Fundraising','Social Impact Assessment','NGO Consulting'] },
    { name: 'Healthcare / Medical', th: 'สุขภาพ / การแพทย์',
      services: ['Healthcare Consulting','Medical Practice Management','Healthcare IT Solutions','Clinical Research','Healthcare Compliance','Medical Billing','Healthcare Marketing','Telemedicine Solutions','Healthcare Training','Patient Care Services'] },
    { name: 'Hotel / Restaurant', th: 'โรงแรม / ร้านอาหาร',
      services: ['Hotel Management Consulting','Restaurant Consulting','Hospitality Training','Menu Engineering','Guest Experience Design','Revenue Management','F&B Operations','Hospitality Marketing','Service Standards Development','Hospitality Technology'] },
    { name: 'Human Resources', th: 'ทรัพยากรบุคคล',
      services: ['Talent Acquisition','Executive Search','HR Consulting','Employee Training & Development','Performance Management','Compensation & Benefits','HR Compliance','Organizational Development','Onboarding Services','Employee Relations'] },
    { name: 'Import / Export', th: 'นำเข้า / ส่งออก',
      services: ['Trade Consulting','Customs Clearance','Import/Export Documentation','International Shipping','Trade Compliance','Freight Forwarding','Supply Chain Management','Trade Finance','Market Entry Services','International Business Development'] },
    { name: 'Insurance', th: 'ประกันภัย',
      services: ['Insurance Consulting','Risk Assessment','Claims Management','Policy Development','Insurance Brokerage','Actuarial Services','Insurance Technology','Underwriting Services','Loss Prevention','Insurance Training'] },
    { name: 'Legal', th: 'กฎหมาย',
      services: ['Corporate Law','Contract Drafting & Review','Employment Law','Intellectual Property','Compliance & Regulatory','Mergers & Acquisitions','Tax Law','Litigation Services','Legal Consulting','Data Privacy Law'] },
    { name: 'Logistics / Supply Chain / Transportation', th: 'โลจิสติกส์ / ซัพพลายเชน / ขนส่ง',
      services: ['Supply Chain Consulting','Logistics Planning','Warehouse Management','Transportation Management','Distribution Services','Inventory Optimization','Last Mile Delivery','Fleet Management','Supply Chain Technology','Procurement Services'] },
    { name: 'Manufacturing', th: 'การผลิต',
      services: ['Production Planning','Manufacturing Consulting','Process Optimization','Quality Management','Lean Manufacturing','Production Engineering','Factory Automation','Supply Chain Integration','Manufacturing Technology','Continuous Improvement'] },
    { name: 'Media / Advertising / Publishing', th: 'สื่อ / โฆษณา / สิ่งพิมพ์',
      services: ['Content Production','Media Planning','Advertising Services','Publishing Services','Editorial Services','Media Buying','Content Strategy','Digital Publishing','Broadcast Services','Media Consulting'] },
    { name: 'Merchandising / Purchasing', th: 'จัดซื้อ / สรรหาสินค้า',
      services: ['Merchandising Strategy','Product Sourcing','Vendor Management','Procurement Services','Buying Services','Product Development','Inventory Planning','Supplier Negotiation','Category Management','Retail Analytics'] },
    { name: 'Property / Real Estate', th: 'อสังหาริมทรัพย์',
      services: ['Property Management','Real Estate Consulting','Property Valuation','Real Estate Marketing','Facility Management','Property Development','Lease Management','Property Investment','Real Estate Technology','Building Maintenance'] },
    { name: 'Public Relations', th: 'ประชาสัมพันธ์',
      services: ['PR Strategy','Media Relations','Crisis Management','Corporate Communications','Press Release Writing','Reputation Management','Stakeholder Engagement','Event PR','Social Media PR','Influencer Relations'] },
    { name: 'Quality Assurance / Quality Control', th: 'ประกัน / ควบคุมคุณภาพ',
      services: ['Quality Management','QA Testing','Quality Audits','ISO Certification','Process Quality','Product Testing','Quality Documentation','Compliance Testing','Quality Training','Quality Systems'] },
    { name: 'Research & Development', th: 'วิจัยและพัฒนา',
      services: ['Product Research','Market Research','R&D Consulting','Innovation Management','Technical Research','Product Development','Research Analysis','Prototype Development','Technology Research','Scientific Research'] },
    { name: 'Retail / Wholesale', th: 'ค้าปลีก / ค้าส่ง',
      services: ['Retail Consulting','Store Operations','Store Registration System','POS System Implementation','Retail Marketing','Visual Merchandising','Retail Technology','Customer Experience','Sales Training','Inventory Management','Retail Analytics','E-commerce Solutions'] },
    { name: 'Safety / Security', th: 'ความปลอดภัย / รักษาความปลอดภัย',
      services: ['Safety Consulting','Security Services','Risk Assessment','Safety Training','Security Systems','Compliance Audits','Emergency Planning','Workplace Safety','Security Technology','Safety Management'] },
    { name: 'Sales', th: 'การขาย',
      services: ['Sales Strategy','Sales Training','Lead Generation','Sales Process Optimization','CRM Implementation','Sales Analytics','Channel Development','Sales Enablement','Account Management','Sales Consulting'] },
    { name: 'Sciences / Laboratory / R&D', th: 'วิทยาศาสตร์ / ห้องปฏิบัติการ / R&D',
      services: ['Laboratory Services','Scientific Research','Testing & Analysis','Lab Equipment','Quality Testing','Research Support','Data Analysis','Lab Management','Scientific Consulting','Clinical Trials'] },
    { name: 'Telecommunications', th: 'โทรคมนาคม',
      services: ['Telecom Consulting','Network Design','Telecom Infrastructure','VoIP Solutions','Network Security','Communication Systems','Telecom Technology','Network Optimization','Unified Communications','Telecom Support'] },
    { name: 'Tourism / Travel', th: 'ท่องเที่ยว',
      services: ['Travel Planning','Tour Operations','Tourism Marketing','Destination Management','Travel Technology','Tourism Consulting','Itinerary Planning','Travel Services','Tour Guide Services','Tourism Development'] },
    { name: 'Others', th: 'อื่นๆ',
      services: ['Business Consulting','Project Management','Translation Services','Customer Service','Sales Consulting','Quality Assurance','Supply Chain Management','Logistics Consulting','Training & Coaching'] },
  ];

  // Slugify helper for stable ids
  function slug(s) {
    return s.toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[\/]/g, '-')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Annotate with id, icon, color
  const INDUSTRIES_DATA = RAW.map((ind, i) => Object.assign({}, ind, {
    id: slug(ind.name),
    color: PALETTE[i % PALETTE.length],
    icon: BRIEFCASE_ICON,
  }));

  // Lookup helpers
  function getIndustryById(id) {
    return INDUSTRIES_DATA.find(i => i.id === id) || null;
  }
  function getIndustryByName(name) {
    return INDUSTRIES_DATA.find(i => i.name === name) || null;
  }

  // Flat services list — used by the broadcast search picker.
  // Each entry: { id, name, industryId, industryName, industryTh, color, icon }
  // NB: per-industry company counts must come from a real `SELECT COUNT(*)`
  // query in the production app — they are intentionally not seeded here.
  function getAllServices() {
    const flat = [];
    INDUSTRIES_DATA.forEach(ind => {
      ind.services.forEach((svc, j) => {
        flat.push({
          id: ind.id + '__' + slug(svc),
          name: svc,
          th: svc,                  // services are EN-only in the current schema
          industryId: ind.id,
          industryName: ind.name,
          industryTh: ind.th,
          industry: ind.id,         // alias for picker code
          color: ind.color,
          icon: ind.icon,
        });
      });
    });
    return flat;
  }

  function findService(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return [];
    return getAllServices().filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.industryName.toLowerCase().includes(q) ||
      s.industryTh.toLowerCase().includes(q)
    );
  }

  function getServicesByIndustry(industryId) {
    return getAllServices().filter(s => s.industryId === industryId);
  }

  window.INDUSTRIES_DATA = INDUSTRIES_DATA;
  window.getIndustryById = getIndustryById;
  window.getIndustryByName = getIndustryByName;
  window.getAllServices = getAllServices;
  window.getServicesByIndustry = getServicesByIndustry;
  window.findService = findService;
})();
