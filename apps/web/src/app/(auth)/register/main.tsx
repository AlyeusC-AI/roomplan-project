"use client";

import { redirect, useSearchParams } from "next/navigation";
import { OrganizationForm } from "./org";
import { AccountForm } from "./account";
import { VerifyEmailForm } from "./verify-email";
import SubscribeForm from "./subscribe";
import { useEffect } from "react";
import { useCurrentUser } from "@service-geek/api-client";
import { useGetOrganizations } from "@service-geek/api-client";

export function RegisterForm() {
  const searchParams = useSearchParams();
  const { data: user } = useCurrentUser();
  const { data: organizations } = useGetOrganizations();

  // useEffect(() => {
  //   if (user?.isEmailVerified && (organizations?.length || 0) > 0) {
  //     return redirect("/projects");
  //   }
  // }, [user, organizations]);

  switch (searchParams.get("page") ?? "1") {
    case "1":
      return <AccountForm />;
    case "2":
      return <VerifyEmailForm />;
    case "3":
      return <OrganizationForm />;
    case "4":
      return <SubscribeForm />;
    default:
      return <></>;
  }
}
