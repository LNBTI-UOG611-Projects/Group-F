/**
 * PCI Colombo – fictional service-workflow seed (Firestore Emulator ONLY).
 * Run order: seed-auth.cjs -> seed-phase2.cjs -> seed.cjs -> seed-services.cjs.
 * This file only ADDS the workflow records (inspection -> quotation -> job ->
 * visit -> assignment -> invoice). Users, customers, employees, locations and
 * categories belong to the earlier scripts, so they are not changed here.
 * Fixed past dates are used on purpose (DECISIONS B5: allowed in seed data).
 * Run from database/seeds with FIRESTORE_EMULATOR_HOST=127.0.0.1:8080.
 * Uses deterministic IDs: rerunning updates the same demo records.
 * Do not run against live Firestore.
 */
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080') {
  console.error('STOP: Set FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 before running.');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../.firebaserc'), 'utf8'));
const projectId = config?.projects?.default;
if (!projectId) throw new Error('Missing default Firebase project in .firebaserc');
const db = getFirestore(initializeApp({ projectId }));
const at = (iso) => Timestamp.fromDate(new Date(iso));

async function main() {
  // These IDs are created by the earlier three seed scripts.
  const prerequisites = [
    ['users', 'demo-admin'],
    ['users', 'demo-subadmin'],
    ['users', 'demo-customer-user'],
    ['users', 'demo-employee-user'],
    ['customers', 'demo-customer'],
    ['employees', 'demo-employee'],
    ['serviceLocations', 'demo-location'],
    ['serviceCategories', 'demo-treatment'],
    ['serviceRequests', 'demo-request'],
    ['inventoryItems', 'demo-equipment-002'],
    ['pestCategories', 'cockroaches']
  ];
  const missing = [];
  for (const [collection, id] of prerequisites) {
    const snapshot = await db.collection(collection).doc(id).get();
    if (!snapshot.exists) missing.push(`${collection}/${id}`);
  }
  if (missing.length) {
    throw new Error('Missing prerequisite documents. Run seed-auth.cjs, seed-phase2.cjs and seed.cjs first:\n' + missing.join('\n'));
  }

  // Times are fixed fictional UTC instants; display as Asia/Colombo in the UI.
  const created = at('2026-11-09T03:30:00Z');
  const updated = at('2026-11-12T09:00:00Z');
  const now = { createdAt: created, updatedAt: updated };
  const records = [
    // The request has moved on: it was inspected and quoted.
    // merge: true below changes only status and the two dates.
    ['serviceRequests', 'demo-request', { status: 'quoted', ...now }],
    ['siteInspections', 'demo-inspection-001', {
      requestId: 'demo-request', assignedEmployeeId: 'demo-employee',
      scheduledAt: at('2026-11-09T04:00:00Z'), performedAt: at('2026-11-09T05:00:00Z'),
      findings: 'Fictional inspection completed; demonstration only.', severity: 'moderate',
      status: 'completed', ...now
    }],
    ['quotations', 'demo-quotation-001', {
      requestId: 'demo-request', inspectionId: 'demo-inspection-001', version: 1,
      status: 'accepted', currency: 'LKR', subtotalCents: 1500000,
      discountCents: 0, taxCents: 0, totalCents: 1500000,
      preparedByUid: 'demo-subadmin', sentAt: at('2026-11-09T06:00:00Z'),
      respondedAt: at('2026-11-09T08:00:00Z'), ...now
    }],
    ['quotationItems', 'demo-quotation-item-001', {
      quotationId: 'demo-quotation-001', description: 'Fictional service charge',
      quantity: 1, unit: 'service', unitPriceCents: 1500000,
      lineTotalCents: 1500000, costType: 'labor', ...now
    }],
    ['serviceJobs', 'demo-job-001', {
      quotationId: 'demo-quotation-001', requestId: 'demo-request',
      customerId: 'demo-customer', locationId: 'demo-location',
      status: 'scheduled', createdByUid: 'demo-subadmin', ...now
    }],
    ['serviceVisits', 'demo-visit-001', {
      jobId: 'demo-job-001', scheduledStart: at('2026-11-18T03:30:00Z'),
      scheduledEnd: at('2026-11-18T05:30:00Z'), status: 'assigned',
      safetyStatus: 'pending_review', visitNumber: 1, ...now
    }],
    ['employeeAssignments', 'demo-assignment-001', {
      visitId: 'demo-visit-001', employeeId: 'demo-employee',
      status: 'assigned', assignedByUid: 'demo-subadmin',
      assignedAt: at('2026-11-10T04:00:00Z'), ...now
    }],
    ['siteSafetyAssessments', 'demo-safety-assessment-001', {
      requestId: 'demo-request', locationId: 'demo-location',
      reportedIndicators: { childrenPresent: false, olderAdultsPresent: false, petsPresent: false, foodAreasPresent: false, otherConcerns: '' },
      customerNotes: 'Fictional information for UI testing only.', reviewStatus: 'pending', ...now
    }],
    ['invoices', 'demo-invoice-001', {
      jobId: 'demo-job-001', customerId: 'demo-customer',
      invoiceNumber: 'DEMO-INV-001', currency: 'LKR', totalCents: 1500000,
      paidCents: 0, balanceCents: 1500000, status: 'draft', ...now
    }]
  ];

  const batch = db.batch();
  for (const [collection, id, data] of records) {
    batch.set(db.collection(collection).doc(id), data, { merge: true });
  }
  await batch.commit();
  console.log(`Success! Upserted ${records.length} fictional workflow documents in the Firestore Emulator.`);
  console.log('Follow the chain: serviceRequests/demo-request -> quotations/demo-quotation-001 -> serviceJobs/demo-job-001 -> serviceVisits/demo-visit-001 -> employeeAssignments/demo-assignment-001');
  console.log('Safety review stays pending; no chemical treatment, allocation or payment is claimed.');
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });