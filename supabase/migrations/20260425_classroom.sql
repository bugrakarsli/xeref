CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  duration_minutes INT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can read published courses" ON courses FOR SELECT USING (published = true);
CREATE POLICY "admin can manage courses" ON courses FOR ALL USING (auth.email() IN ('bugra@bugrakarsli.com', 'bugra@xeref.ai'));

CREATE POLICY "anyone can read modules" ON modules FOR SELECT USING (true);
CREATE POLICY "admin can manage modules" ON modules FOR ALL USING (auth.email() IN ('bugra@bugrakarsli.com', 'bugra@xeref.ai'));

CREATE POLICY "anyone can read lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "admin can manage lessons" ON lessons FOR ALL USING (auth.email() IN ('bugra@bugrakarsli.com', 'bugra@xeref.ai'));

CREATE POLICY "users own their progress" ON lesson_progress FOR ALL USING (auth.uid() = user_id);
