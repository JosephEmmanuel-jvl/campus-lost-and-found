// Fictional development fixtures only. Never used to authenticate public signups.
const MOCK_CAMPUS_DATABASE = [
  { university_id: 'DEMO-ADMIN-001', first_name: 'Demo', last_name: 'Administrator', email: 'demo.admin@example.com', contact_number: null, role: 'Admin' },
  { university_id: 'DEMO-STAFF-001', first_name: 'Demo', last_name: 'Staff', email: 'demo.staff@example.com', contact_number: null, role: 'Staff' },
  { university_id: 'DEMO-STUDENT-001', first_name: 'Demo', last_name: 'Student', email: 'demo.student@example.com', contact_number: null, role: 'Student' },
];

module.exports = { MOCK_CAMPUS_DATABASE };
