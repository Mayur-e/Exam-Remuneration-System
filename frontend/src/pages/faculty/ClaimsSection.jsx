import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

// Icons
import {
  CalculatorIcon,
  UsersIcon,
  BookOpenIcon,
  CurrencyRupeeIcon,
  InfoIcon,
} from "../../components/icons/logo";

/**
 * ClaimsSection
 * Fetches the live rate preview from the backend for the given examId.
 * Renders a loading skeleton, an error/not-configured state, or the
 * full rate + calculation breakdown.
 */
export default function ClaimsSection({ examId, exam }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!examId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setPreview(null);

    api
      .get(`/faculty/exams/${examId}/rate-preview`)
      .then((res) => {
        if (!cancelled) setPreview(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg =
            err?.response?.data?.message ||
            "Failed to load rate information. Please try again.";
          setError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [examId]);

  // ── No exam selected ──────────────────────────────────────────────
  if (!examId && !exam) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="p-8">
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CalculatorIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            </motion.div>
            <p className="text-muted-foreground">
              Please complete exam details first to view claim calculation
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 space-y-4"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
            <div className="h-3 w-56 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-lg border border-border animate-pulse bg-muted/30 space-y-3"
          >
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-3/4 bg-muted rounded" />
          </div>
        ))}
      </motion.div>
    );
  }

  // ── Error / rate not configured ───────────────────────────────────
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8"
      >
        <div className="text-center py-6">
          <motion.div
            className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <InfoIcon className="w-6 h-6 text-red-500 dark:text-red-400" />
          </motion.div>
          <h4 className="text-red-700 dark:text-red-400 font-medium mb-2">
            Rate Not Configured
          </h4>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Please contact the admin department to configure rates for this exam
            type.
          </p>
        </div>
      </motion.div>
    );
  }

  if (!preview) return null;

  const {
    exam_type,
    program,
    level,
    students_count,
    applicable_rate,
    min_per_day,
    gross_amount,
    final_amount,
    tds_amount,
    net_amount,
    min_applied,
    academic_year,
  } = preview;

  const fmt = (n) =>
    Number(n).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-8">
        {/* Section Header */}
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
            <h3 className="text-xl font-semibold text-card-foreground">
              Claim Calculation
            </h3>
            <p className="text-sm text-muted-foreground">
              Live preview based on current institutional rates
              {academic_year && (
                <span className="ml-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  ({academic_year})
                </span>
              )}
            </p>
          </div>
        </motion.div>

        <div className="space-y-4">
          {/* Exam Details Summary */}
          <motion.div
            className="p-4 bg-muted rounded-lg border border-border"
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
                <p className="font-semibold text-foreground">{level || "—"}</p>
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
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Applicable Rate:
              </span>
              <motion.span
                className="font-bold text-blue-800 dark:text-blue-200 text-lg"
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                ₹{applicable_rate} per student
              </motion.span>
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Based on{" "}
              <span className="font-semibold">
                {program} {level ? `(${level})` : ""} — {exam_type}
              </span>
            </div>
          </motion.div>

          {/* Amount Breakdown */}
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
                <span className="text-sm text-muted-foreground">
                  Base Calculation:
                </span>
                <span className="text-foreground text-sm">
                  ₹{applicable_rate} × {students_count} students
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Base Amount:
                </span>
                <motion.span
                  className="font-medium text-foreground"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  ₹{fmt(gross_amount)}
                </motion.span>
              </div>

              <AnimatePresence>
                {min_applied && (
                  <motion.div
                    className="flex justify-between items-center pt-2 border-t border-green-300 dark:border-green-700"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                      Minimum Allowance Applied:
                    </span>
                    <span className="font-medium text-amber-700 dark:text-amber-400">
                      ₹{fmt(min_per_day)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center pt-2 border-t border-green-200 dark:border-green-700">
                <span className="text-sm text-muted-foreground">
                  Gross Payable:
                </span>
                <span className="font-medium text-foreground">
                  ₹{fmt(final_amount)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-red-600 dark:text-red-400">
                  TDS @ 10%:
                </span>
                <span className="text-sm text-red-600 dark:text-red-400">
                  − ₹{fmt(tds_amount)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-green-300 dark:border-green-700 mt-2">
                <span className="font-semibold text-foreground">
                  Net Amount:
                </span>
                <motion.span
                  className="text-xl font-bold text-green-700 dark:text-green-300"
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
                >
                  ₹{fmt(net_amount)}
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Notes */}
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
                <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                  Important Notes
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                  <li>
                    • Minimum remuneration per day: ₹{fmt(min_per_day)}
                  </li>
                  <li>• TDS @10% will be deducted from the gross amount</li>
                  <li>• This is a preview — final amount is confirmed on submission</li>
                  <li>• Final approval subject to department verification</li>
                  <li>• Payment processed within 7-10 working days after approval</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}