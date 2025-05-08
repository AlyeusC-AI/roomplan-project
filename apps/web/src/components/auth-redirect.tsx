"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@service-geek/api-client";

export default function AuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user } = useCurrentUser();
  console.log("🚀 ~ AuthRedirect ~ user:", user);

  useEffect(() => {
    const inviteCode = searchParams.get("inviteCode");

    if (inviteCode) {
      router.push(`/acceptInvite?inviteCode=${inviteCode}`);
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    // If user has an organization, redirect to projects
    if (user.organizationMemberships.length > 0) {
      router.push("/projects");
      return;
    }

    // If user has an invite but hasn't accepted it
    // if (
    //   user.organizationMemberships[0].invitedAt &&
    //   !user.organizationMemberships[0].joinedAt
    // ) {
    //   router.push(
    //     `/acceptInvite?token=${user.organizationMemberships[0].invitedAt}`
    //   );
    //   return;
    // }
    // If user is not verified
    if (!user.isEmailVerified) {
      router.push("/register?page=2");
      return;
    }
    // If user is verified but has no organization
    if (
      !user.organizationMemberships.length ||
      user.organizationMemberships.length === 0
    ) {
      router.push("/register?page=3");
      return;
    }

    router.push("/login");
  }, [user]);

  return null;
}
