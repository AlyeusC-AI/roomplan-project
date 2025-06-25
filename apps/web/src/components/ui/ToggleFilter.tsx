import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "./dialog";
import { Button } from "./button";
import { SlidersHorizontal } from "lucide-react";

interface ToggleFilterProps {
  filterTitle?: string;
  children: React.ReactNode;
  onApply?: () => void;
}

export const ToggleFilter: React.FC<ToggleFilterProps> = ({
  filterTitle,
  children,
  onApply,
}) => {
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    setOpen(false);
    setApplied(true);
    if (onApply) onApply();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={applied ? "secondary" : "outline"} onClick={() => setOpen(true)}>
        <SlidersHorizontal />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-2xl font-bold">{filterTitle}</DialogTitle>
        <div className="flex flex-col gap-4">
          <div >
            {children}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            {/* <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button> */}
            <Button onClick={handleApply}>
              Apply Filter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToggleFilter; 