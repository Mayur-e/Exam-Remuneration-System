export default function ClaimsSection({ exam }) {
  if (!exam) return null;

  const { exam_type, program, level, students_count } = exam;

  /**
   * Teaching staff rate mapping (DISPLAY ONLY)
   * Backend (remuneration_rates) remains authoritative. [file:4][file:5]
   *
   * This table covers all per-student examiner rates from the remuneration booklet
   * and the seeded remuneration_rates rows. [file:1][file:4]
   */
  const rateTable = {
    // ------------------------
    // Core practical heads
    // ------------------------
    PR: {
      // Practical: Examining (PR)
      // remuneration_rates: ('PR', 30, 35, 58, 500) [file:4]
      BTECH: { FY: 30, SY: 30, TY: 35, FINAL: 35 },
      BVOC:  { FY: 30, SY: 30, TY: 35 },
      MTECH: 58,   // M.Tech PR (mtech_mca_rate) [file:4]
      MCA:   58,   // MCA PR (mtech_mca_rate) [file:4]
      min: 500
    },

    OR: {
      // Practical: Examining (OR)
      // Booklet: 18 (B.Tech/B.Voc/MCA), 25 (M.Tech) – you overrode for TY/final. [file:1]
      BTECH: { FY: 18, SY: 18, TY: 25, FINAL: 25 },
      BVOC:  { FY: 18, SY: 18, TY: 25 },
      // In DB we stored mtech_mca_rate = 30 for OR, but UI shows 35 as per your correction. [file:4]
      MTECH: 35,
      MCA:   35,
      min: 500
    },

    TW: {
      // Practical / MOOCs / Entrepreneurship: Examining (TW)
      // remuneration_rates: ('TW', 18, 25, 30, 500) [file:4]
      BTECH: { FY: 18, SY: 18, TY: 25, FINAL: 25 },
      BVOC:  { FY: 18, SY: 18, TY: 25 },
      MTECH: 30,
      MCA:   30,
      min: 500
    },

    // ------------------------
    // B.Tech Seminar / Mini / Stage1 / Stage2
    // ------------------------
    Project_Seminar_MiniProject: {
      // DB row for generic B.Tech seminar / mini-project (TY & FINAL) [file:4]
      // ('Project_Seminar_MiniProject', NULL, 58, NULL, 500)
      BTECH: { TY: 58, FINAL: 58 },
      min: 500
    },

    BTech_Project_Stage1: {
      // B.Tech Project Stage 1 (TW + OR) – 3rd & Final year [file:1]
      // remuneration_rates: ('BTech_Project_Stage1', 100, NULL, 250, 500) [file:4]
      BTECH: { TY: 100, FINAL: 100 },
      // If you ever encode M.Tech/MCA project stage 1 via this type, mtech_mca_rate=250 exists in DB. [file:4]
      MTECH: 250,
      min: 500
    },

    BTech_Project_Stage2: {
      // B.Tech Dissertation / Project Stage 2 – 3rd & Final year [file:1]
      // remuneration_rates: ('BTech_Project_Stage2', 200, NULL, 500, 500) [file:4]
      BTECH: { FINAL: 200 },
      MTECH: 500, // if reused for PG in DB
      min: 500
    },

    // ------------------------
    // M.Tech specific heads
    // ------------------------
    MTech_MiniProject: {
      // M.Tech Mini Project / Internship [file:1]
      // ('MTech_MiniProject', NULL, NULL, 125, 500) [file:4]
      MTECH: 125,
      min: 500
    },

    MTech_Seminar: {
      // M.Tech Seminar [file:1]
      // ('MTech_Seminar', NULL, NULL, 125, 500) [file:4]
      MTECH: 125,
      min: 500
    },

    MTech_Project_Stage1: {
      // M.Tech Dissertation / Project Stage 1 [file:1]
      // ('MTech_Project_Stage1', NULL, NULL, 260, 500) [file:4]
      MTECH: 260,
      min: 500
    },

    MTech_Dissertation: {
      // M.Tech Dissertation / Project Stage 2 [file:1]
      // ('MTech_Dissertation', NULL, NULL, 490, 500) [file:4]
      MTECH: 490,
      min: 500
    },

    // ------------------------
    // MCA specific heads
    // ------------------------
    MCA_MiniProject: {
      // MCA Mini Project [file:1]
      // ('MCA_MiniProject', NULL, NULL, 58, 500) [file:4]
      MCA: 58,
      min: 500
    },

    MCA_MajorProject: {
      // MCA Major Project [file:1]
      // ('MCA_MajorProject', NULL, NULL, 250, 500) [file:4]
      MCA: 250,
      min: 500
    },

    // ------------------------
    // Audit / Life Skill / PDT
    // ------------------------
    Audit_Course: {
      // Audit / Life Skill / Professional Development [file:1]
      // ('Audit_Course', 5, 5, 5, 250) [file:4]
      BTECH: 5,
      BVOC:  5,
      MTECH: 5,
      MCA:   5,
      min: 250
    }
  };

  const resolveRate = () => {
    const cfg = rateTable[exam_type];
    if (!cfg) return null;

    // If direct numeric mapped to program (e.g. MTECH: 125)
    if (typeof cfg[program] === "number") {
      return cfg[program];
    }

    // If program is an object with level keys
    if (typeof cfg[program] === "object") {
      // level may be 'FY','SY','TY','FINAL','TERMINAL' etc.
      return (
        cfg[program][level] ||
        cfg[program].ALL || // fallback if you add ALL later
        null
      );
    }

    return null;
  };

  const rate = resolveRate();
  const minAmount = rateTable[exam_type]?.min;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Claim Details (Teaching Staff)</h3>

      <div className="border rounded-md p-4 space-y-2">
        <p><strong>Exam Type:</strong> {exam_type}</p>
        <p><strong>Program:</strong> {program}</p>
        <p><strong>Level:</strong> {level}</p>
        <p><strong>No. of Students:</strong> {students_count}</p>

        {rate && (
          <p>
            <strong>Applicable Rate:</strong> ₹{rate} per student
          </p>
        )}

        {minAmount && (
          <p className="text-sm text-muted-foreground">
            Minimum remuneration per day: ₹{minAmount}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Final payable amount will be calculated by the system after submission.
        </p>
      </div>
    </div>
  );
}
