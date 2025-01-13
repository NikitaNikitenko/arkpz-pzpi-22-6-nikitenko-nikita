-- Create users preferences table
create table if not exists public.user_preferences (
  id uuid references auth.users on delete cascade not null primary key,
  email_alerts boolean default false,
  sms_alerts boolean default false,
  push_notifications boolean default true,
  emergency_mode boolean default true,
  community_alerts boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_preferences enable row level security;

-- Create policies
create policy "Users can view their own preferences"
  on public.user_preferences for select
  using ( auth.uid() = id );

create policy "Users can update their own preferences"
  on public.user_preferences for update
  using ( auth.uid() = id );

create policy "Users can insert their own preferences"
  on public.user_preferences for insert
  with check ( auth.uid() = id );

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_preferences (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();