-- ===== profiles =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ===== roles =====
create type public.app_role as enum ('admin');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
alter table public.user_roles enable row level security;
create policy "roles_select_own" on public.user_roles for select to authenticated using (auth.uid() = user_id);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

-- ===== categories =====
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "categories_read_all" on public.categories for select using (true);
create policy "categories_admin_write" on public.categories for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;

-- ===== collections =====
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_url text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.collections enable row level security;
create policy "collections_read_all" on public.collections for select using (true);
create policy "collections_admin_write" on public.collections for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
grant select on public.collections to anon, authenticated;
grant insert, update, delete on public.collections to authenticated;
grant all on public.collections to service_role;

-- ===== books =====
create table public.books (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  author text not null,
  short_description text,
  description text,
  cover_url text,
  category_id uuid references public.categories(id) on delete set null,
  collection_id uuid references public.collections(id) on delete set null,
  formats text[] not null default array['ebook']::text[],
  price_ebook numeric(10,2),
  price_print numeric(10,2),
  price_audio numeric(10,2),
  compare_at_ebook numeric(10,2),
  rating numeric(2,1) default 4.5,
  ratings_count int default 0,
  pages int,
  language text default 'English',
  isbn text,
  publisher text,
  publication_date date,
  status text not null default 'published',
  featured boolean not null default false,
  bestseller boolean not null default false,
  new_release boolean not null default true,
  ebook_file_path text,
  audio_file_path text,
  stock_print int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.books enable row level security;
create policy "books_read_published" on public.books for select using (status = 'published' or public.has_role(auth.uid(), 'admin'));
create policy "books_admin_write" on public.books for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
grant select on public.books to anon, authenticated;
grant insert, update, delete on public.books to authenticated;
grant all on public.books to service_role;

-- ===== orders =====
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  status text not null default 'pending',
  currency text not null default 'USD',
  subtotal numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_provider text,
  payment_ref text,
  shipping_name text,
  shipping_address text,
  shipping_city text,
  shipping_country text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
alter table public.orders enable row level security;
create policy "orders_select_own" on public.orders for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "orders_insert_own" on public.orders for insert to authenticated with check (auth.uid() = user_id and status = 'pending');
create policy "orders_admin_update" on public.orders for update to authenticated using (public.has_role(auth.uid(), 'admin'));
grant select, insert on public.orders to authenticated;
grant all on public.orders to service_role;

-- ===== order_items =====
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  book_id uuid references public.books(id) on delete set null,
  title text not null,
  format text not null,
  price numeric(10,2) not null,
  quantity int not null default 1,
  cover_url text
);
alter table public.order_items enable row level security;
create policy "items_select_own" on public.order_items for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(), 'admin')))
);
create policy "items_insert_own_pending" on public.order_items for insert to authenticated with check (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid() and o.status = 'pending')
);
grant select, insert on public.order_items to authenticated;
grant all on public.order_items to service_role;

-- ===== seed categories =====
insert into public.categories (name, slug, description) values
  ('Health & Wellness', 'health-wellness', 'Diets, remedies and guides for a healthier life'),
  ('Business & Money', 'business-money', 'Entrepreneurship, productivity and leadership'),
  ('Self-Help', 'self-help', 'Habits, mindset and personal growth'),
  ('Technology', 'technology', 'Practical guides for everyday devices'),
  ('Cookbooks', 'cookbooks', 'Recipes for every kitchen and goal'),
  ('History & Philosophy', 'history-philosophy', 'Great minds, great ideas');

-- ===== seed collections =====
insert into public.collections (title, slug, description, featured) values
  ('Wellness Starter Bundle', 'wellness-starter-bundle', 'Six essential guides to eat better, move more and feel calmer.', true),
  ('Business Builder Pack', 'business-builder-pack', 'From first idea to first customer — books that grow businesses.', true);

-- ===== seed books (category mapped by slug join) =====
insert into public.books
  (slug, title, subtitle, author, short_description, description, category_id, formats, price_ebook, price_print, price_audio, compare_at_ebook, rating, ratings_count, pages, featured, bestseller, new_release)
select v.slug, v.title, v.subtitle, v.author, v.short_description, v.description, c.id, v.formats::text[], v.price_ebook, v.price_print, v.price_audio, v.compare_at_ebook, v.rating, v.ratings_count, v.pages, v.featured, v.bestseller, v.new_release
from (values
  ('stage-3-kidney-disease-cookbook', 'Stage 3 Kidney Disease Cookbook', '75 kidney-friendly recipes with simple meal plans', 'Dr. Amara Cole', 'Low-sodium, kidney-friendly meals designed for every stage of care.', 'A complete kitchen companion for anyone managing stage 3 kidney disease. Inside you will find 75 carefully crafted recipes with full nutrition breakdowns, a 28-day meal plan, and practical guidance on sodium, potassium and phosphorus — all written in plain language.', 'health-wellness', array['ebook','paperback'], 9.99, 19.99, null, 19.99, 4.8, 132, 214, true, true, true),
  ('simple-mediterranean-diet-cookbook-for-seniors', 'Simple Mediterranean Diet Cookbook for Seniors', 'Easy, heart-healthy recipes for two', 'Livia Marchetti', 'Flavorful Mediterranean meals sized for two, made simple.', 'Mediterranean cooking made effortless for one or two. Sixty-minute recipes, heart-healthy ingredients, and weekly shopping lists designed for seniors who want to eat well without fuss.', 'cookbooks', array['ebook','paperback'], 8.99, 17.99, 14.99, 17.99, 4.7, 98, 188, true, false, true),
  ('think-like-martin-luther-king-jr', 'Think Like Martin Luther King Jr', 'Leadership lessons from a life of conviction', 'Nathan Ellison', 'The mindset behind one of history''s most persuasive leaders.', 'A study of the convictions, speeches and strategies of Martin Luther King Jr., translated into practical lessons on persuasion, courage and leading change in your own life.', 'history-philosophy', array['ebook','paperback','audiobook'], 6.99, 14.99, 12.99, 12.99, 4.9, 210, 172, true, true, false),
  ('vagus-nerve-for-gut-health', 'Vagus Nerve for Gut Health', 'Daily exercises to restore your gut-brain connection', 'Dr. Helen Marsh', 'Gentle daily exercises to calm the gut-brain axis.', 'Understand the vagus nerve''s role in digestion and learn a simple daily practice of breathing, humming and movement exercises that support gut health, reduce bloating and calm the nervous system.', 'health-wellness', array['ebook','paperback','audiobook'], 9.99, 18.99, 15.99, 18.99, 4.6, 87, 196, true, false, true),
  ('anti-inflammatory-cortisol-detox-cookbook', 'The Anti-Inflammatory Cortisol Detox Cookbook', '90 recipes to lower stress and inflammation', 'Maya Reinhardt', 'Anti-inflammatory cooking that lowers stress, meal by meal.', 'Ninety recipes built around ingredients shown to lower inflammation and support balanced cortisol levels, plus a 21-day reset plan and stress-eating journal.', 'cookbooks', array['ebook','paperback'], 10.99, 21.99, null, 21.99, 4.7, 156, 248, true, true, true),
  ('productivity-hack', 'Productivity Hack', 'How to get more done in less time', 'James Okafor', 'Stop managing time. Start managing attention.', 'A focused system for deep work: energy management, the two-minute rule applied correctly, calendar design and a weekly review that actually sticks. Short chapters, immediate actions.', 'business-money', array['ebook','audiobook'], 3.99, null, 7.99, 12.99, 4.7, 79, 124, false, true, false),
  ('iphone-16-guide-for-seniors', 'iPhone 16 Guide for Seniors and Beginners', 'Large-print, step-by-step illustrated instructions', 'Grace Taylor', 'Every iPhone 16 feature explained in plain, large-print steps.', 'Large-print, fully illustrated guide to the iPhone 16 — from first setup to photos, video calls, safety features and privacy, with no jargon and no skipped steps.', 'technology', array['ebook','paperback'], 7.99, 15.99, null, 14.99, 4.8, 64, 232, false, false, true),
  ('rise-to-lead', 'Rise to Lead', 'The quiet leader''s playbook', 'Daniel Mensah', 'Lead without noise: influence, trust and calm authority.', 'A playbook for quiet leaders: building trust, running meetings people respect, giving feedback that lands, and rising without playing politics.', 'business-money', array['ebook','paperback'], 11.99, 22.99, 16.99, 22.99, 4.6, 143, 264, false, false, true),
  ('wall-pilates-workout-for-women', 'Wall Pilates Workout for Women', 'The 28-day low-impact strength plan at home', 'Sofia Berg', 'A 28-day, zero-equipment strength plan for any age.', 'The complete 28-day wall pilates program: illustrated workouts for every day, modifications for beginners and seniors, and a tracker to keep the habit alive.', 'health-wellness', array['ebook','paperback'], 6.99, 13.99, null, 12.99, 4.5, 112, 158, false, true, false),
  ('herbal-antibiotics-antivirals-handbook', 'The Herbal Antibiotics & Antivirals Handbook', 'Nature''s medicine cabinet, used safely and wisely', 'Dr. Iris Nakamura', 'Evidence-informed herbal remedies, prepared safely at home.', 'A safety-first handbook of herbal antibiotics and antivirals: what works, what does not, correct preparation, dosing and when to see a doctor instead.', 'health-wellness', array['ebook','paperback','audiobook'], 9.99, 19.99, 14.99, 19.99, 4.4, 76, 226, false, false, true),
  ('keto-after-70-for-women', 'Keto After 70 for Women', 'The gentle low-carb plan for energy and mobility', 'Ruth Adeyemi', 'Low-carb eating that respects a 70+ body.', 'A gentle ketogenic approach designed for women over 70: bone- and muscle-preserving recipes, easy weekly plans and blood-sugar-friendly swaps.', 'cookbooks', array['ebook','paperback'], 8.99, 16.99, null, 15.99, 4.6, 91, 204, false, false, true),
  ('stoic-mornings', 'Stoic Mornings', '31 daily rituals from the Stoics', 'Aurelio Vance', 'Start every day with two thousand years of wisdom.', 'Thirty-one short morning practices drawn from Marcus Aurelius, Seneca and Epictetus, each with a reflection, a quote and a two-minute exercise.', 'self-help', array['ebook','audiobook'], 5.99, null, 9.99, 9.99, 4.8, 187, 142, false, false, false)
) as v(slug, title, subtitle, author, short_description, description, cat_slug, formats, price_ebook, price_print, price_audio, compare_at_ebook, rating, ratings_count, pages, featured, bestseller, new_release)
join public.categories c on c.slug = v.cat_slug;

update public.books set collection_id = (select id from public.collections where slug = 'wellness-starter-bundle')
where slug in ('stage-3-kidney-disease-cookbook','simple-mediterranean-diet-cookbook-for-seniors','vagus-nerve-for-gut-health','anti-inflammatory-cortisol-detox-cookbook','wall-pilates-workout-for-women','herbal-antibiotics-antivirals-handbook');
update public.books set collection_id = (select id from public.collections where slug = 'business-builder-pack')
where slug in ('productivity-hack','rise-to-lead','think-like-martin-luther-king-jr','stoic-mornings');
