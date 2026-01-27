const getNonTeachingFormHTML = (data = {}) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Remuneration Claim Form - Expert & Non-Teaching Staff</title>
<style>
@page {
  size: A4;
  margin: 10mm;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  margin: 0;
  padding: 0;
  color: #000;
  -webkit-print-color-adjust: exact;
}

.page {
  border: 2px solid #000;
  padding: 0;
  box-sizing: border-box;
}

/* Header with Logo */
.header-section {
  display: flex;
  border-bottom: 2px solid #000;
}

.logo-box {
  width: 80px;
  border-right: 2px solid #000;
  padding: 5px;
  text-align: center;
}

.logo-box img {
  max-width: 70px;
  max-height: 70px;
}

.header-text {
  flex: 1;
  padding: 5px 10px;
  text-align: center;
}

.trust-name {
  font-size: 9px;
  margin-bottom: 2px;
}

.college-name {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.address {
  font-size: 9px;
  margin-bottom: 2px;
}

.autonomous {
  font-size: 8px;
  font-style: italic;
  margin-bottom: 3px;
}

.form-title {
  font-size: 11px;
  font-weight: 700;
  text-decoration: underline;
}

/* Form Fields */
.form-row {
  display: flex;
  border-bottom: 1px solid #000;
  min-height: 18px;
}

.form-row.no-border {
  border-bottom: none;
}

.field {
  padding: 2px 5px;
  display: flex;
  align-items: center;
}

.field-label {
  font-weight: 700;
  margin-right: 3px;
}

.field-value {
  border-bottom: 1px dotted #000;
  flex: 1;
  min-width: 50px;
}

.divider {
  border-right: 1px solid #000;
}

/* Date Boxes */
.date-row {
  display: flex;
  border-bottom: 2px solid #000;
}

.date-cell {
  flex: 1;
  border-right: 1px solid #000;
  text-align: center;
  padding: 3px;
  min-height: 35px;
}

.date-cell:last-child {
  border-right: none;
}

.date-label {
  font-weight: 700;
  font-size: 9px;
  margin-bottom: 2px;
}

/* Student Info */
.student-row {
  display: flex;
  border-bottom: 1px solid #000;
}

.student-cell {
  flex: 1;
  border-right: 1px solid #000;
  padding: 3px 5px;
  min-height: 18px;
}

.student-cell:last-child {
  border-right: none;
}

.student-label {
  font-weight: 700;
  font-size: 9px;
}

/* Main Table */
.main-table {
  width: 100%;
  border-collapse: collapse;
}

.main-table th,
.main-table td {
  border: 1px solid #000;
  padding: 3px;
  text-align: center;
  vertical-align: middle;
  font-size: 9px;
}

.main-table th {
  font-weight: 700;
  background-color: #fff;
}

.main-table td.left {
  text-align: left;
  padding-left: 5px;
}

.main-table td.right {
  text-align: right;
  padding-right: 5px;
}

.rate-text {
  font-size: 8px;
  line-height: 1.1;
}

.total-row {
  font-weight: 700;
}

/* Signature Section */
.signature-row {
  display: flex;
  border-bottom: 2px solid #000;
  min-height: 35px;
}

.signature-cell {
  flex: 1;
  border-right: 1px solid #000;
  padding: 3px;
  text-align: center;
  font-weight: 700;
  font-size: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signature-cell:last-child {
  border-right: none;
}

/* Office Section */
.office-section {
  padding: 5px 10px;
  border-bottom: 2px solid #000;
}

.office-title {
  font-weight: 700;
  text-align: center;
  margin-bottom: 3px;
  text-decoration: underline;
}

.office-row {
  margin: 2px 0;
  font-size: 9px;
}

.office-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 9px;
}
</style>
</head>
<body>
<div class="page">

<!-- HEADER WITH LOGO -->
<div class="header-section">
  <div class="logo-box">
    <img src="${data.logo || ''}" alt="Logo"/>
  </div>
  <div class="header-text">
    <div class="trust-name">Pimpri-Chinchwad Education Trust's</div>
    <div class="college-name">PIMPRI CHINCHWAD COLLEGE OF ENGINEERING</div>
    <div class="address">Sector No. 26, Pradhikaran, Nigdi, Pune – 411 044</div>
    <div class="autonomous">(An Autonomous Institute Permanently affiliated to Savitribai Phule Pune University)</div>
    <div class="form-title">Remuneration Claim Form - Expert & Non-Teaching Staff</div>
  </div>
</div>

<!-- FORM FIELDS -->
<div class="form-row">
  <div class="field" style="flex: 1;">
    <span class="field-label">Year:</span>
    <span class="field-value">${data.year || ''}</span>
  </div>
  <div class="field divider" style="flex: 2;">
    <span class="field-label">Program:</span>
    <span class="field-value">${data.program || ''}</span>
  </div>
</div>

<div class="form-row">
  <div class="field" style="flex: 1;">
    <span class="field-label">Claim for(Name of Examination): PR/ OR/ TW/ Project/ Dissertation</span>
    <span class="field-value" style="min-width: 100px;">${data.examName || ''}</span>
    <span class="field-label">Examination</span>
  </div>
</div>

<div class="form-row">
  <div class="field" style="flex: 1;">
    <span class="field-label">for Subject</span>
    <span class="field-value" style="min-width: 200px;">${data.subject || ''}</span>
    <span class="field-label">Subject Code:</span>
    <span class="field-value" style="min-width: 80px;">${data.subjectCode || ''}</span>
  </div>
</div>

<div class="form-row">
  <div class="field" style="flex: 1;">
    <span class="field-label">at(Dept./Branch)</span>
    <span class="field-value" style="min-width: 200px;">${data.department || ''}</span>
    <span class="field-label">Acad. Year:</span>
    <span class="field-value" style="min-width: 80px;">${data.academicYear || ''}</span>
  </div>
</div>

<div class="form-row">
  <div class="field" style="flex: 1;">
    <span class="field-label">Semester:</span>
    <span class="field-value" style="min-width: 80px;">${data.semester || ''}</span>
    <span style="margin-left: 10px;">at the Pimpri Chinchwad College of Engineering, Pune.</span>
  </div>
</div>

<!-- DATE BOXES -->
<div class="date-row">
  <div class="date-cell">
    <div class="date-label">Preparation<br/>Date/s</div>
    <div>${data.prepDates || ''}</div>
  </div>
  <div class="date-cell">
    <div class="date-label">Examination<br/>Date/s</div>
    <div>${data.examDates || ''}</div>
  </div>
  <div class="date-cell">
    <div class="date-label">Cleaning<br/>Date/s</div>
    <div>${data.cleaningDates || ''}</div>
  </div>
</div>

<!-- STUDENT INFO -->
<div class="student-row">
  <div class="student-cell">
    <span class="student-label">No. of Student :</span>
    <span>${data.totalStudents || ''}</span>
  </div>
  <div class="student-cell">
  </div>
  <div class="student-cell">
  </div>
</div>

<div class="student-row">
  <div class="student-cell">
    <span class="student-label">No. of Student Per Batch :</span>
    <span>${data.studentsPerBatch || ''}</span>
  </div>
  <div class="student-cell">
  </div>
  <div class="student-cell">
  </div>
</div>

<div class="student-row">
  <div class="student-cell">
    <span class="student-label">No. of Batches :</span>
    <span>${data.totalBatches || ''}</span>
  </div>
  <div class="student-cell">
  </div>
  <div class="student-cell">
  </div>
</div>

<div class="student-row" style="border-bottom: 2px solid #000;">
  <div class="student-cell">
    <span class="student-label">Total No. of Days :<br/>(Preparation & Cleaning)</span>
    <span>${data.totalDays || ''}</span>
  </div>
  <div class="student-cell">
  </div>
  <div class="student-cell">
  </div>
</div>

<!-- MAIN STAFF TABLE -->
<table class="main-table">
  <thead>
    <tr>
      <th style="width: 4%;">Sr.<br/>No.</th>
      <th style="width: 22%;">Name of faculty/Staff</th>
      <th style="width: 10%;">Design.</th>
      <th style="width: 12%;">Rates</th>
      <th style="width: 12%;">Prep &<br/>Clean Rs.</th>
      <th style="width: 12%;">Batch Rs.</th>
      <th style="width: 12%;">Total<br/>Amount</th>
      <th style="width: 16%;">Signature</th>
    </tr>
  </thead>
  <tbody>
    <!-- Expert Assistant Rows -->
    <tr>
      <td>1</td>
      <td class="left">${data.expertStaff1Name || ''}</td>
      <td rowspan="4">Expert<br/>Asst.</td>
      <td rowspan="4">
        <div class="rate-text">125/-<br/>per batch</div>
        <div class="rate-text">NA</div>
      </td>
      <td>${data.expertStaff1Prep || 'NA'}</td>
      <td>${data.expertStaff1Batch || ''}</td>
      <td>${data.expertStaff1Total || ''}</td>
      <td></td>
    </tr>
    <tr>
      <td>2</td>
      <td class="left">${data.expertStaff2Name || ''}</td>
      <td>${data.expertStaff2Prep || 'NA'}</td>
      <td>${data.expertStaff2Batch || ''}</td>
      <td>${data.expertStaff2Total || ''}</td>
      <td></td>
    </tr>
    <tr>
      <td>3</td>
      <td class="left">${data.expertStaff3Name || ''}</td>
      <td>${data.expertStaff3Prep || 'NA'}</td>
      <td>${data.expertStaff3Batch || ''}</td>
      <td>${data.expertStaff3Total || ''}</td>
      <td></td>
    </tr>
    <tr>
      <td>4</td>
      <td class="left">${data.expertStaff4Name || ''}</td>
      <td>${data.expertStaff4Prep || 'NA'}</td>
      <td>${data.expertStaff4Batch || ''}</td>
      <td>${data.expertStaff4Total || ''}</td>
      <td></td>
    </tr>
    
    <!-- Lab Assistant Rows -->
    <tr>
      <td>1</td>
      <td class="left">${data.labStaff1Name || ''}</td>
      <td rowspan="2">Lab<br/>Asst.</td>
      <td rowspan="2">
        <div class="rate-text">70/- per<br/>day</div>
        <div class="rate-text">70/- per<br/>batch</div>
      </td>
      <td>${data.labStaff1Prep || ''}</td>
      <td>${data.labStaff1Batch || ''}</td>
      <td>${data.labStaff1Total || ''}</td>
      <td></td>
    </tr>
    <tr>
      <td>2</td>
      <td class="left">${data.labStaff2Name || ''}</td>
      <td>${data.labStaff2Prep || ''}</td>
      <td>${data.labStaff2Batch || ''}</td>
      <td>${data.labStaff2Total || ''}</td>
      <td></td>
    </tr>
    
    <!-- Peon Rows -->
    <tr>
      <td>1</td>
      <td class="left">${data.peonStaff1Name || ''}</td>
      <td rowspan="2">Peon</td>
      <td rowspan="2">
        <div class="rate-text">60/- per<br/>day</div>
        <div class="rate-text">60/- per<br/>batch</div>
      </td>
      <td>${data.peonStaff1Prep || ''}</td>
      <td>${data.peonStaff1Batch || ''}</td>
      <td>${data.peonStaff1Total || ''}</td>
      <td></td>
    </tr>
    <tr>
      <td>2</td>
      <td class="left">${data.peonStaff2Name || ''}</td>
      <td>${data.peonStaff2Prep || ''}</td>
      <td>${data.peonStaff2Batch || ''}</td>
      <td>${data.peonStaff2Total || ''}</td>
      <td></td>
    </tr>
    
    <!-- Total Row -->
    <tr class="total-row">
      <td colspan="6" class="right">Total Amount :</td>
      <td>${data.grandTotal || ''}</td>
      <td></td>
    </tr>
  </tbody>
</table>

<!-- SIGNATURE SECTION -->
<div class="signature-row">
  <div class="signature-cell">Exam Section</div>
  <div class="signature-cell">Signature - Course Chairman</div>
  <div class="signature-cell">Name & Signature - Internal Examiner</div>
</div>

<!-- OFFICE USE SECTION -->
<div class="office-section">
  <div class="office-title">For Office Use only (Exam Cell)</div>
  <div class="office-row">
    Passed for Rs. <span style="border-bottom: 1px dotted #000; display: inline-block; min-width: 80px;">${data.passedAmount || ''}</span>
    (In words: <span style="border-bottom: 1px dotted #000; display: inline-block; min-width: 300px;">${data.passedAmountInWords || ''}</span>)
  </div>
  <div class="office-row">
    Date: <span style="border-bottom: 1px dotted #000; display: inline-block; min-width: 100px;">${data.passedDate || ''}</span>
  </div>
  <div class="office-footer">
    <span>Account section</span>
    <span>Registrar / In-charge - Exam cell</span>
  </div>
</div>

</div>
</body>
</html>
`;

module.exports = { getNonTeachingFormHTML };