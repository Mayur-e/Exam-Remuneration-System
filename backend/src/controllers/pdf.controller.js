const pdfService = require('../services/pdf.service');
const { getClaimFormHTML } = require('../templates/claim-form.html');

/**
 * Download PDF for a claim
 */
exports.downloadClaimPDF = async (req, res) => {
    try {
        const examId = req.params.examId;

        // Fetch claim data
        const claimData = await pdfService.fetchClaimData(examId);

        // Generate PDF
        const pdfBuffer = await pdfService.generateClaimForm(claimData);

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="claim-${examId}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send PDF
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF download error:', error);
        res.status(500).json({
            message: 'Failed to generate PDF',
            error: error.message
        });
    }
};

/**
 * Preview HTML (for development/testing)
 */
exports.previewClaimHTML = async (req, res) => {
    try {
        const examId = req.params.examId;

        // Fetch claim data
        const claimData = await pdfService.fetchClaimData(examId);

        // Get HTML
        const htmlContent = getClaimFormHTML(claimData);

        // Send HTML for preview
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlContent);
    } catch (error) {
        console.error('HTML preview error:', error);
        res.status(500).json({
            message: 'Failed to generate preview',
            error: error.message
        });
    }
};

/**
 * Download Non-Teaching PDF
 */
exports.downloadNonTeachingPDF = async (req, res) => {
    try {
        const examId = req.params.examId;

        // Fetch non-teaching data
        const claimData = await pdfService.fetchNonTeachingData(examId);

        // Generate PDF
        const pdfBuffer = await pdfService.generateNonTeachingForm(claimData);

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="non-teaching-claim-${examId}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send PDF
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Non-teaching PDF download error:', error);
        res.status(500).json({
            message: 'Failed to generate non-teaching PDF',
            error: error.message
        });
    }
};

/**
 * Preview Non-Teaching HTML
 */
exports.previewNonTeachingHTML = async (req, res) => {
    try {
        const examId = req.params.examId;
        const { getNonTeachingFormHTML } = require('../templates/non-teaching-form.html');

        // Fetch non-teaching data
        const claimData = await pdfService.fetchNonTeachingData(examId);

        // Get HTML
        const htmlContent = getNonTeachingFormHTML(claimData);

        // Send HTML for preview
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlContent);
    } catch (error) {
        console.error('Non-teaching HTML preview error:', error);
        res.status(500).json({
            message: 'Failed to generate non-teaching preview',
            error: error.message
        });
    }
};
