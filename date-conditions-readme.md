# Date Conditions & Validation Rules for Non-Teaching Staff Remuneration Claims

**Applicable to:** Expert & Non-Teaching Staff Remuneration Claim Form (PR/OR/TW/Project/Dissertation)  
**Reference:** PCCOE Examinations Remuneration Booklet v-2.1, Part II – Tables 2.2.3 & 2.2.4

---

## Overview

When submitting remuneration claims for lab assistants, peons, expert assistants, and other non-teaching staff, the dates entered for **Preparation**, **Examination**, and **Cleaning** must comply with specific business rules. These rules ensure:

1. **Date logical consistency** – preparation before exam, cleaning after.
2. **Norm compliance** – staff days claimed do not exceed allowed maximums.
3. **Same-session integrity** – all dates belong to the same exam instance.
4. **Role-specific restrictions** – Expert Assistants cannot claim prep/clean days.

---

## Core Date Fields

The Expert & Non-Teaching Staff form captures three date categories:

```
Preparation Date/s  : _________________
Examination Date/s  : _________________
Cleaning Date/s     : _________________
```

**Total No. of Days (Preparation & Cleaning):** = count of prep dates + count of clean dates

---

## Rule 1: Strict Date Ordering

### Order Rule (Mandatory)

```
Preparation Date(s) < Examination Date ≤ Cleaning Date(s)
```

### Detailed Conditions

| Condition | Rule | Invalid If | Error Message |
|-----------|------|-----------|---|
| **Prep before Exam** | Every preparation date must be strictly **before** the earliest exam date | `prep_date >= min(exam_dates)` | "Preparation date cannot be on or after exam date" |
| **Clean after/on Exam** | Every cleaning date must be **on or after** the latest exam date | `clean_date < max(exam_dates)` | "Cleaning date must be on or after exam date" |
| **No future dates** | All dates must be in the past or current date (as of claim submission) | Any date > today | "Date cannot be in the future" |

### Examples

✅ **Valid scenarios:**

- Prep: 2024-01-10, Exam: 2024-01-11, Clean: 2024-01-11
- Prep: 2024-01-09, Exam: 2024-01-10, Clean: 2024-01-12
- Prep: 2024-01-10, Exam: 2024-01-10, 2024-01-11 (multi-day exam), Clean: 2024-01-11

❌ **Invalid scenarios:**

- Prep: 2024-01-11, Exam: 2024-01-10 ← prep after exam
- Prep: 2024-01-10, Exam: 2024-01-10, Clean: 2024-01-09 ← clean before exam
- Prep: 2024-02-01, Exam: 2024-01-10 ← prep and exam not close enough

---

## Rule 2: Same Exam Instance Constraint

### Multi-Date Session Rule (Mandatory)

All preparation, examination, and cleaning dates must belong to the **same exam instance** (same exam session/term).

### Conditions

| Condition | Details | Invalid If |
|-----------|---------|-----------|
| **Same exam header** | All dates must be for the same Subject Code & exam type (PR/OR/TW/Project) | Dates from different subjects in one claim |
| **Same academic term** | All dates must fall within the same Academic Year & Semester | Dates spanning across Sem I and Sem II |
| **Continuous exam session** | All dates should cluster within the exam session window (no unexplained long gaps) | Prep on 2024-01-10, Exam on 2024-03-01 (8 weeks gap) |
| **Same exam mode** | Dates must be for the same exam type (Regular vs Backlog/Re-ETE/Summer Term) | Mixing regular exam dates with backlog dates |

### Implementation Check

```
IF (exam_academic_year != header_academic_year) THEN
  ERROR: "Exam date academic year mismatch"
END IF

IF (exam_semester != header_semester) THEN
  ERROR: "Exam date semester mismatch"
END IF

IF (is_backlog && has_regular_dates) THEN
  ERROR: "Cannot mix backlog and regular exam dates"
END IF
```

---

## Rule 3: Norm-Based Day Limits

### Maximum Allowed Days (from Manual Tables 2.2.3 & 2.2.4)

The **maximum number of preparation and cleaning days** varies by:

1. **Exam type** (PR / OR / TW / Project / etc.)
2. **Student count** (Up to 100 / 101–200 / Above 200)
3. **Exam mode** (Regular vs Backlog/Re-ETE/Summer)

#### Regular Exams (Table 2.2.3)

| Exam Head | Student Range | Max Prep Days | Max Clean Days |
|-----------|---------------|---------------|---|
| **Practical (PR)** | Up to 100 | 2 | 1 |
| | 101–200 | 2 | 1 |
| | Above 200 | 2 | 1 |
| **Project (OR/TW)** | Up to 100 | 1 | 1 |
| | 101–200 | 1 | 1 |
| | Above 200 | 1 | 3 |
| **Oral/Term Work** | Any | 1 | 0 |

#### Backlog / Re-ETE / Summer (Table 2.2.4)

| Exam Head | Student Range | Max Prep Days | Max Clean Days |
|-----------|---------------|---------------|---|
| **Practical (PR)** | Up to 100 | 1 | 0 |
| | Above 100 | 1 | 0 |
| **Project (OR/TW)** | Up to 100 | 1 | 0 |
| | Above 100 | 1 | 0 |
| **Oral/Term Work** | Any | 1 | 0 |

### Validation Condition

```
prep_date_count = COUNT(prep_dates)
clean_date_count = COUNT(clean_dates)

max_prep = lookup_max_prep_days(exam_type, is_backlog, students_count)
max_clean = lookup_max_clean_days(exam_type, is_backlog, students_count)

IF prep_date_count > max_prep THEN
  ERROR: "Preparation days ({prep_date_count}) exceed norm ({max_prep})"
END IF

IF clean_date_count > max_clean THEN
  ERROR: "Cleaning days ({clean_date_count}) exceed norm ({max_clean})"
END IF
```

### Example

**Scenario:** Regular PR, 80 students

- Max Prep Days allowed: **2**
- Max Clean Days allowed: **1**

❌ **Invalid:** User enters 3 prep dates (exceeds norm)  
✅ **Valid:** User enters 1 prep date + 1 clean date

---

## Rule 4: Expert Assistant Prep/Clean Restriction

### Manual Requirement

> "Expert assistants are **not entitled to claim** preparation and cleaning day remuneration for any exam."

### Condition

For any row where `staff_role = 'Expert Assistant'`:

```
IF staff_role == 'Expert Assistant' THEN
  preparation_days := 0  (force to zero)
  cleaning_days := 0     (force to zero)
  
  IF (user_entered_prep_dates OR user_entered_clean_dates) THEN
    WARNING: "Expert Assistants cannot claim prep/clean days. These will be ignored."
  END IF
END IF
```

### Calculation Impact

| Staff Role | Prep Days Claimed | Per-Batch Claimed | Cleaning Days Claimed | Total Amount |
|-----------|-------------------|-------------------|-----------------------|---|
| Lab Assistant | 70 × 2 = 140 | 70 × 3 = 210 | 70 × 1 = 70 | ₹420 |
| Expert Assistant | **0** | 125 × 3 = 375 | **0** | ₹375 |
| Peon | 60 × 2 = 120 | 60 × 3 = 180 | 60 × 1 = 60 | ₹360 |

---

## Rule 5: No Large Date Gaps

### Gap Rule (Recommended for Data Quality)

Ensure dates cluster logically around the exam window:

```
buffer_days = 1  (allow small discrepancies)

earliest_prep = MIN(prep_dates)
latest_exam = MAX(exam_dates)
earliest_exam = MIN(exam_dates)
latest_clean = MAX(clean_dates)

gap_prep_to_exam = latest_exam - earliest_prep
gap_exam_to_clean = latest_clean - latest_exam

IF gap_prep_to_exam > (max_prep_days + buffer_days) THEN
  WARNING: "Large gap between prep and exam dates. Ensure dates are correct."
END IF

IF gap_exam_to_clean > (max_clean_days + buffer_days) THEN
  WARNING: "Large gap between exam and cleaning dates. Ensure dates are correct."
END IF
```

### Example (Regular PR, max 2 prep + 1 clean)

✅ **Valid:**
- Prep: 2024-01-08, 2024-01-09 (gap = 2 days ≤ max)
- Exam: 2024-01-10
- Clean: 2024-01-10 (gap = 0 ≤ max + 1)

⚠️ **Warning:**
- Prep: 2024-01-01
- Exam: 2024-01-20
- Clean: 2024-01-20
- (Gap of 19 days from first prep to exam, far exceeds norm)

---

## Rule 6: Continuous Date Sequence (Optional)

### Continuity Check

If desired, enforce that dates form a roughly continuous sequence with no interruptions:

```
IF (exam_mode == 'REGULAR') THEN
  -- Prep should not have multi-day interruptions
  -- All prep dates should be consecutive or nearly consecutive
  prep_day_gaps = check_day_gaps(prep_dates)
  
  IF (ANY gap > 1) THEN
    WARNING: "Prep dates have gaps. Confirm if intentional."
  END IF
END IF
```

This helps catch data entry errors.

---

## Validation Algorithm (Pseudocode)

```
FUNCTION validate_non_teaching_claim(claim)
  
  prep_dates = parse_dates(claim.preparation_dates)
  exam_dates = parse_dates(claim.examination_dates)
  clean_dates = parse_dates(claim.cleaning_dates)
  
  exam_type = claim.exam_type
  is_backlog = claim.exam_mode == 'BACKLOG'
  students_count = claim.students_count
  
  errors = []
  warnings = []
  
  -- Rule 1: Date Ordering
  FOR EACH prep_date IN prep_dates:
    IF prep_date >= MIN(exam_dates) THEN
      errors.push("Prep date must be before exam date")
    END IF
  END FOR
  
  FOR EACH clean_date IN clean_dates:
    IF clean_date < MAX(exam_dates) THEN
      errors.push("Clean date must be on/after exam date")
    END IF
  END FOR
  
  -- Rule 2: Same Exam Instance
  IF claim.academic_year != get_exam_academic_year() THEN
    errors.push("Academic year mismatch")
  END IF
  
  IF claim.semester != get_exam_semester() THEN
    errors.push("Semester mismatch")
  END IF
  
  -- Rule 3: Norm Limits
  max_prep = get_max_prep_days(exam_type, is_backlog, students_count)
  max_clean = get_max_clean_days(exam_type, is_backlog, students_count)
  
  IF LENGTH(prep_dates) > max_prep THEN
    errors.push("Prep days exceed norm: " + max_prep)
  END IF
  
  IF LENGTH(clean_dates) > max_clean THEN
    errors.push("Clean days exceed norm: " + max_clean)
  END IF
  
  -- Rule 4: Expert Assistant Restriction
  FOR EACH staff IN claim.staff:
    IF staff.role == 'Expert Assistant' AND 
       (LENGTH(prep_dates) > 0 OR LENGTH(clean_dates) > 0) THEN
      warnings.push("Expert Assistants cannot claim prep/clean days (will be ignored)")
    END IF
  END FOR
  
  -- Rule 5: Gap Check
  IF LENGTH(prep_dates) > 0 AND LENGTH(exam_dates) > 0 THEN
    gap = MAX(exam_dates) - MIN(prep_dates)
    IF gap > (max_prep + 1) THEN
      warnings.push("Large gap between prep and exam")
    END IF
  END IF
  
  RETURN { errors, warnings }
END FUNCTION
```

---

## Implementation Checklist

### Backend (Database / API)

- [ ] Store prep, exam, and clean dates as separate date fields or arrays
- [ ] Validate order: `prep < exam ≤ clean`
- [ ] Check day counts against norms table
- [ ] Force Expert Assistant prep/clean to 0 during calculation
- [ ] Log warnings for large gaps
- [ ] Reject claims after 6 months of result declaration

### Frontend (UI / Form)

- [ ] Display date pickers for Prep / Exam / Clean (with hints)
- [ ] Show max allowed days dynamically (based on exam type & student count)
- [ ] Warn if dates fall outside order
- [ ] Highlight Expert Assistant rows as "prep/clean not allowed"
- [ ] Show running count: "Prep days: 1/2 allowed"
- [ ] Display gap warnings before submission

### Testing

- [ ] Test valid multi-day exams (e.g., 2 prep, 3-day exam, 1 clean)
- [ ] Test boundary: exactly at max days
- [ ] Test invalid: prep >= exam
- [ ] Test Expert Assistant: ignore prep/clean entries
- [ ] Test backlog mode: enforce 0 cleaning days
- [ ] Test cross-semester claim (should fail)

---

## FAQ

### Q: Can preparation and cleaning happen on the same day as the exam?

**A:** Yes, but only cleaning. Preparation must be strictly **before** the exam. Cleaning can be on the exam day or after.

Example: `Prep: 2024-01-09 | Exam: 2024-01-10 | Clean: 2024-01-10` ✅

### Q: What if the exam spans multiple days?

**A:** Use the **earliest exam date** for prep comparison, and **latest exam date** for cleaning comparison.

Example:
- Prep: 2024-01-08 (must be before 2024-01-09)
- Exam: 2024-01-09, 2024-01-10
- Clean: 2024-01-10 or later ✅

### Q: Can Expert Assistant claim prep/clean days if I accidentally enter them?

**A:** No. The system will force them to ₹0 for prep/clean and only pay per-batch (₹125 × batches).

### Q: Why is there a warning about large gaps?

**A:** To catch data entry errors. If you have a 2-week gap between prep and exam, the dates may have been entered by mistake.

### Q: What is the 6-month deadline?

**A:** Claims must be submitted within **6 months** of result declaration. After 6 months, a 10% penalty applies (if within 1 year). After 1 year, no claim is entertained.

---

## References

- **PCCOE Examinations Remuneration Booklet v-2.1**
  - Part II: Remuneration for Practical/Oral/Term Work
  - Table 2.2.3: Norms for Regular Examinations
  - Table 2.2.4: Norms for Backlog/Re-ETE/Summer Term
  - Part IV, 4.2: Time Limits for Claims

- **Forms referenced:**
  - Expert & Non-Teaching Staff Claim Form
  - Individual Examiner Remuneration Form (PR/OR/TW/Project/Seminar)

---

## Document Info

- **Version:** 1.0
- **Created:** 2026-02-01
- **Applicable from:** A.Y. 2023-24 onwards
- **Status:** Reference Document for Development & QA

---
