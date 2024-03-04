import { Fragment, useEffect, useRef, useState } from 'react'
import subscriptionStatusState from '@atoms/subscriptionStatusState'
import UpgradeModal from '@components/UpgradeModal'
import { Dialog, Transition } from '@headlessui/react'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import ExpressUtils from '@pdftron/pdfjs-express-utils'
import { SubscriptionStatus } from '@restorationx/db'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
export default function Signature({
  preSignedUrl,
  fileName,
  onSave,
}: {
  preSignedUrl: string
  fileName: string
  onSave: () => void
}) {
  const viewer = useRef(null)
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [subscriptionStatus] = useRecoilState(subscriptionStatusState)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

  useEffect(() => {
    // @ts-ignore
    import('@pdftron/pdfjs-express').then(() => {
      // @ts-ignore
      WebViewer(
        {
          licenseKey: '8meLJ6AhitqyhiANcmnD',
          path: '/webviewer/lib',
          initialDoc: preSignedUrl,
          disableFlattenedAnnotations: true,
        },
        viewer.current
      ).then((instance: any) => {
        const { docViewer } = instance
        const annotManager = docViewer.getAnnotationManager()
        const utils = new ExpressUtils()

        // Add header button that will get file data on click
        instance.UI.setHeaderItems((header: any) => {
          header.push({
            type: 'actionButton',
            img: 'data:image/png;base64,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',
            onClick: async () => {
              if (subscriptionStatus !== SubscriptionStatus.active) {
                setUpgradeModalOpen(true)
                return
              }
              // Get the annotations and the documents data
              const xfdf = await annotManager.exportAnnotations({})
              const fileData = await docViewer.getDocument().getFileData({})

              // Set the annotations and document into the Utility SDK, then merge them together
              const resp = await utils.setFile(fileData).setXFDF(xfdf).merge()

              // Get the resulting blob from the merge operation
              const mergedBlob = await resp.getBlob()

              let file = new File([mergedBlob], fileName, {
                type: 'application/pdf',
              })

              const body = new FormData()
              body.append('file', file)
              setSaving(true)
              const res = await fetch(
                `/api/project/${router.query.id}/file-upload`,
                {
                  method: 'POST',
                  body: body,
                }
              )
              if (res.ok) {
                setSaving(false)
                onSave()
              } else {
                setSaving(false)
              }
            },
          })
        })
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="MyComponent">
      <Transition.Root show={saving} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setSaving}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <EllipsisHorizontalIcon
                        className="h-6 w-6 text-gray-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        Saving eSign document
                      </Dialog.Title>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <div className="webviewer" ref={viewer} style={{ height: '100vh' }}></div>
      {<UpgradeModal open={upgradeModalOpen} setOpen={setUpgradeModalOpen} />}
    </div>
  )
}
