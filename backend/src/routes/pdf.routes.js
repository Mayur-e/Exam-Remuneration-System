const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdf.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Download PDF for a claim
router.get('/claim/:examId/download', authMiddleware, pdfController.downloadClaimPDF);

// Preview HTML (for development)
router.get('/claim/:examId/preview', authMiddleware, pdfController.previewClaimHTML);

// Download Non-Teaching PDF
router.get('/non-teaching/:examId/download', authMiddleware, pdfController.downloadNonTeachingPDF);

// Preview Non-Teaching HTML (for development)
router.get('/non-teaching/:examId/preview', authMiddleware, pdfController.previewNonTeachingHTML);

module.exports = router;

