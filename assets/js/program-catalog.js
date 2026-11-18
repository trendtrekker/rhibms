(function () {
  const groups = [];
  function add(category, label, qualification, years, subjects, level = 'undergraduate') {
    let group = groups.find(entry => entry.category === category && entry.label === label);
    if (!group) {
      group = { category, label, level, programs: [] };
      groups.push(group);
    }
    group.programs.push(...subjects.split('|').map(subject => ({
      name: [qualification, subject].filter(Boolean).join(' '), years
    })));
  }

  const civil = 'Topography|Civil Engineering Technology|Sanitary Installation and Plumbing|Urban Planning|Geotechnics|Building Service Technology|Wood Work';
  const managementCore = 'Accounting|Marketing|Project Management|Human Resource Management|Banking & Finance|Logistics & Transport Management|Assistant Manager';
  const managementOther = 'Public Service and Administration|Statistics|Port Shipping Management|Event Management|Operation of Air Transport|Quality Management|Local Government Management|Management of NGOs';

  add('health', 'Biomedical programmes', 'HND', 3, 'Nursing|Lab Science|Midwifery|Nutrition & Dietetics|Physiotherapy|Health Care Management|Dental Therapy|Pharmacy Technology|Sonography');
  add('health', 'Biomedical direct entry', 'Direct BSc', 4, 'Nursing|Midwifery|Lab Technology|Nursing / Midwifery|Pharmacy Technology');
  add('health', 'Biomedical top-up', 'BSc Top-up', 1, 'Nursing|Medical Lab|Midwifery|Nutrition & Dietetics|Pharmacy Technology');
  add('engineering', 'Civil engineering', 'HND', 2, civil);
  add('engineering', 'Civil engineering top-up', 'BSc Top-up', 1, civil);
  add('tourism', 'Tourism and hotel management', 'HND', 2, 'Tourism and Travel Agency Management|Hotel Management & Catering');
  add('agriculture', 'Agriculture and food sciences', 'HND', 2, 'Agriculture Production Technology|Agro Pastoral Adviser|Agro Pastoral Entrepreneurship|Food Technology|Animal Production Technology|Crop Production Technology|Food and Animal Production');
  add('agriculture', 'Agriculture top-up', 'BTech/BSc Top-up', 1, 'Agriculture Production Technology|Crop Production|Animal Production|Food Technology|Agro Pastoral Entrepreneurship|Agro Pastoral Adviser');
  add('education', 'Arts and education', 'HND', 2, 'Curriculum Development & Teaching CST|Education Management & Administration|Special Education|Didactics');
  add('education', 'Education top-up', 'BEd Top-up', 1, 'Clinical Psychology|Educational Leadership Management|Special & Inclusive Education|Science of Education|Clinical Mental Health|Psychology');
  add('health', 'Biomedical conversion', 'BSc Conversion', 1, 'Nutrition & Dietetics');
  add('health', 'Ministry of Public Health / Concours', '', 3, 'SRN Nursing');
  add('health', 'Ministry of Public Health / Concours', '', 1, 'Nursing Assistant');
  add('health', 'Biomedical & health sciences (Master\'s & Postgraduate)', 'MSc in', 2, 'Midwifery|Public Health (MPH)|Medico-Surgical Nursing|Pharmacology|Chemical Pathology', 'postgraduate');
  add('health', 'Biomedical & health sciences (Master\'s & Postgraduate)', 'MSc', 2, 'Nursing Education', 'postgraduate');
  add('health', 'Biomedical & health sciences (Master\'s & Postgraduate)', 'Masters in', 2, 'Pediatrics|Mental Health|Clinical Psychology', 'postgraduate');
  add('health', 'Biomedical & health sciences (Master\'s & Postgraduate)', 'MSc in', 1, 'Medical Microbiology & Parasitology', 'postgraduate');
  add('health', 'Biomedical & health sciences (Master\'s & Postgraduate)', 'Post Graduate Diploma in', 1, 'Midwifery', 'postgraduate');

  add('management', 'Management sciences', 'HND', 2, managementCore + '|' + managementOther);
  add('management', 'Management sciences direct entry', 'Direct BSc', 3, managementCore);
  add('management', 'Management sciences top-up', 'BSc Top-up', 1, 'Accounting|Marketing|Management|Project Management|Human Resource Management|Banking & Finance|Logistics and Transport|Assistant Manager|' + managementOther);
  add('management', 'Management & business (Master\'s & MBA)', 'Masters in', 2, 'Business Administration (MBA)', 'postgraduate');
  add('management', 'Management & business (Master\'s & MBA)', 'MSc in', 2, 'Accounting|Banking & Finance|Project Management|Human Resource Management|Logistics & Supply Chain Management', 'postgraduate');
  add('legal', 'Legal career', 'HND', 2, 'Legal Assistant|Business Law');
  add('engineering', 'Computer engineering', 'HND', 2, 'Software Engineering|Computer Science & Networks|Database Management|Hardware Maintenance|Computer Graphics & Web Design|E-Commerce & Digital Marketing|Industrial Computing & Automation|Telecommunication|Electronics|Electrical Power System|Electrotechnics');
  add('engineering', 'Computer engineering top-up', 'BSc Top-up', 1, 'Software Engineering|E-Commerce and Digital Marketing|Database Management|Electronics|Electrotechnics|Electrical Power System|Networks and System Maintenance|Computer Graphics & Web Design|Information Technology & Security|Computer Network & Security');
  add('engineering', 'Engineering & technology (Master\'s)', 'MSc in', 2, 'Information & Cyber Security|Computer Software Engineering', 'postgraduate');
  add('home-economics', 'Home economics and social work', 'HND', 2, 'Bakery & Food Processing|Fashion, Clothing & Textile');
  add('home-economics', 'Home economics and social work top-up', 'BSc Top-up', 1, 'Bakery & Food Processing|Fashion, Clothing & Textile|Hotel Management & Catering');
  add('home-economics', 'Home economics and social work top-up', 'BTech Top-up', 1, 'Fashion, Clothing & Textile');
  add('communication', 'Communication', 'HND', 2, 'Journalism|Corporate Communication');

  if (typeof module !== 'undefined' && module.exports) module.exports = groups;
  else window.rhibmsPrograms = groups;
})();
