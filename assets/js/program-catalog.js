(function () {
  const groups = [];
  function add(category, label, qualification, years, subjects, level = 'hnd') {
    let group = groups.find(entry => entry.category === category && entry.label === label);
    if (!group) {
      group = { category, label, level, programs: [] };
      groups.push(group);
    }
    group.programs.push(...subjects.split('|').map(subject => ({
      name: [qualification, subject].filter(Boolean).join(' '), years, level
    })));
  }

  const civil = 'Topography|Civil Engineering Technology|Sanitary Installation and Plumbing|Urban Planning|Geotechnics|Building Service Technology|Wood Work';
  const managementCore = 'Accounting|Marketing|Project Management|Human Resource Management|Banking & Finance|Logistics & Transport Management|Assistant Manager';
  const managementOther = 'Public Service and Administration|Statistics|Port Shipping Management|Event Management|Operation of Air Transport|Quality Management|Local Government Management|Management of NGOs';

  // --- 1. HIGHER NATIONAL DIPLOMA (HND) & DIPLOMA PROGRAMMES (level: 'hnd') ---
  add('health', 'Biomedical programmes (HND)', 'HND', 3, 'Nursing|Lab Science|Midwifery|Nutrition & Dietetics|Physiotherapy|Health Care Management|Dental Therapy|Pharmacy Technology|Sonography', 'hnd');
  add('health', 'Ministry of Public Health / Concours', '', 3, 'SRN Nursing', 'hnd');
  add('health', 'Ministry of Public Health / Concours', '', 1, 'Nursing Assistant', 'hnd');
  add('engineering', 'Civil engineering (HND)', 'HND', 2, civil, 'hnd');
  add('engineering', 'Computer engineering (HND)', 'HND', 2, 'Software Engineering|Computer Science & Networks|Database Management|Hardware Maintenance|Computer Graphics & Web Design|E-Commerce & Digital Marketing|Industrial Computing & Automation|Telecommunication|Electronics|Electrical Power System|Electrotechnics', 'hnd');
  add('management', 'Management sciences (HND)', 'HND', 2, managementCore + '|' + managementOther, 'hnd');
  add('agriculture', 'Agriculture and food sciences (HND)', 'HND', 2, 'Agriculture Production Technology|Agro Pastoral Adviser|Agro Pastoral Entrepreneurship|Food Technology|Animal Production Technology|Crop Production Technology|Food and Animal Production', 'hnd');
  add('tourism', 'Tourism and hotel management (HND)', 'HND', 2, 'Tourism and Travel Agency Management|Hotel Management & Catering', 'hnd');
  add('education', 'Arts and education (HND)', 'HND', 2, 'Curriculum Development & Teaching CST|Education Management & Administration|Special Education|Didactics', 'hnd');
  add('legal', 'Legal career (HND)', 'HND', 2, 'Legal Assistant|Business Law', 'hnd');
  add('home-economics', 'Home economics and social work (HND)', 'HND', 2, 'Bakery & Food Processing|Fashion, Clothing & Textile', 'hnd');
  add('communication', 'Communication (HND)', 'HND', 2, 'Journalism|Corporate Communication', 'hnd');

  // --- 2. BACHELOR\'S DEGREE PROGRAMMES (Direct BSc, Top-Up & Conversion - level: 'bsc') ---
  add('health', 'Biomedical direct entry (BSc)', 'Direct BSc', 4, 'Nursing|Midwifery|Lab Technology|Nursing / Midwifery|Pharmacy Technology', 'bsc');
  add('health', 'Biomedical top-up (BSc)', 'BSc Top-up', 1, 'Nursing|Medical Lab|Midwifery|Nutrition & Dietetics|Pharmacy Technology', 'bsc');
  add('health', 'Biomedical conversion (BSc)', 'BSc Conversion', 1, 'Nutrition & Dietetics', 'bsc');
  add('engineering', 'Civil engineering top-up (BSc)', 'BSc Top-up', 1, civil, 'bsc');
  add('engineering', 'Computer engineering top-up (BSc)', 'BSc Top-up', 1, 'Software Engineering|E-Commerce and Digital Marketing|Database Management|Electronics|Electrotechnics|Electrical Power System|Networks and System Maintenance|Computer Graphics & Web Design|Information Technology & Security|Computer Network & Security', 'bsc');
  add('management', 'Management sciences direct entry (BSc)', 'Direct BSc', 3, managementCore, 'bsc');
  add('management', 'Management sciences top-up (BSc)', 'BSc Top-up', 1, 'Accounting|Marketing|Management|Project Management|Human Resource Management|Banking & Finance|Logistics and Transport|Assistant Manager|' + managementOther, 'bsc');
  add('agriculture', 'Agriculture top-up (BTech/BSc)', 'BTech/BSc Top-up', 1, 'Agriculture Production Technology|Crop Production|Animal Production|Food Technology|Agro Pastoral Entrepreneurship|Agro Pastoral Adviser', 'bsc');
  add('education', 'Education top-up (BEd)', 'BEd Top-up', 1, 'Clinical Psychology|Educational Leadership Management|Special & Inclusive Education|Science of Education|Clinical Mental Health|Psychology', 'bsc');
  add('home-economics', 'Home economics top-up (BSc/BTech)', 'BSc Top-up', 1, 'Bakery & Food Processing|Fashion, Clothing & Textile|Hotel Management & Catering', 'bsc');
  add('home-economics', 'Home economics top-up (BTech)', 'BTech Top-up', 1, 'Fashion, Clothing & Textile', 'bsc');

  // --- 3. MASTER\'S & POSTGRADUATE PROGRAMMES (MSc, MBA, PGD - level: 'masters') ---
  add('health', 'Biomedical & health sciences (Master\'s & Postgraduate)', 'MSc in', 2, 'Midwifery|Public Health (MPH)|Medico-Surgical Nursing|Pharmacology|Chemical Pathology', 'masters');
  add('health', 'Biomedical & health sciences (Master\'s & Postgraduate)', 'MSc', 2, 'Nursing Education', 'masters');
  add('health', 'Biomedical & health sciences (Master\'s & Postgraduate)', 'Masters in', 2, 'Pediatrics|Mental Health|Clinical Psychology', 'masters');
  add('health', 'Biomedical & health sciences (Master\'s & Postgraduate)', 'MSc in', 1, 'Medical Microbiology & Parasitology', 'masters');
  add('health', 'Biomedical & health sciences (Master\'s & Postgraduate)', 'Post Graduate Diploma in', 1, 'Midwifery', 'masters');

  add('management', 'Management & business (Master\'s & MBA)', 'Masters in', 2, 'Business Administration (MBA)', 'masters');
  add('management', 'Management & business (Master\'s & MBA)', 'MSc in', 2, 'Accounting|Banking & Finance|Project Management|Human Resource Management|Logistics & Supply Chain Management', 'masters');

  add('engineering', 'Engineering & technology (Master\'s)', 'MSc in', 2, 'Information & Cyber Security|Computer Software Engineering', 'masters');

  if (typeof module !== 'undefined' && module.exports) module.exports = groups;
  else window.rhibmsPrograms = groups;
})();
