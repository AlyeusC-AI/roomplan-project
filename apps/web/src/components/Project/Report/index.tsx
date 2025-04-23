"use client";

import { useEffect, useState } from "react";
import { ScaleLoader } from "react-spinners";
import dynamic from "next/dynamic";

import { Button } from "@components/ui/button";
import { Switch } from "@components/ui/switch";
import { Label } from "@components/ui/label";
import { roomStore } from "@atoms/room";
import { reportSettingsStore } from "@atoms/report-settings";
import { useParams } from "next/navigation";
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
  const { showDimensionsAndDetails, toggleDimensionsAndDetails } = reportSettingsStore();
  
  const generatePDF = async () => {
    setIsGeneratingPdf(true);
    const pdfBody = document.getElementById("pdf-root");

    try {
      const opt = {
        margin: 4,
        filename: "report.pdf",
        html2canvas: {
          scale: 1,
        },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };
      await html2pdf().set(opt).from(pdfBody).save();
    } catch (e) {
      console.error(e);
    }
    setIsGeneratingPdf(false);
  };

  const rooms = roomStore();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/projects/${id}/room`)
      .then((res) => res.json())
      .then((data) => {
        rooms.setRooms(data.rooms);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingPlaceholder />;
  }

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
