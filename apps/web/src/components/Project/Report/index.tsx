"use client";

import { useEffect, useState } from "react";
import { ScaleLoader } from "react-spinners";
import dynamic from "next/dynamic";

import { Button } from "@components/ui/button";

import { LoadingPlaceholder } from "@components/ui/spinner";
import ReportSettingsPanel from "./ReportPDF/PDFHTML/ReportSettingsPanel";

const ReportPDF = dynamic(() => import("./ReportPDF"), {
  ssr: false,
  loading: () => (
    <div className='flex size-full items-center justify-center'>
      <ScaleLoader color='#2563eb' />
    </div>
  ),
});

export default function Report() {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const generatePDF = async () => {
    setIsGeneratingPdf(true);
    const pdfBody = document.getElementById("pdf-root");

    try {
      const opt = {
        margin: 4,
        filename: "report.pdf",
        html2canvas: {
          scale: 3,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
        },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };
      await html2pdf().set(opt).from(pdfBody).save();
    } catch (e) {
      console.error(e);
    }
    setIsGeneratingPdf(false);
  };

  return (
    <div>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium'>Report PDF</h3>
          <p className='text-sm text-muted-foreground'>
            A summary of the work to be done for this project.
          </p>
        </div>
        <div className='flex items-center gap-8'>
          {/* <div className='flex items-center space-x-2'>
            <Switch
              id="dimensions-details"
              checked={showDimensionsAndDetails}
              onCheckedChange={toggleDimensionsAndDetails}
            />
            <Label htmlFor="dimensions-details">Show Dimensions & Details</Label>
          </div> */}
          <ReportSettingsPanel />

          <Button onClick={generatePDF} disabled={isGeneratingPdf}>
            {isGeneratingPdf ? <LoadingPlaceholder /> : "Generate PDF"}
          </Button>
        </div>
      </div>
      <ReportPDF />
    </div>
  );
}
