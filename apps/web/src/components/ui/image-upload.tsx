"use client";

import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RegisterCircleInputClient,
  registerCircleSchemaClient,
} from "@/schema/circle.schema";

function getImageData(event: ChangeEvent<HTMLInputElement>) {
  // FileList is immutable, so we need to create a new one
  const dataTransfer = new DataTransfer();

  // Add newly uploaded images
  Array.from(event.target.files!).forEach((image) =>
    dataTransfer.items.add(image)
  );

  const files = dataTransfer.files;
  const displayUrl = URL.createObjectURL(event.target.files![0]);

  return { files, displayUrl };
}

export function ImageUpload() {
  const [preview, setPreview] = useState("");
  const form = useForm<RegisterCircleInputClient>({
    mode: "onSubmit",
    resolver: zodResolver(registerCircleSchemaClient),
  });

  function submitCircleRegistration(value: RegisterCircleInputClient) {
    console.log({ value });
  }

  return (
    <>
      <Form {...form}>
        <form
          className="space-y-8"
          onSubmit={form.handleSubmit(submitCircleRegistration)}
        >
          <Avatar className="w-24 h-24">
            <AvatarImage src={preview} />
            <AvatarFallback>BU</AvatarFallback>
          </Avatar>
          <FormField
            control={form.control}
            name="circle_image"
            render={({ field: { onChange, value, ...rest } }) => (
              <>
                <FormItem>
                  <FormLabel>Circle Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      {...rest}
                      onChange={(event) => {
                        const { files, displayUrl} = getImageData(event)
                        setPreview(displayUrl);
                        onChange(files);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose best image that bring spirits to your circle.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </>
            )}
          />
          <Button type="submit">Register</Button>
        </form>
      </Form>
    </>
  );
}