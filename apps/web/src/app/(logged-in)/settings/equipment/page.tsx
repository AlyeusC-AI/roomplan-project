import { Metadata } from "next";
import EquipmentPage from "./main";
import { Separator } from "@components/ui/separator";

export const metadata: Metadata = {
  title: "Manage Equipment",
  description: "Access organization settings and manage your team",
  icons: ["/favicon.ico"],
};

export default async function Component() {
  // const props = await getLoggedInUserInfo(false, true, false, false)
  // const intialOrganizationEquipment = await getAllOrganizationEquipment(
  //   props.user?.org?.id!
  // )

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Equipment</h3>
        <p className='text-sm text-muted-foreground'>
          Customize and manage your equipment settings and preferences.
        </p>
      </div>
      <Separator />
      <EquipmentPage />
    </div>
  );
}
