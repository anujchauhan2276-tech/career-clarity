// 60 High-Value, Advanced, and Entrepreneurial Premium Roadmaps (Available globally)
export const premiumRoadmaps: string[] = [
  // Advanced AI & Data
  "Large Language Model (LLM) Architect", "Prompt Engineering & AI Whisperer", "Chief AI Officer (CAIO)",
  "Ph.D. in Artificial Intelligence", "Generative AI Researcher", "Computer Vision Specialist",
  "NLP Engineer (Natural Language Processing)", "MLOps & AI Infrastructure Engineer", "Cognitive Computing Scientist",
  "Deepfake Detection & AI Security Analyst", "Ph.D. in Data Science", "Data Privacy Officer (DPO)",
  
  // Future Frontier Tech
  "Quantum Computing Engineer", "Brain-Computer Interface Engineer", "Digital Twin Simulation Architect",
  "Spatial Computing Developer (AR/VR)", "Space & Satellite Systems Engineer", "Neuromorphic Hardware Engineer",
  "6G Network Architect", "Autonomous Vehicle Systems Engineer", "Robotic Process Automation (RPA) Lead",
  "Cyber Warfare Specialist", "Zero Trust Architecture Consultant", "Chief Information Security Officer (CISO)",
  
  // High-Finance & Web3
  "Quantitative Finance Ph.D.", "High-Frequency Trading System Dev", "Algorithmic Trading Quant",
  "Crypto Tokenomics Designer", "DeFi Protocol Engineer", "Smart Contract Auditor",
  "Venture Capital Analyst", "Angel Investor / Syndicate Lead", "Search Fund Entrepreneur",
  "Web3/DAO Contributor", "Blockchain Solutions Architect", "FinTech Startup Founder",
  
  // Advanced Science & Niche Academia
  "Ph.D. in Bioinformatics", "Ph.D. in Synthetic Biology", "Ph.D. in Quantum Physics",
  "Ph.D. in Cryptography", "Ph.D. in Climate Science", "Postdoc in Nanotechnology",
  "Sustainable Energy Grid Architect", "Asteroid Mining Strategist", "Smart City Systems Architect",
  "Ph.D. in Economics", "Ph.D. in Sociology", "Ph.D. in Cognitive Psychology",
  
  // Executive & Entrepreneurship
  "Y-Combinator Startup Founder", "Solo Entrepreneur (Bootstrapped SaaS)", "Chief Technology Officer (CTO)",
  "Chief Product Officer (CPO)", "Chief Sustainability Officer (CSO)", "Fractional CMO",
  "Fractional CFO", "Growth Hacker / Head of Growth", "Corporate Innovation Lab Director",
  "HealthTech Innovator", "EdTech Founder", "E-commerce Empire Builder",
];

// 70 Regional Roadmaps per country (50 Traditional Free + 20 Bonus Free)
// ALL strings here must be strictly in English so the translation engine can hook into them!
export const countryRoadmaps: Record<string, string[]> = {
  us: [
    "Computer Science (B.S.)", "Software Engineering", "Data Science Roadmap", "Pre-Med Track", "Medical School (M.D./D.O.)", 
    "Pre-Law Track", "Law School (J.D.)", "MBA (Top 15)", "Nursing (BSN)", "Investment Banking Analyst", 
    "Management Consulting", "Accounting (CPA)", "Mechanical Engineering (B.S.)", "Electrical Engineering (B.S.)", "Civil Engineering (B.S.)", 
    "Chemical Engineering (B.S.)", "Aerospace Engineering (B.S.)", "Biomedical Engineering (B.S.)", "Cybersecurity Analyst", "Cloud Computing Engineer", 
    "DevOps Engineer Roadmap", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile App Developer", 
    "Game Development", "Artificial Intelligence Engineer", "Machine Learning Engineer", "Product Management", "Project Management (PMP)", 
    "Marketing (B.S.)", "Digital Marketing", "Sales Engineering", "Human Resources", "Supply Chain Management", 
    "Finance (B.S.)", "Economics (B.A./B.S.)", "Psychology (B.A./B.S.)", "Social Work (MSW)", "Education/Teaching Certification", 
    "Architecture (B.Arch)", "Graphic Design (B.F.A)", "Film & Television Production", "Journalism", "Public Relations", 
    "Pharmacy (Pharm.D)", "Dentistry (DDS/DMD)", "Veterinary Medicine (DVM)", "Information Technology (B.S.)", "Industrial Engineering",
    
    "UX/UI Design Bootcamp", "Coding Bootcamp Graduate", "Commercial Drone Pilot", "AR/VR Developer", "Smart City Planner", 
    "Genomics Technician", "Clean Energy Consultant", "Esports Management", "Content Creator / Influencer", "Podcast Producer", 
    "AgriTech Specialist", "FoodTech Innovator", "Biohacking Specialist", "Neurotechnology Researcher", "3D Printing Technician", 
    "Carbon Auditor", "Solar Panel Installation Engineer", "EV Mechanic & Infrastructure", "Indie Game Developer", "Digital Nomad Freelancer"
  ],
  in: [
    "B.Tech (Computer Science)", "M.Tech (Computer Science)", "BCA (Bachelor of Computer Applications)", "MCA (Master of Computer Applications)", "B.Sc (IT)", 
    "MBBS (Medicine)", "BDS (Dentistry)", "BAMS (Ayurveda)", "BHMS (Homeopathy)", "B.Pharma (Pharmacy)", 
    "Chartered Accountant (CA)", "Company Secretary (CS)", "Cost and Management Accountant (CMA)", "B.Com (Hons)", "MBA (IIMs/Top B-Schools)", 
    "Civil Services (UPSC IAS)", "Engineering Services (IES)", "State PSC Exams", "Banking Exams (IBPS PO/Clerk)", "SSC CGL", 
    "Law (BA LLB)", "LLM", "B.Arch (Architecture)", "B.Des (Design/NID)", "Mechanical Engineering (B.Tech)", 
    "Electrical & Electronics (B.Tech)", "Civil Engineering (B.Tech)", "Electronics & Comm (B.Tech)", "Data Science & AI (B.Tech)", "Full Stack Web Developer", 
    "Frontend Developer", "Backend Developer", "Cybersecurity Specialist", "Cloud Engineer (AWS/Azure)", "DevOps Engineer", 
    "Product Manager", "Digital Marketing", "Nursing (B.Sc Nursing)", "Agriculture (B.Sc Agri)", "Hotel Management (BHM)", 
    "Journalism & Mass Comm", "Fashion Design (NIFT)", "Commercial Pilot Training", "Merchant Navy", "Teacher Training (B.Ed)", 
    "Ph.D in India (CSIR NET/GATE)", "NDA/CDS (Armed Forces)", "RBI Grade B Officer", "SEBI Grade A Officer", "Chartered Financial Analyst (CFA)",
    
    "UX/UI Design", "Video Editing & VFX", "EV Battery Engineering", "Solar Installation & Tech", "Esports Athlete", 
    "AgriTech Innovator", "FinTech Developer", "Freelance Content Writing", "Cloud Kitchen Owner", "EdTech Tutor", 
    "D2C Brand Founder", "Regional YouTube Creator", "Web3 Auditing", "AI Data Annotator", "Fitness Trainer & Dietician", 
    "Indie Game Developer", "Wedding Cinematography", "Digital Creator (Instagram/Moj)", "Rural Tech Innovator", "Drone Technology Operator"
  ],
  uk: [
    "Computer Science (BSc)", "Software Engineering (BSc)", "Data Science (BSc/MSc)", "Medicine (MBChB/MBBS)", "Law (LLB)", 
    "Legal Practice Course (LPC/SQE)", "Bar Course (BPTC)", "Business Management (BSc)", "MBA (AMBA Accredited)", "Finance & Accounting (BSc)", 
    "Nursing (BSc)", "Mechanical Engineering (BSc/MEng)", "Electrical Engineering (BSc/MEng)", "Civil Engineering (BSc/MEng)", "Aerospace Eng (MEng)", 
    "Architecture (RIBA 1-3)", "Psychology (BSc)", "Pharmacy (MPharm)", "Dentistry (BDS)", "Veterinary Science (BVSc)", 
    "Economics (BSc)", "Politics, Philosophy, & Econ (PPE)", "History (BA)", "English Literature (BA)", "Frontend Developer", 
    "Backend Developer", "Full Stack Developer", "Cloud Computing", "Cybersecurity", "DevOps Engineering", 
    "Artificial Intelligence", "Machine Learning", "Product Management", "Investment Banking", "Management Consulting", 
    "Accounting (ACA/ACCA/CIMA)", "Supply Chain Management", "Human Resources (CIPD)", "Marketing (CIM)", "Social Work (BA/MA)", 
    "Teaching (PGCE)", "Graphic Design (BA)", "Film Production (BA)", "Journalism (NCTJ)", "Public Relations", 
    "Biomedical Sciences (BSc)", "Physiotherapy (BSc)", "Paramedic Science (BSc)", "Quantity Surveying (BSc)", "Actuarial Science",
    
    "UX/UI Design", "FinTech Innovator", "Sustainable Fashion Designer", "Green Energy Tech", "Brewmaster / Distiller", 
    "AR/VR Experience Design", "Ethical Hacking", "E-commerce Specialist", "Music Production", "App Dev Bootcamp", 
    "AI Implementation Consultant", "Data Privacy Officer", "HealthTech Consultant", "Esports Management", "3D Animation", 
    "Carbon Footprint Assessor", "Smart Farming", "Urban Tech Planner", "Maritime Tech Engineer", "Offshore Wind Technician"
  ],
  jp: [
    "Computer Science (Rikkei)", "IT/Web Development (Bootcamps)", "Engineering (Mechanical/Electrical)", "Architecture & Design", "Medicine (Igakubu)", 
    "Dentistry (Shigakubu)", "Pharmacy (Yakugakubu)", "Law (Hogakubu) & Bar Exam", "Economics & Business (Bunkei)", "MBA (Japan/Global)", 
    "Accounting (JICPA)", "Tax Accountant (Zeirishi)", "Civil Service (Kokka Koumuin)", "Local Gov (Chihou Koumuin)", "Teaching (Kyouin Menkyo)", 
    "Nursing (Kango)", "Data Science & AI", "Cybersecurity Specialist", "Cloud Architect (AWS)", "DevOps Engineer", 
    "Frontend Developer", "Backend Developer", "Full Stack Developer", "Game Development (Console/Mobile)", "UX/UI Design", 
    "Product Management", "Digital Marketing", "Sales & Business Development", "Human Resources", "Supply Chain Management", 
    "Finance & Investment Banking", "Management Consulting", "Psychology", "Social Work", "Agriculture", 
    "Veterinary Medicine", "Biomedical Sciences", "Physics & Mathematics", "Chemistry & Materials Science", "Robotics Engineering", 
    "Aerospace Engineering", "Automotive Engineering", "Electronics Engineering", "Linguistics & Translation", "International Relations", 
    "Media & Communications", "Journalism", "Graphic & Anime Design", "Film & Broadcast", "Hospitality Management",
    
    "Nintendo/PS5 Game Designer", "VTuber / Virtual Idol", "Manga Artist (Mangaka)", "Animation Production Assistant", "Green Tech Engineer", 
    "ElderTech / CareTech Innovator", "Smart City Dev", "FinTech Solutions", "AR/VR Metaverse", "Esports Professional", 
    "Web3 / Blockchain Dev", "Sake Brewing / AgriTech", "Cross-border E-commerce", "Freelance Localization", "Voice Acting (Seiyuu)", 
    "IoT Developer", "Local Tourism Promoter", "Disaster Prevention Tech", "AI Automation Specialist", "Robot Maintenance Technician"
  ],
  cn: [
    "Computer Science and Technology", "Software Engineering", "Artificial Intelligence", "Data Science & Big Data Tech", "Cyber Security", 
    "Clinical Medicine (MBBS equivalent)", "Traditional Chinese Medicine (TCM)", "Dentistry (Stomatology)", "Pharmacy", "Law (LLB & Judicial Exam)", 
    "Economics", "Finance", "Accounting (CPA China)", "Business Administration (BBA)", "MBA (Domestic & International)", 
    "Mechanical Engineering", "Electrical Engineering & Automation", "Civil Engineering", "Aerospace Engineering", "Chemical Engineering", 
    "Electronic Information Eng", "Materials Science and Engineering", "Architecture", "Urban Planning", "National Civil Service (Guokao)", 
    "Provincial Civil Service (Shengkao)", "Teaching (Teacher Qualification Cert)", "Nursing", "Frontend Development", "Backend Development", 
    "Full Stack Development", "Mobile Dev (HarmonyOS/iOS/Android)", "Game Development", "Cloud Computing (Alibaba/Tencent)", "DevOps & SRE", 
    "Product Management", "Digital Marketing & E-commerce", "Operations Management", "Human Resources", "Supply Chain & Logistics", 
    "Investment Banking", "Management Consulting", "Psychology", "Social Work", "Agriculture & Agronomy", 
    "Veterinary Medicine", "Journalism & Communication", "Broadcasting & Hosting", "Animation & Digital Media Art", "Industrial Design",
    
    "Live Streaming & E-commerce Host", "Short Video Content Creator", "EV & Battery Tech Engineer", "High-Speed Rail Engineering", "Semiconductor Technician", 
    "Smart Manufacturing Expert", "Cross-border E-commerce", "Green Energy Auditor", "Rural E-commerce Entrepreneur", "Digital Currency / FinTech", 
    "AI Data Annotator", "Commercial Drone Pilot", "Metaverse / XR Developer", "Esports Professional", "EdTech Tutor", 
    "HealthTech Systems", "Elderly Care Tech", "IoT Smart Home Architect", "Autonomous Driving Test Engineer", "Pet Care & Tech Services"
  ],
  kr: [
    "Computer Science & Engineering", "Software (SW) Engineering", "Artificial Intelligence", "Data Science", "Information Security", 
    "Medicine (Pre-med/Medical School)", "Dentistry", "Pharmacy", "Traditional Korean Medicine", "Korean Bar Exam (Law School)", 
    "Business Administration (BBA)", "Economics", "Finance & Accounting", "Certified Public Accountant (KICPA)", "MBA", 
    "Mechanical Engineering", "Electrical & Electronic Engineering", "Civil & Environmental Engineering", "Chemical Engineering", "Materials Science", 
    "Architecture", "Civil Service Exam (Grade 5)", "Civil Service Exam (Grade 7/9)", "Teaching (Imyong Exam)", "Nursing", 
    "Frontend Developer", "Backend Developer", "Full Stack Developer", "Game Developer (Nexon/NCSoft)", "Cloud Engineer (AWS/GCP)", 
    "DevOps Engineer", "UX/UI Designer", "Product Manager (PM/PO)", "Digital Marketing", "E-commerce & Retail Management", 
    "Human Resources", "Supply Chain & Logistics", "Investment Banking", "Management Consulting", "Psychology", 
    "Social Welfare", "Public Administration", "International Relations", "Media & Communication", "Journalism", 
    "Visual/Industrial Design", "Film & Theater", "K-Pop/Entertainment Management", "Aviation & Flight Operations", "Biotechnology & Life Sciences",
    
    "Webtoon Creator / Illustrator", "K-Beauty Formulator & Tech", "Esports Pro / Coach", "Metaverse Developer", "Secondary Battery Technology", 
    "Smart Farm Developer", "FinTech Innovator", "Web Novel Writer", "Entertainment Content Producer", "Freelance Video Editor", 
    "AI Prompt Engineer", "Virtual Human Creator", "Cloud Kitchen Entrepreneur", "Blockchain Developer", "Pet Economy Services", 
    "D2C Fashion Entrepreneur", "Urban Air Mobility (UAM) Eng", "Elderly Care Tech", "Digital Healthcare", "Drone Mapping Specialist"
  ],
  de: [
    "Computer Science (B.Sc./M.Sc.)", "Business Informatics", "Data Science & AI", "Medicine (State Exam)", "Dentistry", 
    "Pharmacy", "Law (1st & 2nd State Exam)", "Business Administration (BWL)", "Economics (VWL)", "MBA", 
    "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Industrial Engineering", "Architecture", 
    "Teaching (State Exam/M.Ed.)", "Nursing Science", "IT Specialist Application Development", "IT Specialist System Integration", "Software Engineering", 
    "Frontend Web Developer", "Backend Web Developer", "Full Stack Web Developer", "Cloud Computing & DevOps", "IT-Security / Cybersecurity", 
    "Product Management", "Digital Marketing", "Sales & Key Account Management", "Human Resources Management", "Supply Chain Management", 
    "Finance & Investment Banking", "Management Consulting", "Tax Consultant (Steuerberater)", "Auditor (Wirtschaftsprüfer)", "Psychology (B.Sc./M.Sc.)", 
    "Social Work (B.A.)", "Journalism", "Communication Science", "Graphic Communication Design", "Biology / Biotechnology", 
    "Chemistry", "Physics", "Mechatronics", "Aerospace Engineering", "Automotive Engineering", 
    "Renewable Energies", "Agricultural Sciences", "Veterinary Medicine", "Physiotherapy", "Logistics & Transport",
    
    "Dual Studies (Tech/Biz)", "Industry 4.0 Integrator", "Green Hydrogen Tech", "EV Infrastructure Engineer", "Smart Grid Manager", 
    "Privacy & GDPR Officer", "UX/UI Bootcamp", "Indie Game Developer", "FinTech Developer", "DeepTech Startup Founder", 
    "AI Ethics Consultant", "Sustainable Agriculture", "Craft Brewing / Wine Business", "E-commerce Specialist", "Ethical Hacker", 
    "Sound Engineering", "3D Printing Technician", "HealthTech App Dev", "E-mobility Urban Planner", "Carbon Trader"
  ],
  es: [
    "Computer Engineering", "Software Development", "Data Science & AI", "Cybersecurity", "Telecommunications Engineering", 
    "Medicine (MIR)", "Dentistry", "Pharmacy", "Law (Degree + Masters)", "Judiciary/Prosecution Exams", 
    "Business Administration", "Economics", "Finance and Accounting", "MBA", "Mechanical Engineering", 
    "Electrical/Electronic Engineering", "Civil Engineering", "Industrial Engineering", "Architecture", "Nursing (EIR)", 
    "Teaching Exams", "Professorship Exams", "Civil Service Exams", "Physiotherapy", "Psychology (PIR)", 
    "Social Work", "Frontend Web Development", "Backend Web Development", "Full Stack Developer", "Cross-Platform App Dev (DAM)", 
    "Web App Development (DAW)", "DevOps & Cloud Engineering", "UX/UI Design", "Product Management", "Digital Marketing", 
    "Human Resources", "International Trade", "Logistics and Supply Chain", "Investment Banking", "Strategy Consulting", 
    "Journalism and Communication", "Fine Arts and Graphic Design", "Tourism and Hotel Management", "Biology and Biotechnology", "Chemistry", 
    "Environmental Sciences", "Veterinary Medicine", "Sports Science (INEF)", "Criminology", "Gastronomy and Culinary Arts",
    
    "Dual VET in Technology", "Renewable Energy Tech", "Indie Game Developer", "Esports Management", "Agrotech / Smart Farming", 
    "FinTech Developer", "Blockchain & Web3", "Content Creator / Streamer", "Rural Tourism Entrepreneur", "Smart City Planner", 
    "Cybersecurity Analyst", "Electric Vehicle Technician", "E-commerce & Dropshipping", "Water Management Tech", "App Dev Bootcamp", 
    "AI Prompt Engineer", "Digital Nomad / Freelancer", "Sustainable Fashion Designer", "HealthTech Innovator", "Neurotech Researcher"
  ],
  fr: [
    "Computer Science (License/Master)", "IT Professions Degree", "Computer Engineering Degree", "Data Science & AI", "Cybersecurity", 
    "Medicine (PASS/L.AS -> ECN)", "Dentistry", "Pharmacy", "Law (CRFPA/ENM)", "Certified Accountant (DCG/DSCG)", 
    "Business School (PGE)", "MBA", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", 
    "Architecture (ENSA)", "Nursing (IFSI)", "Teaching (CRPE / CAPES)", "Civil Service Exams", "Frontend Web Developer", 
    "Backend Web Developer", "Full Stack Developer", "Cloud & DevOps Engineer", "Product Manager", "Product Owner", 
    "Digital Marketing", "Human Resources", "Logistics and Supply Chain", "Investment Banking", "Management Consulting", 
    "Psychology", "Social Work (ASS, ES, CESF)", "Journalism", "Communication & PR", "Graphic Design", 
    "Audiovisual Professions", "Biology & Biotechnology", "Chemistry", "Environmental Sciences", "Veterinary Medicine (ENV)", 
    "Physiotherapy (IFMK)", "Osteopathy", "Sports Science (STAPS)", "Tourism and Hospitality", "Gastronomy / Culinary Arts", 
    "Aeronautics and Space", "Agronomy & Food Industry", "Materials Engineering", "Financial Engineering", "Applied Mathematics",
    
    "Work-Study in Development", "E-sport & Gaming", "Fashion Tech", "Perfume / Wine Business", "Green Tech & Climate", 
    "Nuclear Energy Tech", "Smart Transport", "FinTech / InsurTech", "Web3 / Crypto Developer", "AI Integrator", 
    "Coding Bootcamp", "Content Creator", "E-commerce / Shopify", "Craftsmanship / Luxury 2.0", "AgriTech Innovator", 
    "Bio-Hacking / Health", "UX/UI Design", "Cybersecurity Bootcamp", "Drone Operator", "Eco-construction"
  ],
  ru: [
    "Fundamental Computer Science", "Software Engineering", "Data Science & AI", "Information Security", "System Administration", 
    "General Medicine", "Dentistry", "Pharmacy", "Jurisprudence (Law)", "Economics", 
    "Finance and Credit", "Accounting", "Management", "MBA", "Mechanical Engineering", 
    "Power Engineering", "Civil Engineering", "Architecture", "Oil and Gas Engineering", "Nuclear Physics", 
    "Nursing", "Pedagogical Education (Teaching)", "Frontend Developer", "Backend Developer", "Full Stack Developer", 
    "1C Developer", "Software Testing (QA)", "DevOps & Cloud", "UX/UI Designer", "Product Management", 
    "Internet Marketing", "Human Resources (HR)", "Logistics", "Investment Banking", "Management Consulting", 
    "Psychology", "Sociology", "Journalism", "Advertising and PR", "General Design", 
    "Biotechnology", "Chemistry", "Physics", "Mathematics", "Veterinary Medicine", 
    "Tourism and Hospitality", "Linguistics and Translation", "Customs Affairs", "Public Administration", "Aviation Engineering",
    
    "GameDev (Unity/Unreal)", "Esports Professional", "Crypto & Blockchain Dev", "AI Data Annotator", "Telegram/VK Content Creator", 
    "E-commerce Specialist", "EdTech Startup Founder", "FinTech Developer", "AgriTech Specialist", "Cybersecurity (Bug Bounty)", 
    "Drone Engineering/Op", "Space Tech & Analytics", "Arctic Tech Engineer", "Import-Substitution Tech", "AR/VR Developer", 
    "Indie Hacker", "HealthTech App Dev", "Smart City Infrastructure", "Green Tech (Local)", "Custom Software Dev Firm"
  ]
};