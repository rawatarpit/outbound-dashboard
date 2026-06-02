-- RLS policies for discovered_companies
create policy "Users can view their own client's discovered companies"
on public.discovered_companies
for select
using (
  client_id = public.client_id()
);

create policy "Service role can manage all discovered companies"
on public.discovered_companies
to service_role
using (true)
with check (true);

-- RLS policies for discovered_contacts
create policy "Users can view their own client's discovered contacts"
on public.discovered_contacts
for select
using (
  client_id = public.client_id()
);

create policy "Service role can manage all discovered contacts"
on public.discovered_contacts
to service_role
using (true)
with check (true);

-- RLS policies for brand_discovery_sources
create policy "Users can view their own client's discovery sources"
on public.brand_discovery_sources
for select
using (
  client_id = public.client_id()
);

create policy "Service role can manage all discovery sources"
on public.brand_discovery_sources
to service_role
using (true)
with check (true);

-- RLS policies for companies
create policy "Users can view their own client's companies"
on public.companies
for select
using (
  client_id = public.client_id()
);

create policy "Service role can manage all companies"
on public.companies
to service_role
using (true)
with check (true);

-- RLS policies for leads
create policy "Users can view their own client's leads"
on public.leads
for select
using (
  client_id = public.client_id()
);

create policy "Service role can manage all leads"
on public.leads
to service_role
using (true)
with check (true);

-- RLS policies for opportunities
create policy "Users can view their own brand's opportunities"
on public.opportunities
for select
using (
  brand_id in (
    select id from public.brand_profiles where client_id = public.client_id()
  )
);

create policy "Service role can manage all opportunities"
on public.opportunities
to service_role
using (true)
with check (true);

-- RLS policies for activity_logs
create policy "Users can view their own client's activity logs"
on public.activity_logs
for select
using (
  client_id = public.client_id()
);

create policy "Service role can manage all activity logs"
on public.activity_logs
to service_role
using (true)
with check (true);
