import React from 'react'

import MissingDataWarning from './MissingDataWarning'
import PDFHTML from './PDFHTML'

export default function ReportPDF() {
  return (
    <div className="flex flex-col justify-center pb-8">
      <MissingDataWarning />
      <PDFHTML />
    </div>
  )
}
