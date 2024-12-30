import { useState } from 'react'
import useAmplitudeTrack from '@utils/hooks/useAmplitudeTrack'
import { useRouter } from 'next/navigation'
import { event } from 'nextjs-google-analytics'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { Input } from '@components/ui/input'
import { toast } from 'sonner'

const CreateNewProject = ({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [projectName, setProjectName] = useState('')
  const [projectLocation, setProjectLocation] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const { track } = useAmplitudeTrack()
  const router = useRouter()

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectLocation || !projectName) {
      return toast.error('Please provide a name and location for the project.')
    }
    event('attempt_create_new_project', {
      category: 'Project List',
    })

    setIsCreating(true)
    try {
      const res = await fetch('/api/v1/project', {
        method: 'POST',
        body: JSON.stringify({
          name: projectName,
          location: projectLocation,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        event('create_new_project', {
          category: 'Project List',
          projectId: json.projectId,
        })
        track('Project Created', { projectId: json.projectId })

        router.push(`/projects/${json.projectId}/photos`)
      } else {
        console.error('Could not create project')
        setIsCreating(false)
      }
    } catch (error) {
      setIsCreating(false)
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        {isCreating ? (
          <DialogDescription>Creating project...</DialogDescription>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Provide a name for your new project and upload images of the job
                site
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project-name" className="text-right">
                  Client Name
                </Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="col-span-3"
                  placeholder="Client Name"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="project-location"
                  className="whitespace-nowrap text-right"
                >
                  Project Location
                </Label>
                <Input
                  id="project-location"
                  value={projectLocation}
                  onChange={() => setProjectLocation}
                  className="col-span-3"
                  placeholder="Project Location"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setOpen(false)}
                variant="secondary"
                className="mr-2"
              >
                Cancel
              </Button>
              <Button onClick={createProject} disabled={isCreating}>
                Create
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CreateNewProject
