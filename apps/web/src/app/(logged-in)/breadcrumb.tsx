"use client";

import React from "react";

import { useParams, usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { validate } from "uuid";
import { useGetProjectById } from "@service-geek/api-client";

type TBreadCrumbProps = {
  capitalizeLinks?: boolean;
};

const NextBreadcrumb = ({ capitalizeLinks }: TBreadCrumbProps) => {
  const paths = usePathname();
  const { id } = useParams<{ id: string }>();
  const { data: projectInfo } = useGetProjectById(id);
  const pathNames = paths.split("/").filter((path) => path);

  function capitalizeFirstLetter(word: string) {
    if (!word) return "";
    return word[0]?.toUpperCase() + word.slice(1);
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          {pathNames.map((link, index) => {
            const href = `/${pathNames.slice(0, index + 1).join("/")}`;
            const itemLink = capitalizeLinks
              ? link[0].toUpperCase() + link.slice(1, link.length)
              : link;
            return (
              <React.Fragment key={index}>
                <BreadcrumbItem className='hidden md:block'>
                  <BreadcrumbLink href={href}>
                    {validate(itemLink)
                      ? (projectInfo?.data?.clientName ?? "")
                      : capitalizeFirstLetter(itemLink)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {index < pathNames.length - 1 && (
                  <BreadcrumbSeparator className='hidden md:block' />
                )}
              </React.Fragment>
            );
          })}

          {/* <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>Data Fetching</BreadcrumbPage>
          </BreadcrumbItem> */}
        </BreadcrumbList>
      </Breadcrumb>
      {/* <div>
        <ul className={containerClasses}>
          <li className={listClasses}>
            <Link href={'/'}>{homeElement}</Link>
          </li>
          {pathNames.length > 0 && separator}
        </ul>
      </div> */}
    </>
  );
};

export default NextBreadcrumb;
