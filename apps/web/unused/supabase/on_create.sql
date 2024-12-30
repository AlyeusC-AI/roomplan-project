begin
  insert into public."User"(id, "firstName", "lastName", email, "inviteId", "isSupportUser")
  values(new.id, new.raw_user_meta_data->>'firstName',  new.raw_user_meta_data->>'lastName', new.email, new.raw_user_meta_data->>'inviteId', Cast(new.raw_user_meta_data->>'isSupportUser' as boolean));
  if (new.raw_user_meta_data->>'orgId') is not null then
    insert into public."UserToOrganization"("organizationId", "userId")
    values(CAST (new.raw_user_meta_data->>'orgId' as INTEGER),  new.id);
  end if;
  return new;
end;