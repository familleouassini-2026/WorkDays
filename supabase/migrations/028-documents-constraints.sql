-- Add file size constraint (2 MB = 2097152 bytes) and index for employee_documents
ALTER TABLE employee_documents
  ADD CONSTRAINT chk_file_size CHECK (file_size IS NULL OR file_size <= 2097152);

-- Guard against oversized base64 payloads (2 MB file ~ 2.7 MB base64, cap at 3.7 MB text)
ALTER TABLE employee_documents
  ADD CONSTRAINT chk_file_base64_length CHECK (file_base64 IS NULL OR length(file_base64) <= 3700000);

CREATE INDEX idx_employee_documents_employee_id ON employee_documents(employee_id);
