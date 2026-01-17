# Quick Testing Checklist

## 🎯 IMMEDIATE PRIORITY TESTS

### ✅ Faculty Flow (30 min)
1. **Login** → Dashboard loads
2. **Create Teaching Claim** → Fill form → Save Draft → Submit
3. **Create External Claim** → Generate Link → Copy Link
4. **Bank Details** → Add/Edit bank account
5. **View Claims** → Check calculation breakdown
6. **View Rejected Claim** → Read reason

### ✅ Accountant Flow (20 min)
1. **Login** → Dashboard stats correct
2. **View Bills** → Filter by status
3. **Approve Claim** → Review → Approve
4. **Reject Claim** → Enter reason → Submit
5. **Mark as Paid** → Enter transaction details
6. **View External Claim** → Check documents

### ✅ Admin Flow (25 min)
1. **Login** → Dashboard alerts work
2. **View All Claims** → Filter/Search
3. **View Claim Details** → All tabs work
4. **Reject Claim** → Enter reason + policy ref
5. **Send Back** → Enter instructions
6. **Faculty Oversight** → View profile
7. **External Supervision** → Expand row → View documents
8. **Audit Logs** → Filter by action type

---

## 🔍 CRITICAL VALIDATIONS

### Calculations
- [ ] TDS = 10% of total amount
- [ ] Professional Tax = ₹200
- [ ] Net = Total - TDS - PT
- [ ] Minimum rates applied when needed
- [ ] Travel allowance: Local = ₹500 × days

### Documents
- [ ] PAN document uploads
- [ ] Cheque document uploads
- [ ] Travel proof uploads
- [ ] Documents viewable in admin panel
- [ ] Images load correctly

### Permissions
- [ ] Faculty cannot access /accountant routes
- [ ] Accountant cannot access /admin routes
- [ ] Admin cannot edit financial values
- [ ] Only approved claims can be marked paid

### Audit Logging
- [ ] All submissions logged
- [ ] All approvals logged
- [ ] All rejections logged
- [ ] Admin actions show "ADMIN" role
- [ ] Timestamps accurate

---

## 🐛 KNOWN ISSUES TO CHECK

1. **External Link Expiry**: Verify 7-day expiry works
2. **Document Preview**: Check if images load in External Supervision
3. **Calculation Edge Cases**: Test with minimum student count
4. **Role Switching**: Verify logout clears session
5. **Filters**: Ensure all filters work correctly

---

## 📊 TEST DATA NEEDED

### Users
- Faculty: `faculty@test.com` / password
- Accountant: `accountant@test.com` / password
- Admin: `admin@test.com` / password

### Test Claims
- 1 Teaching Internal (Theory, BTECH FY)
- 1 Teaching External (Practical, MTECH)
- 1 Non-Teaching (Exam duties)
- 1 Rejected claim
- 1 Approved claim
- 1 Paid claim

---

## 🚀 START HERE

1. **Open browser** → http://localhost:5173
2. **Login as Faculty** → Test creation flow
3. **Login as Accountant** → Test approval flow
4. **Login as Admin** → Test supervision flow
5. **Report issues** → Document any bugs found

---

## 📝 TESTING NOTES

Use this space to note any issues found:

```
Issue 1: [Description]
- Steps to reproduce:
- Expected behavior:
- Actual behavior:

Issue 2: [Description]
...
```
