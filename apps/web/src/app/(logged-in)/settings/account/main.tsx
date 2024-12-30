'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { UserResponse } from '@supabase/supabase-js'

const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: 'Account name must be at least 2 characters.',
    })
    .max(30, {
      message: 'Account name must not be longer than 30 characters.',
    }),
  lastName: z
    .string()
    .min(2, {
      message: 'Account name must be at least 2 characters.',
    })
    .max(30, {
      message: 'Account name must not be longer than 30 characters.',
    }),
  email: z.string({
    required_error: 'Please select an email to display.',
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function AccountSettings({ user }: { user: UserResponse }) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: 'onChange',
  })

  function onSubmit(data: ProfileFormValues) {
    toast('You submitted the following values:', {
      description: (
        <pre className="bg-slate-950 mt-2 w-[340px] rounded-md p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormDescription>
                  Enter your first name. This will be displayed on your profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormDescription>
                  Enter your last name. This will be displayed on your profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {user && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={user.data.user?.email ?? 'example@gmail.com'}
                      disabled
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the email address that is associated with your
                    account. You cannot change it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button type="submit">Update profile</Button>
        </form>
      </Form>
    </>
  )
}
