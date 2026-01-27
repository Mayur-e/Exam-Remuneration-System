const fs = require('fs');
const path = 'd:/Bill/exam-remuneration-system/frontend/src/pages/accountant/BillView.jsx';
const content = fs.readFileSync(path, 'utf8');

const startMarker = '{/* Staff Table for Non-Teaching Claims */}';
const endMarker = '{/* Payment Record Display if Paid */}';
const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `{/* Bill Summary */}
          <div className="lg:col-span-2">
            <BillSummary 
                examId={exam.id} 
                billData={data.calculation} 
                claimType={exam.claim_form_type}
            />
          </div>

          `;
    const newContent = content.substring(0, startIdx) + replacement + content.substring(endIdx);
    fs.writeFileSync(path, newContent);
    console.log('Successfully replaced content');
} else {
    console.log('Markers not found');
    console.log('Start:', startIdx, 'End:', endIdx);
}
