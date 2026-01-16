-- Fix incorrect file paths for existing uploads in external_examiners table

-- Fix PAN document URLs
UPDATE external_examiners
SET pan_document_url = REPLACE(pan_document_url, '/uploads/', '/uploads/external/pan/')
WHERE pan_document_url LIKE '/uploads/%' 
  AND pan_document_url NOT LIKE '/uploads/external/%';

-- Fix Cancelled Cheque URLs
UPDATE external_examiners
SET cancelled_cheque_url = REPLACE(cancelled_cheque_url, '/uploads/', '/uploads/external/cheque/')
WHERE cancelled_cheque_url LIKE '/uploads/%' 
  AND cancelled_cheque_url NOT LIKE '/uploads/external/%';

-- Fix Travel Proof URLs (if any exist with old path)
UPDATE external_examiners
SET travel_proof_url = REPLACE(travel_proof_url, '/uploads/', '/uploads/external/travel/')
WHERE travel_proof_url LIKE '/uploads/%' 
  AND travel_proof_url NOT LIKE '/uploads/external/%';
