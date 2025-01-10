'use client'

import { orgStore } from '@atoms/organization'
import OrgSettingsSection from '@components/Settings/Organization/OrgSettingsSection'
import OrgMembersSection from '@app/(logged-in)/settings/organization/members'
import AddressAutoComplete from '@components/ui/address-automplete'
import { Button } from '@components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form'
import { Input } from '@components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import useAmplitudeTrack from '@utils/hooks/useAmplitudeTrack'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Organization name must be at least 2 characters.',
    })
    .max(30, {
      message: 'Organization name must not be longer than 30 characters.',
    }),
  address: z
    .string()
    .min(2, {
      message: 'Organization address must be at least 2 characters.',
    })
    .max(30, {
      message: 'Organization address must not be longer than 30 characters.',
    }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function Organization() {
  const [updateStatus, setUpdateStatus] = useState<{
    ok: boolean
    message: string
  } | null>(null)
  const { name, address } = orgStore((state) => state.organization)
  const { track } = useAmplitudeTrack()

  const updateOrgSettings = async (data: ProfileFormValues) => {
    try {
      const res = await fetch('/api/organization', {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        toast.error('Failed to update organization details')
      } else {
        // attributes are booleans to not leak customer data
        track('Update Organization Settings', {
          name: !!data.name,
          address: !!data.address,
        })
      }
    } catch (error) {
      toast.error('Failed to update organization details')
    }
  }

  const [newAddress, setAddress] = useState<AddressType>({
    address1: '',
    address2: '',
    formattedAddress: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    lat: 0,
    lng: 0,
  })
  const [searchInput, setSearchInput] = useState('')

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: 'onChange',
  })
  return (
    <>
      <div className="flex flex-col">
        <section aria-labelledby="organization-settings">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(updateOrgSettings)}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" defaultValue={name} {...field} />
                    </FormControl>
                    <FormDescription>
                      Your organization name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Address</FormLabel>
                    <FormControl>
                      <AddressAutoComplete
                        address={newAddress}
                        setAddress={setAddress}
                        searchInput={searchInput}
                        setSearchInput={setSearchInput}
                        dialogTitle="Enter Address"
                      />
                    </FormControl>
                    <FormDescription>
                      Enter your organization address.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Update organization</Button>
            </form>
          </Form>
        </section>
        <OrgMembersSection />
      </div>
    </>
  )
}
