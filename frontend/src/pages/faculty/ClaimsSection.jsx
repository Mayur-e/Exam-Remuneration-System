import { motion, AnimatePresence } from "framer-motion";
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="p-6 bg-card border-border">
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CalculatorIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            </motion.div>
            <p className="text-muted-foreground">Please complete exam details first to view claim calculation</p>
          </div>
        </Card>
      </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-card border-border">
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <motion.div
            className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <CalculatorIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          </motion.div>
          <div>
            <h3 className="text-xl font-semibold text-card-foreground">Claim Calculation</h3>
            <p className="text-sm text-muted-foreground">Teaching Staff Remuneration Details</p>
          </div>
        </motion.div>

        {/* Exam Details Summary */}
        <motion.div
          className="mb-6 p-4 bg-muted rounded-lg border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <BookOpenIcon className="w-4 h-4" />
            Exam Information
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Exam Type</p>
              <p className="font-semibold text-foreground">{exam_type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Program</p>
              <p className="font-semibold text-foreground">{program}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Level</p>
              <p className="font-semibold text-foreground">{level}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">No. of Students</p>
              <motion.p
                className="font-semibold text-foreground flex items-center gap-1"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <UsersIcon className="w-4 h-4" />
                {students_count}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Rate Information */}
        <AnimatePresence mode="wait">
          {rate ? (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <CurrencyRupeeIcon className="w-4 h-4" />
                  Rate Information
                </h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-700 dark:text-blue-300">Applicable Rate:</span>
                  <motion.span
                    className="font-bold text-blue-800 dark:text-blue-200 text-lg"
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    ₹{rate} per student
                  </motion.span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Based on {program} - {level} - {exam_type}
                </div>
              </motion.div>

              {/* Amount Calculation */}
              <motion.div
                className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                  <CalculatorIcon className="w-4 h-4" />
                  Amount Calculation
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Base Calculation:</span>
                    <span className="text-foreground">
                      {rate} × {students_count} students
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Base Amount:</span>
                    <motion.span
                      className="font-medium text-foreground"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      ₹{baseAmount.toFixed(2)}
                    </motion.span>
                  </div>

                  <AnimatePresence>
                    {minAmount && baseAmount < minAmount && (
                      <motion.div
                        className="flex justify-between items-center pt-2 border-t border-green-300 dark:border-green-700"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <span className="text-sm text-muted-foreground">Minimum Amount:</span>
                        <span className="font-medium text-green-700 dark:text-green-300">₹{minAmount}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-between items-center pt-3 border-t border-green-300 dark:border-green-700 mt-2">
                    <span className="font-semibold text-foreground">Final Payable:</span>
                    <motion.span
                      className="text-xl font-bold text-green-700 dark:text-green-300"
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
                    >
                      ₹{finalAmount.toFixed(2)}
                    </motion.span>
                  </div>
                </div>
              </motion.div>

              {/* Important Notes */}
              <motion.div
                className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-start gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, 0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <InfoIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  </motion.div>
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">Important Notes</h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                      <li>• Minimum remuneration per day: ₹{minAmount || 250}</li>
                      <li>• TDS @10% will be deducted from final amount</li>
                      <li>• Final approval subject to department verification</li>
                      <li>• Payment processed within 7-10 working days after approval</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <InfoIcon className="w-6 h-6 text-red-500 dark:text-red-400" />
              </motion.div>
              <h4 className="text-red-700 dark:text-red-400 font-medium mb-2">Rate Not Configured</h4>
              <p className="text-sm text-muted-foreground">
                No rate found for {program} - {level} - {exam_type}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Please contact the admin department to configure rates for this exam type.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}