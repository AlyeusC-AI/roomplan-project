"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";

import TagsManagment from "@components/tags/tagsManagment";

export default function TagsPage() {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Labels & Tags</CardTitle>
          <CardDescription>
            Manage your project labels and image tags
          </CardDescription>
        </CardHeader>

        <CardContent>
          <TagsManagment />
        </CardContent>
      </Card>
    </div>
  );
}
