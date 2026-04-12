-- Allow authenticated users to read contact submissions
CREATE POLICY "Authenticated users can view contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to read demo bookings
CREATE POLICY "Authenticated users can view demo bookings"
ON public.demo_bookings
FOR SELECT
TO authenticated
USING (true);