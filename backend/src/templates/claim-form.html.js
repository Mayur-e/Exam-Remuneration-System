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
}

/* ===== HEADER WITH LOGO ===== */
.header-table {
  width: 100%;
  border-collapse: collapse;
}

.header-table td {
  border: 1px solid #000;
  vertical-align: middle;
}

.logo-box {
  width: 110px;
  text-align: center;
  padding: 4px;
}

.logo-box img {
  max-height: 80px;
  max-width: 100px;
}

.header-text {
  text-align: center;
  padding: 4px;
}

.header-text .top {
  font-size: 11px;
  font-weight: 700;
}

.header-text .name {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  margin: 2px 0;
}

.header-text .addr {
  font-size: 10px;
  line-height: 1.2;
}

/* ===== GREY TITLE STRIP ===== */
.title-strip {
  border: 1px solid #000;
  background: #d9d9d9;
  text-align: center;
  font-weight: 700;
  padding: 4px;
  margin-top: 2px;
  font-size: 12px;
}

/* ===== FIELDS ===== */
.row {
  margin: 3px 0;
  line-height: 1.4;
}

.line {
  border-bottom: 1px dotted #000;
  display: inline-block;
  min-width: 140px;
  padding: 0 4px;
}

.label {
  font-weight: 700;
}

/* ===== TABLE ===== */
table.main {
  width: 100%;
  border-collapse: collapse;
  margin-top: 6px;
  table-layout: fixed;
}

table.main th,
table.main td {
  border: 1px solid #000;
  padding: 4px;
  font-size: 11px;
}

table.main th {
  text-align: center;
  font-weight: 700;
  background-color: #f0f0f0;
}

.center { text-align:center; }
.right { text-align:right; }

/* ===== SIGNATURE BOXES ===== */
.sign-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 6px;
}

.sign-table td {
  border: 1px solid #000;
  height: 42px;
  text-align: center;
  vertical-align: bottom;
  font-weight: 700;
  font-size: 10px;
  padding-bottom: 4px;
}

/* ===== BOTTOM OFFICE SECTION ===== */
.office {
  width: 100%;
  border-collapse: collapse;
  margin-top: 6px;
}

.office td {
  border: 1px solid #000;
  height: 110px;
  vertical-align: top;
  padding: 6px;
  font-size: 10px;
}

.small { font-size: 10px; }
.bold { font-weight: 700; }
.mt-2 { margin-top: 2px; }
.mt-4 { margin-top: 4px; }
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

<div class="center small mt-2">
(Individual Claim to be filled in by the Course Chairman Internal / External Examiner)
</div>

<!-- ================= DETAILS ================= -->
<div class="row">
<span class="label">Year:</span> <span class="line">${data.year || ''}</span>
&nbsp;&nbsp; <span class="label">Program:</span> <span class="line">${data.program || ''}</span>
</div>

<div class="row">
<span class="label">Name of Examiner:</span>
<span class="line" style="width:72%">${data.examinerName || ''}</span>
</div>

<div class="row">
<span class="label">Name of College:</span>
<span class="line" style="width:74%">${data.collegeName || ''}</span>
</div>

<div class="row">
<span class="label">Mob No:</span> <span class="line">${data.mobile || ''}</span>
&nbsp;&nbsp; <span class="label">PAN:</span> <span class="line">${data.pan || ''}</span>
&nbsp;&nbsp; <span class="label">Email ID:</span> <span class="line">${data.email || ''}</span>
</div>

<div class="row">
<span class="label">Claim for (Name of Examination</span>
<span class="line">${data.examName || ''}</span>
<span class="label">) at (Dept/Branch)</span>
<span class="line">${data.department || ''}</span>
</div>

<div class="row">
along with (Name of second Examiner)
<span class="line" style="width:70%">${data.secondExaminer || ''}</span>
</div>

<div class="row">
<span class="label">For Subject:</span>
<span class="line">${data.subject || ''}</span>
<span class="label">Subject Code:</span>
<span class="line">${data.subjectCode || ''}</span>
</div>

<div class="row">
<span class="label">Date of Exam:</span> <span class="line">${data.examDate || ''}</span>
<span class="label">Acad. Year:</span> <span class="line">${data.academicYear || ''}</span>
<span class="label">Semester:</span> <span class="line">${data.semester || ''}</span>
</div>

<div class="row mt-2">
at the Pimpri Chinchwad College of Engineering, Pune.
</div>

<!-- ================= TABLE ================= -->
<table class="main">
<tr>
<th style="width:6%">Sr No</th>
<th style="width:34%">Examination Type</th>
<th style="width:16%">No. of Students</th>
<th style="width:18%">Rate per Student in Rs.</th>
<th style="width:20%">Amount in Rs</th>
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
<td>${r[0]}</td>
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
<td>
<b>To be Receipted in Advance</b><br><br>
Rem. to Exam <span class="line" style="width:80%">${data.remToExamLine1 || ''}</span><br>
<span class="line" style="width:80%">${data.remToExamLine2 || ''}</span><br><br>
Signature across the revenue stamp is needed
</td>

<td>
<b>Amount Section (Exam Cell)</b><br><br>
Passed for Rs <span class="line">${data.passedAmount || ''}</span><br>
(In words) <span class="line" style="width:70%">${data.passedAmountInWords || ''}</span><br><br>
<span class="line" style="width:90%">${data.passedAmountRemark || ''}</span><br><br>
Date: <span class="line">${data.passedDate || ''}</span><br><br>
Account Section &nbsp;&nbsp; Register/Exam cell in charge
</td>
</tr>
</table>

</div>
</body>
</html>
`;

module.exports = { getClaimFormHTML };