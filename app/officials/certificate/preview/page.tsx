'use client'
import { useRef } from 'react'
import { ArrowLeft, Download, QrCode } from 'lucide-react'
import { Certificate } from "@/app/officials/certificate/mockCertificates"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'


interface CertificatePreviewProps {
  certificate: Certificate;
  onBack: () => void;
}

export default function CertificatePreview({ certificate, onBack }: CertificatePreviewProps) {

  const certificateRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!certificateRef.current) return

    // Capture certificate div as canvas
    const canvas = await html2canvas(certificateRef.current, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [canvas.width, canvas.height],
    })
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save(`${certificate.certificateType}-${certificate.residentName}.pdf`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg dark:hover:text-black">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl text-gray-900 dark:text-gray-100">Certificate Preview</h2>
            <p className="text-gray-600 dark:text-gray-400">{certificate.id}</p>
          </div>
        </div>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Download className="w-5 h-5" />
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate Preview */}
        <div className="lg:col-span-2" ref={certificateRef}>
          <div className="bg-white border-4 border-blue-600 rounded-lg p-8 shadow-lg text-gray-800">
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
              <h1 className="text-3xl mb-2">Republic of the Philippines</h1>
              <p className="text-xl">Barangay Hall</p>
              <p className="text-lg">Quezon City, Metro Manila</p>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl mb-2">{certificate.certificateType}</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
            </div>

            {/* Content */}
            <div className="space-y-6 mb-8">
              <p className="text-center">TO WHOM IT MAY CONCERN:</p>
              
              <div className="space-y-4 text-justify">
                <p className="indent-8">
                  This is to certify that <span className="underline">{certificate.residentName}</span>,
                  of legal age, Filipino, and a resident of this barangay, has been verified in our records.
                </p>

                <p className="indent-8">
                  This certification is being issued upon the request of the above-named person 
                  for <span className="underline">{certificate.purpose}</span>.
                </p>

                <p className="indent-8">
                  Issued this {certificate.dateIssued ? new Date(certificate.dateIssued).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'pending'} at Barangay Hall, Quezon City, Metro Manila.
                </p>
              </div>
            </div>

            {/* Signature Section */}
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div className="text-center">
                <div className="mb-2">
                  <div className="h-16 flex items-end justify-center">
                    <div className="border-b-2 border-black w-48"></div>
                  </div>
                </div>
                <p className="uppercase">{certificate.assignedOfficer}</p>
                <p className="text-sm">Issuing Officer</p>
              </div>
              <div className="text-center">
                <div className="mb-2">
                  <div className="h-16 flex items-end justify-center">
                    <div className="border-b-2 border-black w-48"></div>
                  </div>
                </div>
                <p className="uppercase">Barangay Captain</p>
                <p className="text-sm">Punong Barangay</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="mt-8 text-center">
              <div className="inline-block p-4 bg-gray-100 rounded">
                <QrCode className="w-20 h-20 mx-auto text-gray-400" />
                <p className="text-xs mt-2 text-gray-600">{certificate.id}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-600">
              <p>NOT VALID WITHOUT OFFICIAL SEAL</p>
              <p>Valid for 6 months from date of issuance</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-1 space-y-6 ">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg mb-4 text-gray-900">Request Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Certificate ID</p>
                <p>{certificate.id}</p>
              </div>
              <div>
                <p className="text-gray-900">Resident</p>
                <p className="dark:text-gray-600">{certificate.residentName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-600">{certificate.residentId}</p>
              </div>
              <div>
                <p className="text-gray-600">Family ID</p>
                <p className="dark:text-gray-600">{certificate.familyId}</p>
              </div>
              <div>
                <p className="text-gray-600">Certificate Type</p>
                <p className="dark:text-gray-600">{certificate.certificateType}</p>
              </div>
              <div>
                <p className="text-gray-600">Purpose</p>
                <p className="dark:text-gray-600">{certificate.purpose}</p>
              </div>
              <div>
                <p className="text-gray-600">Date Requested</p>
                <p className="dark:text-gray-600"> {certificate.dateRequested}</p>
              </div>
              {certificate.dateIssued && (
                <div>
                  <p className="text-gray-600">Date Issued</p>
                  <p className="dark:text-gray-600">{certificate.dateIssued}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Status</p>
                <span className={`inline-block px-2 py-1 rounded text-xs ${
                  certificate.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                  certificate.status === 'Approved' ? 'bg-yellow-100 text-yellow-700' :
                  certificate.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {certificate.status}
                </span>
              </div>
              <div>
                <p className="text-gray-600">Assigned Officer</p>
                <p className="dark:text-gray-600">{certificate.assignedOfficer}</p>
              </div>
              {certificate.notes && (
                <div>
                  <p className="text-gray-600">Notes</p>
                  <p className="dark:text-gray-600">{certificate.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              This is a preview of the certificate. The actual printed document will include 
              official seals and signatures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
