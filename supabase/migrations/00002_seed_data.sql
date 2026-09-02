-- Seed Data for Tailor Shop Demo

INSERT INTO shop_settings (id, shop_name, contact_number, address, opening_time, closing_time, slot_duration_minutes, max_customers_per_slot, booking_deposit_amount, upi_id, cancellation_rules)
VALUES (
  1, 
  'Elite Tailors & Designers', 
  '+91 98765 43210', 
  '123 Fashion Street, Silk Board, Bangalore', 
  '09:00:00', 
  '20:00:00', 
  30, 
  3, 
  50.00, 
  'elitetailors@upi', 
  'Cancellations made 2 hours before the appointment are eligible for a refund of the Rs 50 deposit.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (name, is_active) VALUES 
('Saree Blouse', true),
('Chudidar', true),
('Salwar Kameez', true),
('Kurti', true),
('Lehenga', true),
('Gown', true),
('Mens Shirt', true),
('Mens Trouser', true),
('Mens Suit', true),
('School Uniform', true);

INSERT INTO services (name, is_active) VALUES
('New Stitching', true),
('Alteration', true),
('Embroidery', true),
('Aari Work', true),
('Patch Work', true),
('Pattern Design', true),
('Express Delivery (24hrs)', true);
