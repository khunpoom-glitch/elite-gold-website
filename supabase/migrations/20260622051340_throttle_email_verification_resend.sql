create or replace function public.create_elite_email_verification_token(
  input_token_hash text,
  input_expires_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  recent_token_created_at timestamptz;
begin
  if current_user_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if input_token_hash is null or input_token_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid token hash' using errcode = '22023';
  end if;

  if input_expires_at is null or input_expires_at <= now() then
    raise exception 'Invalid token expiry' using errcode = '22023';
  end if;

  select created_at
  into recent_token_created_at
  from private.email_verification_tokens
  where user_id = current_user_id
    and used_at is null
    and created_at > now() - interval '90 seconds'
  order by created_at desc
  limit 1;

  if recent_token_created_at is not null then
    raise exception 'email_verification_cooldown'
      using
        errcode = 'P0001',
        detail = 'Please wait before requesting another verification email.';
  end if;

  update private.email_verification_tokens
  set used_at = now()
  where user_id = current_user_id
    and used_at is null;

  insert into private.email_verification_tokens (
    user_id,
    token_hash,
    expires_at
  )
  values (
    current_user_id,
    input_token_hash,
    input_expires_at
  );
end;
$$;

revoke all on function public.create_elite_email_verification_token(text, timestamptz) from public;
revoke all on function public.create_elite_email_verification_token(text, timestamptz) from anon;
grant execute on function public.create_elite_email_verification_token(text, timestamptz) to authenticated;
