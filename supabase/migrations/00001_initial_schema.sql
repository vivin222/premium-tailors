-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mobile_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: shop_settings
CREATE TABLE shop_settings (
  id INT PRIMARY KEY DEFAULT 1,
  shop_name TEXT NOT NULL DEFAULT 'Premium Tailors',
  contact_number TEXT NOT NULL DEFAULT '+91 98765 43210',
  address TEXT NOT NULL DEFAULT '123 Fashion Street, City',
  opening_time TIME NOT NULL DEFAULT '09:00:00',
  closing_time TIME NOT NULL DEFAULT '18:00:00',
  slot_duration_minutes INT NOT NULL DEFAULT 30,
  max_customers_per_slot INT NOT NULL DEFAULT 3,
  booking_deposit_amount DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
  upi_id TEXT NOT NULL DEFAULT 'shop@upi',
  cancellation_rules TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Table: categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'Scheduled', -- 'Scheduled', 'Cancelled', 'Completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: blocked_slots
CREATE TABLE blocked_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, time)
);

-- Table: orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_id TEXT UNIQUE NOT NULL, -- e.g. TAIL-2026-0042
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Appointment Booked', 
  -- Statuses: 'Appointment Booked', 'Customer Arrived', 'Measurements Taken', 'Order Confirmed', 'In Progress', 'Ready for Pickup', 'Delivered'
  total_amount DECIMAL(10, 2) DEFAULT 0,
  deposit_amount DECIMAL(10, 2) DEFAULT 50.00,
  delivery_date DATE,
  qr_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: order_items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  service_id UUID REFERENCES services(id),
  quantity INT NOT NULL DEFAULT 1,
  requirements TEXT,
  special_requirements TEXT,
  unit_price DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: measurements
CREATE TABLE measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'in',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type TEXT NOT NULL, -- 'Deposit', 'Balance'
  status TEXT NOT NULL DEFAULT 'Completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) - For demo purposes, we will allow anonymous reads/writes 
-- but in a production app we would use auth.uid(). 
-- Since we want real-time to work easily, we enable replication.

ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for anon/authenticated roles (Demo mode)
CREATE POLICY "Enable all operations for all users" ON shop_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON blocked_slots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON measurements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE shop_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE services;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE blocked_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE measurements;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
