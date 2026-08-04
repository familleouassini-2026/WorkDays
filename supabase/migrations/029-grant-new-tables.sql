-- employee_documents
GRANT ALL ON employee_documents TO anon;
GRANT ALL ON employee_documents TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE employee_documents_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE employee_documents_id_seq TO authenticated;
ALTER TABLE employee_documents DISABLE ROW LEVEL SECURITY;

-- notifications
GRANT ALL ON notifications TO anon;
GRANT ALL ON notifications TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE notifications_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE notifications_id_seq TO authenticated;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- leave_requests
GRANT ALL ON leave_requests TO anon;
GRANT ALL ON leave_requests TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE leave_requests_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE leave_requests_id_seq TO authenticated;
ALTER TABLE leave_requests DISABLE ROW LEVEL SECURITY;
