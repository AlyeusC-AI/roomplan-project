import { useState } from 'react'
import { ScaleLoader } from 'react-spinners'
import { PrimaryButton } from '@components/components/button'
import dynamic from 'next/dynamic'

import TabTitleArea from '../TabTitleArea'

const ReportPDF = dynamic(() => import('./ReportPDF'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <ScaleLoader color="#2563eb" />
    </div>
  ),
})

export default function Report() {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const generatePDF = async () => {
    setIsGeneratingPdf(true)
    const pdfBody = document.getElementById('pdf-root')

    try {
      var opt = {
        margin: 4,
        filename: 'report.pdf',
        html2canvas: {
          scale: 1.5,
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }
      // @ts-ignore
      await html2pdf().set(opt).from(pdfBody).save()
    } catch (e) {
      console.error(e)
    }
    setIsGeneratingPdf(false)
  }
  return (
    <div>
      <TabTitleArea
        title="Report PDF"
        description="A summary of the work to be done for this project"
      >
        <div></div>
        <PrimaryButton
          onClick={generatePDF}
          disabled={isGeneratingPdf}
          loading={isGeneratingPdf}
        >
          Generate PDF
        </PrimaryButton>
      </TabTitleArea>
      <ReportPDF />
    </div>
  )
}
