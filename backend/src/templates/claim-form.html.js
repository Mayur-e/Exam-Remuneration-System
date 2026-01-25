const getClaimFormHTML = (data = {}) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Remuneration Claim Form - PR / OR / TW / Project / Seminar</title>
<style>
@page {
  size: A4;
  margin: 8mm;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  margin: 0;
  color: #000;
  -webkit-print-color-adjust: exact;
}

/* ===== OUTER PAGE BORDER ===== */
.page {
  border: 2px solid #000;
  padding: 6px;
  min-height: 280mm;
  box-sizing: border-box;
}

/* ===== HEADER WITH LOGO ===== */
.header-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.header-table td {
  border: 1px solid #000;
  vertical-align: middle;
  padding: 3px;
}

.logo-box {
  width: 105px;
  text-align: center;
  padding: 2px;
}

.logo-box img {
  max-height: 75px;
  max-width: 95px;
}

.header-text {
  text-align: center;
  padding: 3px;
}

.header-text .top {
  font-size: 10px;
  font-weight: 700;
  margin-bottom: 2px;
}

.header-text .name {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  margin: 1px 0;
  line-height: 1.1;
}

.header-text .addr {
  font-size: 9px;
  line-height: 1.1;
  margin: 1px 0;
}

/* ===== GREY TITLE STRIP ===== */
.title-strip {
  border: 1px solid #000;
  background: #d9d9d9;
  text-align: center;
  font-weight: 700;
  padding: 3px;
  margin-top: 2px;
  font-size: 11px;
}

/* ===== FIELDS ===== */
.row {
  margin: 2px 0;
  line-height: 1.3;
  font-size: 10px;
}

.line {
  border-bottom: 1px dotted #000;
  display: inline-block;
  min-width: 100px;
  padding: 0 3px;
  font-size: 10px;
}

.label {
  font-weight: 700;
  font-size: 10px;
}

/* ===== TABLE ===== */
table.main {
  width: 100%;
  border-collapse: collapse;
  margin-top: 5px;
  table-layout: fixed;
  font-size: 10px;
}

table.main th,
table.main td {
  border: 1px solid #000;
  padding: 3px;
}

table.main th {
  text-align: center;
  font-weight: 700;
  background-color: #f0f0f0;
  padding: 4px 2px;
}

.center { text-align:center; }
.right { text-align:right; }

/* ===== SIGNATURE BOXES ===== */
.sign-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 5px;
  font-size: 10px;
}

.sign-table td {
  border: 1px solid #000;
  height: 35px;
  text-align: center;
  vertical-align: bottom;
  font-weight: 700;
  padding-bottom: 3px;
}

/* ===== BOTTOM OFFICE SECTION ===== */
.office {
  width: 100%;
  border-collapse: collapse;
  margin-top: 5px;
  font-size: 9px;
}

.office td {
  border: 1px solid #000;
  height: 95px;
  vertical-align: top;
  padding: 4px;
}

.small { font-size: 9px; }
.bold { font-weight: 700; }
.mt-1 { margin-top: 1px; }
.mt-2 { margin-top: 2px; }
.mb-1 { margin-bottom: 1px; }

/* ===== COMPACT ADJUSTMENTS ===== */
.compact-line {
  border-bottom: 1px dotted #000;
  display: inline-block;
  padding: 0 3px;
  font-size: 10px;
}

.details-section {
  margin: 4px 0;
}
</style>
</head>

<body>
<div class="page">

<!-- ================= HEADER ================= -->
<table class="header-table">
<tr>
  <td class="logo-box">
    ${data.logo ? `<img src="${data.logo}" />` : ``}
  </td>
  <td class="header-text">
    <div class="top">Pimpri-Chinchwad Education Trust's</div>
    <div class="name">PIMPRI CHINCHWAD COLLEGE OF ENGINEERING</div>
    <div class="addr">Sector No. 26, Pradhikaran, Nigdi, Pune – 411 044</div>
    <div class="addr">(An Autonomous Institute Permanently affiliated to Savitribai Phule Pune University)</div>
  </td>
</tr>
</table>

<div class="title-strip">
Remuneration Claim Form - PR / OR / TW / Project / Seminar
</div>

<div class="center small mt-1">
(Individual Claim to be filled in by the Course Chairman Internal / External Examiner)
</div>

<!-- ================= DETAILS ================= -->
<div class="details-section">
<div class="row">
<span class="label">Year:</span> <span class="line" style="min-width:60px">${data.year || ''}</span>
&nbsp;&nbsp; <span class="label">Program:</span> <span class="line" style="min-width:80px">${data.program || ''}</span>
</div>

<div class="row">
<span class="label">Name of Examiner:</span>
<span class="line" style="width:65%">${data.examinerName || ''}</span>
</div>

<div class="row">
<span class="label">Name of College:</span>
<span class="line" style="width:67%">${data.collegeName || ''}</span>
</div>

<div class="row">
<span class="label">Mob No:</span> <span class="line" style="min-width:80px">${data.mobile || ''}</span>
&nbsp; <span class="label">PAN:</span> <span class="line" style="min-width:90px">${data.pan || ''}</span>
&nbsp; <span class="label">Email ID:</span> <span class="line" style="min-width:110px">${data.email || ''}</span>
</div>

<div class="row">
<span class="label">Claim for (Name of Examination</span>
<span class="line" style="min-width:100px">${data.examName || ''}</span>
<span class="label">) at (Dept/Branch)</span>
<span class="line" style="min-width:90px">${data.department || ''}</span>
</div>

<div class="row">
along with (Name of second Examiner)
<span class="line" style="width:62%">${data.secondExaminer || ''}</span>
</div>

<div class="row">
<span class="label">For Subject:</span>
<span class="line" style="min-width:120px">${data.subject || ''}</span>
<span class="label">Subject Code:</span>
<span class="line" style="min-width:70px">${data.subjectCode || ''}</span>
</div>

<div class="row">
<span class="label">Date of Exam:</span> <span class="line" style="min-width:70px">${data.examDate || ''}</span>
<span class="label">Acad. Year:</span> <span class="line" style="min-width:80px">${data.academicYear || ''}</span>
<span class="label">Semester:</span> <span class="line" style="min-width:40px">${data.semester || ''}</span>
</div>

<div class="row mt-1">
at the Pimpri Chinchwad College of Engineering, Pune.
</div>
</div>

<!-- ================= TABLE ================= -->
<table class="main">
<tr>
<th style="width:5%">Sr No</th>
<th style="width:35%">Examination Type</th>
<th style="width:15%">No. of Students</th>
<th style="width:17%">Rate per Student in Rs.</th>
<th style="width:18%">Amount in Rs</th>
</tr>

${[
  ["Practical","practicalStudents","practicalRate","practicalAmount"],
  ["Oral","oralStudents","oralRate","oralAmount"],
  ["Term Work","termWorkStudents","termWorkRate","termWorkAmount"],
  ["Project/Seminar/MOOCs","projectStudents","projectRate","projectAmount"],
  ["Chairman Allowance","chairmanStudents","chairmanRate","chairmanAmount"],
  ["Local Conveyance Allowance for No. of Days ${data.conveyanceDays || ''}<br>Dates: ${data.conveyanceDates || ''}",
   "conveyanceStudents","conveyanceRate","conveyanceAmount"]
].map((r,i)=>`
<tr>
<td class="center">${i+1}</td>
<td style="font-size:10px; padding:3px;">${r[0]}</td>
<td class="center">${data[r[1]]||''}</td>
<td class="center">${data[r[2]]||''}</td>
<td class="right">${data[r[3]]||''}</td>
</tr>
`).join('')}

<tr>
<td colspan="4" class="right bold">Total Amount :</td>
<td class="right bold">${data.totalAmount || ''}</td>
</tr>
</table>

<!-- ================= SIGNATURES ================= -->
<table class="sign-table">
<tr>
<td>Signature - Exam Section</td>
<td>Signature - Course Chairman</td>
<td>Signature of the Examiner</td>
</tr>
</table>

<!-- ================= OFFICE SECTION ================= -->
<table class="office">
<tr>
<td style="width:50%">
<div class="bold">To be Receipted in Advance</div>
<div class="mt-1">
Rem. to Exam <span class="compact-line" style="width:75%">${data.remToExamLine1 || ''}</span>
</div>
<div class="mt-1">
<span class="compact-line" style="width:75%">${data.remToExamLine2 || ''}</span>
</div>
<div class="mt-1">
Signature across the revenue stamp is needed
</div>
</td>

<td style="width:50%">
<div class="bold">Amount Section (Exam Cell)</div>
<div class="mt-1">
Passed for Rs <span class="compact-line" style="min-width:80px">${data.passedAmount || ''}</span>
</div>
<div class="mt-1">
(In words) <span class="compact-line" style="width:65%">${data.passedAmountInWords || ''}</span>
</div>
<div class="mt-1">
<span class="compact-line" style="width:85%">${data.passedAmountRemark || ''}</span>
</div>
<div class="mt-1">
Date: <span class="compact-line" style="min-width:70px">${data.passedDate || ''}</span>
</div>
<div class="mt-1">
Account Section &nbsp;&nbsp; Register/Exam cell in charge
</div>
</td>
</tr>
</table>

</div>
</body>
</html>
`;

module.exports = { getClaimFormHTML };