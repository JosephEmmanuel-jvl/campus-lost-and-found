/**
 * src/config/campusDb.js
 * ---------------------------------------------------------------------------
 * Mock Campus Database containing all registered university members.
 * Used for authentication (Task 4) and auto role assignment (Task 5).
 * ---------------------------------------------------------------------------
 */

const MOCK_CAMPUS_DATABASE = [
  {
    university_id: '2021-00001',
    first_name: 'Alice',
    last_name: 'Santos',
    email: 'alice.santos@university.edu',
    password_hash: '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm', // Password123!
    contact_number: '09171234567'
  },
  {
    university_id: '2021-10002',
    first_name: 'Benjamin',
    last_name: 'Cruz',
    email: 'benjamin.cruz@university.edu',
    password_hash: '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm',
    contact_number: '09181234567'
  },
  {
    university_id: '2022-20001',
    first_name: 'Carla',
    last_name: 'Reyes',
    email: 'carla.reyes@university.edu',
    password_hash: '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm'
  },
  {
    university_id: '2022-20002',
    first_name: 'Daniel',
    last_name: 'Mendoza',
    email: 'daniel.mendoza@university.edu',
    password_hash: '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm',
    contact_number: '09201234567'
  },
  {
    university_id: '2022-20003',
    first_name: 'Erika',
    last_name: 'Villanueva',
    email: 'erika.villanueva@university.edu',
    password_hash: '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm'
  },
  {
    university_id: '2026-00101',
    first_name: 'John',
    last_name: 'Admin',
    email: 'john.admin@university.edu',
    password_hash: '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm'
  },
  {
    university_id: '2026-10101',
    first_name: 'Jane',
    last_name: 'Staff',
    email: 'jane.staff@university.edu',
    password_hash: '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm'
  },
  {
    university_id: '2026-20101',
    first_name: 'Bob',
    last_name: 'Student',
    email: 'bob.student@university.edu',
    password_hash: '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm'
  }
];

module.exports = { MOCK_CAMPUS_DATABASE };
