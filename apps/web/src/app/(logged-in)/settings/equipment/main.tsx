'use client'

import { Button } from '@components/ui/button'
import { trpc } from '@utils/trpc'
import { useState } from 'react'
import { toast } from 'sonner'
import { v4 } from 'uuid'
import { Table } from './table'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '@components/ui/input'
import { Card } from '@components/ui/card'

const newEquipmentSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Account name must be at least 2 characters.',
    })
    .max(30, {
      message: 'Account name must not be longer than 30 characters.',
    }),
})

type NewEquipmentValues = z.infer<typeof newEquipmentSchema>

export async function EquipmentPage() {
  const [newEquipmentEntry, setNewEquipmentEntry] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const utils = trpc.useUtils()

  const createEquipment = trpc.equipment.create.useMutation({
    async onMutate({ name }) {
      await utils.equipment.getAll.cancel()
      const prevData = utils.equipment.getAll.getData()
      const temporaryId = v4()

      utils.equipment.getAll.setData(undefined, (old) => {
        const newData = {
          name,
          publicId: `temporary-${temporaryId}`,
          quantity: 1,
        }
        if (!old) {
          return [newData]
        }
        return [newData, ...old]
      })
      return { prevData, temporaryId }
    },
    onError(err, data, ctx) {
      if (ctx?.prevData) utils.equipment.getAll.setData(undefined, ctx.prevData)
    },
    onSettled(result) {
      utils.equipment.getAll.invalidate()
    },
  })
  // const allEquipment = trpc.equipment.getAll.useQuery(undefined, {
  //   initialData: initialOrganizationEquipment,
  // })

  const addEquipment = async () => {
    setIsAdding(true)
    try {
      await createEquipment.mutateAsync({ name: newEquipmentEntry })
      toast.success(`Added equipment: ${newEquipmentEntry}`)
    } catch (e) {
      console.error(e)
    }
    setNewEquipmentEntry('')
    setIsAdding(false)
  }

  const form = useForm<NewEquipmentValues>({
    resolver: zodResolver(newEquipmentSchema),
    mode: 'onChange',
  })

  function onSubmit(data: NewEquipmentValues) {
    toast('You submitted the following values:', {
      description: (
        <pre className="bg-slate-950 mt-2 w-[340px] rounded-md p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
      {/* <div className="my-8 w-full">
        <label
          htmlFor="equipment"
          className="block text-sm font-medium text-gray-700"
        >
          Add Equipment
        </label>
        <div className="mt-1 flex justify-between gap-2">
          <input
            type="equipment"
            name="equipment"
            id="equipment"
            className="block w-full rounded-md border-gray-300 px-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Dehumidifier #001"
            onChange={(e) => setNewEquipmentEntry(e.target.value)}
            value={newEquipmentEntry}
            disabled={isAdding}
          />
          <div className="flex w-80 justify-end">
            <Button
              className="w-full"
              onClick={addEquipment}
              disabled={isAdding || !newEquipmentEntry}
            >
              Add New Equipment
            </Button>
          </div>
        </div>
      </div> */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Add Equipment</FormLabel>
                <FormControl>
                  <Input placeholder="Dehumidifier #001" {...field} />
                </FormControl>
                <FormDescription>
                  Add a new equipment item to your inventory. Please provide a
                  name for the equipment.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Add equipment</Button>
        </form>
      </Form>
      <Card className='w-full'>
        <Table />
      </Card>
    </div>
  )
}

// const EquipmentItem = ({
//   equipment,
// }: {
//   equipment: RouterOutputs['equipment']['getAll'][0]
// }) => {
//   const [isDeleting, setIsDeleting] = useState(false)
//   const setName = trpc.equipment.setName.useMutation()
//   const utils = trpc.useContext()

//   const deleteEquipment = trpc.equipment.delete.useMutation({
//     async onMutate({ publicId }) {
//       await utils.equipment.getAll.cancel()
//       const prevData = utils.equipment.getAll.getData()
//       utils.equipment.getAll.setData(undefined, (old) =>
//         produce(old, (draft) => {
//           const index = old?.findIndex((p) => p.publicId === publicId)
//           if (index !== undefined && index >= 0) draft?.splice(index, 1)
//         })
//       )
//       return { prevData }
//     },
//     onError(err, data, ctx) {
//       // If the mutation fails, use the context-value from onMutate
//       if (ctx?.prevData) utils.equipment.getAll.setData(undefined, ctx.prevData)
//     },
//     onSettled() {
//       // Sync with server once mutation has settled
//       utils.equipment.getAll.invalidate()
//     },
//   })

//   const onSave = async (name: string, publicId: string) => {
//     setName.mutate({
//       name,
//       publicId,
//     })
//   }

//   const onDelete = async () => {
//     setIsDeleting(true)
//     if (equipment.publicId.indexOf('temporary') === -1) {
//       try {
//         await deleteEquipment.mutateAsync({ publicId: equipment.publicId })
//       } catch (e) {
//         console.error(e)
//       }
//     }
//     setIsDeleting(true)
//   }

//   return (
//     <TableRow key={equipment.publicId}>
//       <TableData important>
//         <Input
//           defaultValue={equipment.name}
//           // onSave={(name) => onSave(name, equipment.publicId)}
//           name={`${equipment.publicId}-equipmentName`}
//         />
//       </TableData>
//       <TableData>
//         <Button
//           onClick={onDelete}
//           disabled={isDeleting}
//         >
//           Remove<span className="sr-only">, {equipment.name}</span>
//         </Button>
//       </TableData>
//     </TableRow>
//   )
// }

export default EquipmentPage
