import { ElectronicComponent, RentalRecord } from '../types';

/**
 * Helper to escape CSV cell contents according to RFC 4180:
 * - Wraps in double quotes if it contains commas, double quotes, or newlines
 * - Escapes inner double quotes as ""
 */
const escapeCSV = (value: string | number | boolean | null | undefined): string => {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
};

/**
 * Triggers browser download of a CSV file with UTF-8 BOM so Excel opens it correctly.
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export current electronic components inventory to CSV
 */
export const exportInventoryToCSV = (
  components: ElectronicComponent[],
  filenamePrefix = 'ECE_Lab_Inventory_Report'
): void => {
  const headers = [
    'Component ID',
    'Component Name',
    'Model / Part Number',
    'Category',
    'Total Stock',
    'Available Units',
    'Currently Rented',
    'In Maintenance',
    'Reserved Units',
    'Daily Rent Rate (INR)',
    'Security Deposit (INR)',
    'High Value Equipment',
    'Max Rental Days',
    'Storage Rack',
    'Storage Shelf',
    'Storage Bin',
    'Condition',
    'Key Specifications',
    'Last Audited Date',
    'Datasheet Link',
  ];

  const rows = components.map((c) => {
    const specsSummary = c.specifications
      ? Object.entries(c.specifications)
          .map(([k, v]) => `${k}: ${v}`)
          .join('; ')
      : '';

    return [
      escapeCSV(c.id),
      escapeCSV(c.name),
      escapeCSV(c.modelNumber),
      escapeCSV(c.category),
      escapeCSV(c.totalQuantity),
      escapeCSV(c.availableQuantity),
      escapeCSV(c.rentedQuantity),
      escapeCSV(c.inMaintenanceQuantity),
      escapeCSV(c.reservedQuantity),
      escapeCSV(c.dailyRentRate ?? 0),
      escapeCSV(c.securityDeposit ?? 0),
      escapeCSV(c.isHighValueEquipment ? 'Yes' : 'No'),
      escapeCSV(c.maxRentalDays ?? 7),
      escapeCSV(c.location?.rack || 'Unassigned'),
      escapeCSV(c.location?.shelf || '-'),
      escapeCSV(c.location?.bin || '-'),
      escapeCSV(c.condition),
      escapeCSV(specsSummary),
      escapeCSV(c.lastAuditedAt || 'Not Audited'),
      escapeCSV(c.datasheetUrl || ''),
    ].join(',');
  });

  const timestamp = new Date().toISOString().split('T')[0];
  const csvData = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(csvData, `${filenamePrefix}_${timestamp}.csv`);
};

/**
 * Export current equipment rental and gate pass records to CSV
 */
export const exportRentalsToCSV = (
  rentals: RentalRecord[],
  filenamePrefix = 'ECE_Lab_Rentals_GatePass_Report'
): void => {
  const headers = [
    'Rental ID',
    'Gate Pass No',
    'Status',
    'Component Name',
    'Model / Part No',
    'Quantity Issued',
    'Student Roll No',
    'Student Name',
    'Student Email',
    'Student Phone',
    'Department',
    'Semester',
    'Issued At',
    'Expected Return Date',
    'Actual Return Date',
    'Issued By (Staff)',
    'Inspected By (Staff)',
    'Condition On Issue',
    'Condition On Return',
    'Fine Amount (INR)',
    'Fine Status',
    'Accessories Issued',
    'Notes / Purpose',
  ];

  const rows = rentals.map((r) => {
    return [
      escapeCSV(r.id),
      escapeCSV(r.gatePassNumber || 'N/A'),
      escapeCSV(r.status.toUpperCase()),
      escapeCSV(r.componentName),
      escapeCSV(r.componentModel),
      escapeCSV(r.quantity),
      escapeCSV(r.studentRollNo),
      escapeCSV(r.studentName),
      escapeCSV(r.studentEmail),
      escapeCSV(r.studentPhone || ''),
      escapeCSV(r.studentDepartment),
      escapeCSV(r.studentSemester),
      escapeCSV(r.issuedAt ? new Date(r.issuedAt).toLocaleString() : ''),
      escapeCSV(r.expectedReturnDate),
      escapeCSV(r.actualReturnDate ? new Date(r.actualReturnDate).toLocaleString() : 'Not Returned'),
      escapeCSV(r.issuedBy ? `${r.issuedBy.name} (${r.issuedBy.role})` : ''),
      escapeCSV(r.returnInspectedBy ? `${r.returnInspectedBy.name} (${r.returnInspectedBy.role})` : 'N/A'),
      escapeCSV(r.conditionOnIssue || ''),
      escapeCSV(r.conditionOnReturn || 'Pending Return'),
      escapeCSV(r.fineAmount ?? 0),
      escapeCSV(r.fineStatus || 'none'),
      escapeCSV(r.accessoriesIssued ? r.accessoriesIssued.join('; ') : ''),
      escapeCSV(r.notes || ''),
    ].join(',');
  });

  const timestamp = new Date().toISOString().split('T')[0];
  const csvData = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(csvData, `${filenamePrefix}_${timestamp}.csv`);
};

/**
 * Export lab audit logs to CSV
 */
export const exportAuditLogsToCSV = (
  logs: import('../types').LabAuditLog[],
  filenamePrefix = 'ECE_Lab_Audit_Logs'
): void => {
  const headers = ['Log ID', 'Timestamp', 'Action', 'Category', 'Performed By', 'Role', 'Details'];

  const rows = logs.map((l) => [
    escapeCSV(l.id),
    escapeCSV(l.timestamp ? new Date(l.timestamp).toLocaleString() : ''),
    escapeCSV(l.action),
    escapeCSV(l.category.toUpperCase()),
    escapeCSV(l.performedBy),
    escapeCSV(l.role),
    escapeCSV(l.details),
  ].join(','));

  const timestamp = new Date().toISOString().split('T')[0];
  const csvData = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(csvData, `${filenamePrefix}_${timestamp}.csv`);
};
