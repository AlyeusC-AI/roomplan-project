(bucket_id = 'project-images'::text) AND (uid())::text IN ( SELECT "UserToOrganization"."userId"
   FROM "UserToOrganization"
  WHERE ("UserToOrganization"."organizationId" IN ( SELECT "Organization".id
           FROM "Organization"
          WHERE (("Organization"."publicId")::text = (storage.foldername(name))[1]))))