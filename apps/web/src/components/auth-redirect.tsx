"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useActiveOrganization,
  useCurrentUser,
} from "@service-geek/api-client";
import { LoadingPlaceholder } from "./ui/spinner";
export default function AuthRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const activeOrg = useActiveOrganization();
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  console.log("🚀 ~ AuthRedirect ~ user:", user);

  useEffect(() => {
    if (userLoading) {
      return;
    }
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
    // if (user.organizationMemberships.length > 0) {
    //   router.push("/projects");
    //   return;
    // }

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

    // if (!activeOrg?.subscriptionPlan) {
    //   router.push("/register?page=4");
    //   return;
    // }
    if (pathname === "/register" || pathname === "/login" || pathname === "/") {
      router.push("/projects");
    }

    setLoading(false);

    // router.push("/projects");
  }, [user, activeOrg]);

  if (loading) {
    return <LoadingPlaceholder />;
  }

  return children;
}
