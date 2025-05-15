"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  // DialogContent,
  // DialogDescription,
  // DialogFooter,
  // DialogHeader,
  // DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import { DialogClose } from "@radix-ui/react-dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

import { toast } from "sonner";
import {
  ProjectStatus,
  useGetProjectById,
  useGetProjectStatus,
  useGetProjectStatuses,
  useUpdateProject,
} from "@service-geek/api-client";
import { useParams } from "next/navigation";

// FIXME: https://twitter.com/lemcii/status/1659649371162419202?s=46&t=gqNnMIjMWXiG2Rbrr5gT6g
// Removing states would help maybe?

// const badgeStyle = (color: string) => ({
//   borderColor: `${color}20`,
//   backgroundColor: `${color}30`,
//   color,
// });

export function FancyBox() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [openCombobox, setOpenCombobox] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>("");
  const { id } = useParams();

  const statuses = useGetProjectStatuses();
  const project = useGetProjectById(id as string);
  const updateProject = useUpdateProject();

  const toggleFramework = async (framework: ProjectStatus) => {
    try {
      await updateProject.mutateAsync({
        id: id as string,
        data: {
          statusId: framework.id,
        },
      });

      inputRef?.current?.focus();
      toast.success("Status updated successfully.");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  // const updateFramework = (framework: Status, newFramework: Status) => {
  //   setFrameworks((prev) =>
  //     prev.map((f) => (f.value === framework.label ? newFramework : f))
  //   );
  //   setSelectedValues(framework.label);
  // };

  // const deleteFramework = (framework: Framework) => {
  //   setFrameworks((prev) => prev.filter((f) => f.value !== framework.value));
  //   setSelectedValues(null);
  // };

  const onComboboxOpenChange = (value: boolean) => {
    inputRef.current?.blur(); // HACK: otherwise, would scroll automatically to the bottom of page
    setOpenCombobox(value);
  };

  return (
    <div className='max-w-[200px]'>
      <Popover open={openCombobox} onOpenChange={onComboboxOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={openCombobox}
            className='w-[200px] justify-between text-foreground'
          >
            <span className='truncate'>
              {statuses.data?.find((e) => e.id == project.data?.data?.statusId)
                ?.label ?? "Select label"}
            </span>
            <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[200px] p-0'>
          <Command loop>
            <CommandInput
              ref={inputRef}
              placeholder='Search statuses...'
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandGroup className='max-h-[145px] overflow-auto'>
                {statuses.data?.map((framework) => {
                  const isActive = project.data?.data?.statusId == framework.id;
                  return (
                    <CommandItem
                      key={framework.id}
                      value={framework.label}
                      onSelect={() => toggleFramework(framework)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isActive ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className='flex-1'>{framework.label}</div>
                      <div
                        className='size-4 rounded-full'
                        style={{ backgroundColor: framework.color }}
                      />
                    </CommandItem>
                  );
                })}
                {/* <CommandItemCreate
                  onSelect={() => createFramework(inputValue)}
                  {...{ inputValue, frameworks }}
                /> */}
              </CommandGroup>
              <CommandSeparator alwaysRender />
              {/* <CommandGroup>
                <CommandItem
                  value={`:${inputValue}:`} // HACK: that way, the edit button will always be shown
                  className='text-xs text-muted-foreground'
                  onSelect={() => setOpenDialog(true)}
                >
                  <div className={cn("mr-2 h-4 w-4")} />
                  <Edit2 className='mr-2 size-2.5' />
                  Edit Labels
                </CommandItem>
              </CommandGroup> */}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Dialog
        open={openDialog}
        onOpenChange={(open) => {
          if (!open) {
            setOpenCombobox(true);
          }
          setOpenDialog(open);
        }}
      >
        {/* <DialogContent className='flex max-h-[90vh] flex-col'>
          <DialogHeader>
            <DialogTitle>Edit Labels</DialogTitle>
            <DialogDescription>
              Change the label names or delete the labels. Create a label
              through the combobox though.
            </DialogDescription>
          </DialogHeader>
          <div className='-mx-6 flex-1 overflow-scroll px-6 py-2'>
            {frameworks.map((framework) => {
              return (
                <DialogListItem
                  key={framework.value}
                  onDelete={() => deleteFramework(framework)}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const target = e.target as typeof e.target &
                      Record<"name" | "color", { value: string }>;
                    const newFramework = {
                      value: target.name.value.toLowerCase(),
                      label: target.name.value,
                      color: target.color.value,
                    };
                    updateFramework(framework, newFramework);
                  }}
                  {...framework}
                />
              );
            })}
          </div>
          <DialogFooter className='bg-opacity-40'>
            <DialogClose asChild>
              <Button variant='outline'>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent> */}
      </Dialog>
    </div>
  );
}

// const CommandItemCreate = ({
//   inputValue,
//   frameworks,
//   onSelect,
// }: {
//   inputValue: string;
//   frameworks: Framework[];
//   onSelect: () => void;
// }) => {
//   const hasNoFramework = !frameworks
//     .map(({ value }) => value)
//     .includes(`${inputValue.toLowerCase()}`);

//   const render = inputValue !== "" && hasNoFramework;

//   if (!render) return null;

//   // BUG: whenever a space is appended, the Create-Button will not be shown.
//   return (
//     <CommandItem
//       key={`${inputValue}`}
//       value={`${inputValue}`}
//       className='text-xs text-muted-foreground'
//       onSelect={onSelect}
//     >
//       <div className={cn("mr-2 h-4 w-4")} />
//       Create new label &quot;{inputValue}&quot;
//     </CommandItem>
//   );
// };

// const DialogListItem = ({
//   value,
//   label,
//   color,
//   onSubmit,
//   onDelete,
// }: Framework & {
//   onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
//   onDelete: () => void;
// }) => {
//   const inputRef = React.useRef<HTMLInputElement>(null);
//   const [accordionValue, setAccordionValue] = React.useState<string>("");
//   const [inputValue, setInputValue] = React.useState<string>(label);
//   const [colorValue, setColorValue] = React.useState<string>(color);
//   const disabled = label === inputValue && color === colorValue;

//   React.useEffect(() => {
//     if (accordionValue !== "") {
//       inputRef.current?.focus();
//     }
//   }, [accordionValue]);

//   return (
//     <Accordion
//       key={value}
//       type='single'
//       collapsible
//       value={accordionValue}
//       onValueChange={setAccordionValue}
//     >
//       <AccordionItem value={value}>
//         <div className='flex items-center justify-between'>
//           <div>
//             <Badge variant='outline' style={badgeStyle(color)}>
//               {label}
//             </Badge>
//           </div>
//           <div className='flex items-center gap-4'>
//             <AccordionTrigger>Edit</AccordionTrigger>
//             <AlertDialog>
//               <AlertDialogTrigger asChild>
//                 {/* REMINDER: size="xs" */}
//                 <Button variant='destructive' size='xs'>
//                   Delete
//                 </Button>
//               </AlertDialogTrigger>
//               <AlertDialogContent>
//                 <AlertDialogHeader>
//                   <AlertDialogTitle>Are you sure sure?</AlertDialogTitle>
//                   <AlertDialogDescription>
//                     You are about to delete the label{" "}
//                     <Badge variant='outline' style={badgeStyle(color)}>
//                       {label}
//                     </Badge>{" "}
//                     .
//                   </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter>
//                   <AlertDialogCancel>Cancel</AlertDialogCancel>
//                   <AlertDialogAction onClick={onDelete}>
//                     Delete
//                   </AlertDialogAction>
//                 </AlertDialogFooter>
//               </AlertDialogContent>
//             </AlertDialog>
//           </div>
//         </div>
//         <AccordionContent>
//           <form
//             className='flex items-end gap-4'
//             onSubmit={(e) => {
//               onSubmit(e);
//               setAccordionValue("");
//             }}
//           >
//             <div className='grid w-full gap-3'>
//               <Label htmlFor='name'>Label name</Label>
//               <Input
//                 ref={inputRef}
//                 id='name'
//                 value={inputValue}
//                 onChange={(e) => setInputValue(e.target.value)}
//                 className='h-8'
//               />
//             </div>
//             <div className='grid gap-3'>
//               <Label htmlFor='color'>Color</Label>
//               <Input
//                 id='color'
//                 type='color'
//                 value={colorValue}
//                 onChange={(e) => setColorValue(e.target.value)}
//                 className='h-8 px-2 py-1'
//               />
//             </div>
//             {/* REMINDER: size="xs" */}
//             <Button type='submit' disabled={disabled} size='xs'>
//               Save
//             </Button>
//           </form>
//         </AccordionContent>
//       </AccordionItem>
//     </Accordion>
//   );
// };
