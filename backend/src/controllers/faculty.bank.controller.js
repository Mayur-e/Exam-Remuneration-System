const pool = require("../config/db");

exports.getBank = async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM faculty_bank_accounts WHERE faculty_id = $1",
    [req.user.id]
  );
  res.json(result.rows[0] || null);
};

exports.saveBank = async (req, res) => {
  const {
    account_holder_name,
    bank_name,
    branch_name,
    account_number,
    ifsc_code,
    pan_number
  } = req.body;

  await pool.query(`
    INSERT INTO faculty_bank_accounts
    (faculty_id, account_holder_name, bank_name, branch_name,
     account_number, ifsc_code, pan_number)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    ON CONFLICT (faculty_id)
    DO UPDATE SET
      account_holder_name = EXCLUDED.account_holder_name,
      bank_name = EXCLUDED.bank_name,
      branch_name = EXCLUDED.branch_name,
      account_number = EXCLUDED.account_number,
      ifsc_code = EXCLUDED.ifsc_code,
      pan_number = EXCLUDED.pan_number,
      updated_at = now()
  `, [
    req.user.id,
    account_holder_name,
    bank_name,
    branch_name,
    account_number,
    ifsc_code,
    pan_number
  ]);

  res.json({ message: "Bank details saved" });
};
