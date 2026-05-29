export interface Industry {
  id: string;
  name: string;
  th: string;
  services: string[];
  color: string;
}

const PALETTE = [
  'linear-gradient(135deg,#0F6F73,#1A9DA3)',
  'linear-gradient(135deg,#22262F,#444B5A)',
  'linear-gradient(135deg,#F77F00,#E06B00)',
  'linear-gradient(135deg,#2BBEC5,#0F6F73)',
  'linear-gradient(135deg,#1A9DA3,#2BBEC5)',
  'linear-gradient(135deg,#444B5A,#22262F)',
  'linear-gradient(135deg,#0F6F73,#22262F)',
  'linear-gradient(135deg,#E06B00,#F77F00)',
];

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
    services: ['Brand Identity Design','Logo Design','UI/UX Design','Graphic Design','Print Design','Packaging Design','Motion Graphics','Video Production','Photography','Illustration'] },
  { name: 'Education / Training', th: 'การศึกษา / ฝึกอบรม',
    services: ['Corporate Training','E-Learning Development','Curriculum Design','Leadership Training','Sales Training','Language Training','Technical Skills Training','Coaching & Mentoring','Certification Programs','Workshop Facilitation'] },
  { name: 'Engineering', th: 'วิศวกรรม',
    services: ['Mechanical Engineering','Electrical Engineering','Civil Engineering','Structural Engineering','Industrial Engineering','Environmental Engineering','Quality Engineering','Project Management','Technical Consulting','Systems Engineering'] },
  { name: 'Entertainment / Events', th: 'บันเทิง / จัดงาน',
    services: ['Event Planning','Event Management','Corporate Events','Product Launches','Exhibition Management','Entertainment Production','Artist Management','Event Technology','Venue Sourcing','Catering Management'] },
  { name: 'Food / Beverages', th: 'อาหาร / เครื่องดื่ม',
    services: ['Food Production Consulting','Restaurant Management','Menu Development','Food Safety Consulting','HACCP Implementation','Supply Chain Management','Franchise Consulting','Food Marketing','Recipe Development','Nutritional Consulting'] },
  { name: 'Healthcare / Medical', th: 'สุขภาพ / การแพทย์',
    services: ['Healthcare Consulting','Medical Equipment Supply','Telemedicine Solutions','Health IT Systems','Clinical Research','Medical Training','Pharmacy Management','Hospital Administration','Health Insurance Consulting','Wellness Programs'] },
  { name: 'HR / Recruitment', th: 'HR / สรรหาบุคลากร',
    services: ['Recruitment Services','Executive Search','HR Consulting','Payroll Outsourcing','Employee Training','Performance Management','HR Software Implementation','Compensation & Benefits','Organizational Design','Talent Management'] },
  { name: 'Insurance', th: 'ประกันภัย',
    services: ['General Insurance','Life Insurance Consulting','Corporate Insurance','Risk Assessment','Claims Management','Insurance Broking','Liability Coverage','Property Insurance','Health Insurance','Marine Insurance'] },
  { name: 'Legal / Law', th: 'กฎหมาย',
    services: ['Corporate Law','Contract Review','IP & Trademark','M&A Advisory','Compliance Consulting','Employment Law','Tax Law','Litigation Support','Real Estate Law','Immigration Law'] },
  { name: 'Logistics / Supply Chain', th: 'โลจิสติกส์ / ซัพพลายเชน',
    services: ['Freight Forwarding','Customs Clearance','Warehouse Management','3PL Services','Supply Chain Consulting','Last-Mile Delivery','Import/Export Management','Fleet Management','Inventory Optimization','Cold Chain Logistics'] },
  { name: 'Manufacturing', th: 'การผลิต',
    services: ['Production Management','Quality Control','Manufacturing Consulting','Process Optimization','Lean Manufacturing','Factory Setup','Production Planning','Equipment Maintenance','ISO Certification','Industrial Safety'] },
  { name: 'Media / Publishing', th: 'สื่อ / การพิมพ์',
    services: ['Content Creation','Copywriting','Editorial Services','Publishing Consulting','Social Media Management','Video Production','Podcast Production','Digital Publishing','Press Release Writing','Content Strategy'] },
  { name: 'Property / Real Estate', th: 'อสังหาริมทรัพย์',
    services: ['Property Management','Real Estate Consulting','Valuation Services','Leasing Services','Property Development','Investment Advisory','Property Marketing','Facilities Management','Building Inspection','Interior Fit-out'] },
  { name: 'Retail / E-Commerce', th: 'ค้าปลีก / อีคอมเมิร์ซ',
    services: ['E-Commerce Setup','Marketplace Management','Retail Consulting','Inventory Management','Store Design','POS Systems','Product Photography','Customer Experience','Loyalty Programs','Omni-channel Strategy'] },
  { name: 'Science / Research', th: 'วิทยาศาสตร์ / การวิจัย',
    services: ['Market Research','Data Analysis','Scientific Research','R&D Consulting','Lab Testing','Environmental Assessment','Product Testing','Survey Research','Feasibility Studies','Impact Assessment'] },
  { name: 'Security', th: 'รักษาความปลอดภัย',
    services: ['Security Consulting','Physical Security','Cybersecurity','CCTV Installation','Access Control','Security Training','Risk Assessment','Executive Protection','Event Security','Guard Services'] },
  { name: 'Social Enterprise / NGO', th: 'กิจการเพื่อสังคม / NGO',
    services: ['Social Impact Consulting','Grant Writing','Fundraising Strategy','Impact Measurement','Community Development','CSR Consulting','Non-profit Management','Volunteer Management','Stakeholder Engagement','Sustainability Reporting'] },
  { name: 'Telecommunications', th: 'โทรคมนาคม',
    services: ['Network Solutions','Telecom Consulting','VoIP Services','Cloud Communications','Unified Communications','Network Security','IoT Solutions','Fiber Optic Installation','Data Center Solutions','Bandwidth Optimization'] },
  { name: 'Tourism / Hospitality', th: 'การท่องเที่ยว / โรงแรม',
    services: ['Hotel Management Consulting','Tourism Marketing','Travel Technology','Revenue Management','Guest Experience Design','F&B Consulting','Spa & Wellness','Event Planning','Tourism Policy','Property Development'] },
  { name: 'Translation / Interpretation', th: 'แปลภาษา / ล่าม',
    services: ['Document Translation','Legal Translation','Technical Translation','Website Localization','Interpretation Services','Subtitling','Transcription','Certified Translation','Proofreading','DTP Services'] },
];

export const INDUSTRIES: Industry[] = RAW.map((item, i) => ({
  id: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name: item.name,
  th: item.th,
  services: item.services,
  color: PALETTE[i % PALETTE.length],
}));

export const ALL_SERVICES = INDUSTRIES.flatMap((ind) =>
  ind.services.map((s) => ({ service: s, industry: ind.name, industryTh: ind.th }))
);

export function searchServices(query: string, limit = 8) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return ALL_SERVICES
    .filter((s) => s.service.toLowerCase().includes(q) || s.industry.toLowerCase().includes(q))
    .slice(0, limit);
}
