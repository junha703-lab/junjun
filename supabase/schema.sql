create table if not exists public.student_records (
  id uuid primary key default gen_random_uuid(),
  student_grade text not null,
  subject text not null,
  title text not null,
  content text not null,
  tags text[] default '{}',
  saved_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.student_records enable row level security;

drop policy if exists "Allow public record reads" on public.student_records;
drop policy if exists "Allow public record inserts" on public.student_records;

create policy "Allow public record reads"
  on public.student_records for select
  to anon, authenticated using (true);

create policy "Allow public record inserts"
  on public.student_records for insert
  to anon, authenticated with check (true);

-- 로그인 기능을 추가할 때에는 위의 공개 정책을 제거하고 사용자별 정책으로 교체하세요.

