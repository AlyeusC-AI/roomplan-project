import { cookies } from "next/headers";
import { User as UserType } from "@/services/auth";
import { SupabaseClient, User } from "@supabase/supabase-js";

export const serverAuth = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("access_token")?.value;

      if (!token) {
        console.log("No token found in cookies");
        return null;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        console.error("Auth error:", response.status, response.statusText);
        return null;
      }

      const data: UserType = await response.json();
      return {
        ...data,
        id: data.supabaseId!,
        user_metadata: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          referralCode: data.referralCode,
          referralSource: data.referralSource,
          organizationId:
            cookieStore.get("organizationId")?.value ||
            data.organizationMemberships[0].organization.supabaseId,
        },
      };
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  },
};
