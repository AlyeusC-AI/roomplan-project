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

    if (!user) {
      setLoading(false);

      if (
        !(
          pathname === "/register" ||
          pathname === "/login" ||
          pathname === "/acceptInvite"
        )
      ) {
        router.push("/login");
      }

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
    if (pathname === "/acceptInvite") {
      setLoading(false);
      return;
    }
    const member = user.organizationMemberships.find(
      (org) => org.organization.id === activeOrg?.id
    );
    console.log("🚀 ~ useEffect ~ member:", member);

    if (member?.status === "PENDING") {
      setLoading(false);
      router.push(`/acceptInvite?orgId=${activeOrg?.id}&memberId=${member.id}`);
      return;
    }

    // If user is not verified
    if (!user.isEmailVerified) {
      router.push("/register?page=2");
      setLoading(false);

      return;
    }
    // If user is verified but has no organization
    if (
      !user.organizationMemberships.length ||
      user.organizationMemberships.length === 0
    ) {
      router.push("/register?page=3");
      setLoading(false);

      return;
    }

    if (!activeOrg?.subscriptionPlan) {
      router.push("/register?page=4");
      setLoading(false);
      return;
    }
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
