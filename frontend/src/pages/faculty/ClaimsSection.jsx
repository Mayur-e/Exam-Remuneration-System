import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

// Icons
import {
  CalculatorIcon,
  UsersIcon,
  GraduationCapIcon,
  BookOpenIcon,
  CurrencyRupeeIcon,
  InfoIcon,
  CheckCircleIcon
} from "../../components/icons/logo";

export default function ClaimsSection({ exam }) {
  if (!exam) {
    return (
      <Card className="p-6 bg-white border-gray-200">
        <div className="text-center py-8">
          <CalculatorIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Please complete exam details first to view claim calculation</p>
        </div>
      </Card>
    );
  }

  const { exam_type, program, level, students_count } = exam;

  /**
   * Teaching staff rate mapping (DISPLAY ONLY)
   * Backend (remuneration_rates) remains authoritative.
   */
  const rateTable = {
    // ------------------------
    // Core practical heads
    // ------------------------
    PR: {
      // Practical: Examining (PR)
      BTECH: { FY: 30, SY: 30, TY: 35, FINAL: 35 },
      BVOC: { FY: 30, SY: 30, TY: 35 },
      MTECH: 58,
      MCA: 58,
      min: 500
    },

    OR: {
      // Practical: Examining (OR)
      BTECH: { FY: 18, SY: 18, TY: 25, FINAL: 25 },
      BVOC: { FY: 18, SY: 18, TY: 25 },
      MTECH: 35,
      MCA: 35,
      min: 500
    },

    TW: {
      // Practical / MOOCs / Entrepreneurship: Examining (TW)
      BTECH: { FY: 18, SY: 18, TY: 25, FINAL: 25 },
      BVOC: { FY: 18, SY: 18, TY: 25 },
      MTECH: 30,
      MCA: 30,
      min: 500
    },

    // ------------------------
    // B.Tech Seminar / Mini / Stage1 / Stage2
    // ------------------------
    Project_Seminar_MiniProject: {
      BTECH: { TY: 58, FINAL: 58 },
      min: 500
    },

    BTech_Project_Stage1: {
      BTECH: { TY: 100, FINAL: 100 },
      MTECH: 250,
      min: 500
    },

    BTech_Project_Stage2: {
      BTECH: { FINAL: 200 },
      MTECH: 500,
      min: 500
    },

    // ------------------------
    // M.Tech specific heads
    // ------------------------
    MTech_MiniProject: {
      MTECH: 125,
      min: 500
    },

    MTech_Seminar: {
      MTECH: 125,
      min: 500
    },

    MTech_Project_Stage1: {
      MTECH: 260,
      min: 500
    },

    MTech_Dissertation: {
      MTECH: 490,
      min: 500
    },

    // ------------------------
    // MCA specific heads
    // ------------------------
    MCA_MiniProject: {
      MCA: 58,
      min: 500
    },

    MCA_MajorProject: {
      MCA: 250,
      min: 500
    },

    // ------------------------
    // Audit / Life Skill / PDT
    // ------------------------
    Audit_Course: {
      BTECH: 5,
      BVOC: 5,
      MTECH: 5,
      MCA: 5,
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
      return cfg[program][level] || null;
    }

    return null;
  };

  const rate = resolveRate();
  const minAmount = rateTable[exam_type]?.min;

  // Calculate amounts
  const students = Number(students_count) || 0;
  const baseAmount = rate ? rate * students : 0;
  const finalAmount = Math.max(baseAmount, minAmount || 0);

  return (
    <Card className="p-6 bg-white border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
          <CalculatorIcon className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Claim Calculation</h3>
          <p className="text-sm text-gray-600">Teaching Staff Remuneration Details</p>
        </div>
      </div>

      {/* Exam Details Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
          <BookOpenIcon className="w-4 h-4" />
          Exam Information
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500">Exam Type</p>
            <p className="font-semibold text-gray-800">{exam_type}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Program</p>
            <p className="font-semibold text-gray-800">{program}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Level</p>
            <p className="font-semibold text-gray-800">{level}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">No. of Students</p>
            <p className="font-semibold text-gray-800 flex items-center gap-1">
              <UsersIcon className="w-4 h-4" />
              {students_count}
            </p>
          </div>
        </div>
      </div>

      {/* Rate Information */}
      {rate ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
              <CurrencyRupeeIcon className="w-4 h-4" />
              Rate Information
            </h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700">Applicable Rate:</span>
              <span className="font-bold text-blue-800 text-lg">₹{rate} per student</span>
            </div>
            <div className="text-xs text-blue-600">
              Based on {program} - {level} - {exam_type}
            </div>
          </div>

          {/* Amount Calculation */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
              <CalculatorIcon className="w-4 h-4" />
              Amount Calculation
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Base Calculation:</span>
                <span className="text-gray-800">
                  {rate} × {students_count} students
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Base Amount:</span>
                <span className="font-medium text-gray-800">₹{baseAmount.toFixed(2)}</span>
              </div>

              {minAmount && baseAmount < minAmount && (
                <div className="flex justify-between items-center pt-2 border-t border-green-300">
                  <span className="text-sm text-gray-600">Minimum Amount:</span>
                  <span className="font-medium text-green-700">₹{minAmount}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-green-300 mt-2">
                <span className="font-semibold text-gray-800">Final Payable:</span>
                <span className="text-xl font-bold text-green-700">
                  ₹{finalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <InfoIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">Important Notes</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Minimum remuneration per day: ₹{minAmount || 250}</li>
                  <li>• TDS @10% will be deducted from final amount</li>
                  <li>• Final approval subject to department verification</li>
                  <li>• Payment processed within 7-10 working days after approval</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Ready Indicator */}

        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <InfoIcon className="w-6 h-6 text-red-500" />
          </div>
          <h4 className="text-red-700 font-medium mb-2">Rate Not Configured</h4>
          <p className="text-sm text-gray-600">
            No rate found for {program} - {level} - {exam_type}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Please contact the admin department to configure rates for this exam type.
          </p>
        </div>
      )}
    </Card>
  );
}