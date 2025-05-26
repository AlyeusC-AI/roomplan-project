import React from "react";

import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { CircleAlert } from "lucide-react";
import {
  useActiveOrganization,
  useGetProjectById,
} from "@service-geek/api-client";
import { useParams } from "next/navigation";

const requiredAttributes = {
  name: "Client name",
  location: "Client address",
  insuranceClaimId: "Insurance claim Id",
  insuranceCompanyName: "Insurance carrier",
  adjusterName: "Adjuster name",
  adjusterEmail: "Adjuster email",
};

const requiredOrgAttributes = {
  name: "Organization name",
  formattedAddress: "Organization address",
};
export default function MissingDataWarning() {
  const { id } = useParams<{ id: string }>();
  const { data: projectData } = useGetProjectById(id!);
  const projectInfo = projectData?.data;
  const orgInfo = useActiveOrganization();

  const isMissingProjectInfo = Object.keys(requiredAttributes).find(
    (key) => !projectInfo![key as keyof typeof requiredAttributes]
  );
  const isMissingOrgInfo = Object.keys(requiredOrgAttributes).find(
    (key) => !orgInfo![key as keyof typeof requiredOrgAttributes]
  );
  return (
    <>
      {(isMissingProjectInfo || isMissingOrgInfo) && (
        <Alert variant='destructive' className='my-4'>
          <CircleAlert className='size-4' />
          <AlertTitle>Missing Information</AlertTitle>
          <AlertDescription>
            Certain information about the project is missing. This can lead to
            an incomplete report.
          </AlertDescription>
          <ul role='list' className='mt-3 list-disc space-y-1 pl-5'>
            {Object.keys(requiredAttributes).map((key) => {
              if (projectInfo![key as keyof typeof requiredAttributes]) return;
              return (
                <li key={key}>
                  {requiredAttributes[key as keyof typeof requiredAttributes]}
                </li>
              );
            })}
            {Object.keys(requiredOrgAttributes).map((key) => {
              if (orgInfo![key as keyof typeof requiredOrgAttributes]) return;
              return (
                <li key={key}>
                  {
                    requiredOrgAttributes[
                      key as keyof typeof requiredOrgAttributes
                    ]
                  }
                </li>
              );
            })}
          </ul>
        </Alert>
      )}
    </>
  );
}
