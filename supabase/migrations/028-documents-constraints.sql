-- Add file size constraint (2 MB = 2097152 bytes) and index for employee_documents
ALTER TABLE employee_documents
  ADD CONSTRAINT chk_file_size CHECK (file_size IS NULL OR file_size <= 2097152);

CREATE INDEX idx_employee_documents_employee_id ON employee_documents(employee_id);
