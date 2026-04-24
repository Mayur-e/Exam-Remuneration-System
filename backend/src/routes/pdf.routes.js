const express = require('express');
const router = express.Router();
const { createAuthMiddleware } = require('../middleware/enhancedAuthMiddleware');
const pdfController = require('../controllers/pdf.controller');

// Authentication middleware for PDF routes
const authenticate = createAuthMiddleware({
  allowQueryToken: true,  // Allow token in query params for download links
  auditLog: true
});

// All PDF routes require authentication
router.use(authenticate);

// Download PDF for a claim
router.get('/claim/:examId/download', pdfController.downloadClaimPDF);

// Preview HTML (for development)
router.get('/claim/:examId/preview', pdfController.previewClaimHTML);

// Download Non-Teaching PDF
router.get('/non-teaching/:examId/download', pdfController.downloadNonTeachingPDF);

// Preview Non-Teaching HTML (for development)
router.get('/non-teaching/:examId/preview', pdfController.previewNonTeachingHTML);

module.exports = router;

