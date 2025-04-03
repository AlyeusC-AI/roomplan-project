import { supabaseServiceRole } from "@lib/supabase/admin"
import { createClient } from "@lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { user as getUser } from "@lib/supabase/get-user"
import { z } from "zod"

// Validation schemas
const formResponseFieldSchema = z.object({
  formFieldId: z.number(),
  value: z.string()
})

const getFormResponsesSchema = z.object({
  formId: z.number()
})

const createFormResponseSchema = z.object({
  formId: z.number(),
  projectId: z.number().optional(),
  date: z.string().optional(),
  fields: z.array(formResponseFieldSchema)
})

const deleteFormResponseSchema = z.object({
  id: z.number()
})

// GET /api/v1/organization/forms/responses
export async function GET(req: NextRequest) {
  try {
    const [, user] = await getUser(req)
    const client = await createClient()
    const body = await req.json()
    
    // Validate request body
    const validatedData = getFormResponsesSchema.parse(body)

    // Get form responses
    const { data: responses, error } = await client
      .from("FormResponse")
      .select(`
        *,
        FormResponseField (
          *,
          FormField (*)
        )
      `)
      .eq("formId", validatedData.formId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(responses)
  } catch (error) {
    console.error("Error fetching form responses:", error)
    return NextResponse.json(
      { error: "Failed to fetch form responses" },
      { status: 500 }
    )
  }
}

// POST /api/v1/organization/forms/responses
export async function POST(req: NextRequest) {
  try {
    const [, user] = await getUser(req)
    const client = await createClient()
    const body = await req.json()
    
    // Validate request body
    const validatedData = createFormResponseSchema.parse(body)

    // Create form response
    const { data: formResponse, error: responseError } = await client
      .from("FormResponse")
      .insert({
        formId: validatedData.formId,
        projectId: validatedData.projectId,
        date: validatedData.date || new Date().toISOString()
      })
      .select()
      .single()

    if (responseError) throw responseError

    // Create response fields
    const { error: fieldsError } = await client
      .from("FormResponseField")
      .insert(
        validatedData.fields.map(field => ({
          formResponseId: formResponse.id,
          formFieldId: field.formFieldId,
          value: field.value
        }))
      )

    if (fieldsError) throw fieldsError

    return NextResponse.json(formResponse)
  } catch (error) {
    console.error("Error creating form response:", error)
    return NextResponse.json(
      { error: "Failed to create form response" },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/organization/forms/responses
export async function DELETE(req: NextRequest) {
  try {
    const [, user] = await getUser(req)
    const client = await createClient()
    const body = await req.json()
    
    // Validate request body
    const validatedData = deleteFormResponseSchema.parse(body)

    // Delete response fields first
    const { error: fieldsError } = await client
      .from("FormResponseField")
      .delete()
      .eq("formResponseId", validatedData.id)

    if (fieldsError) throw fieldsError

    // Delete the response
    const { error: responseError } = await client
      .from("FormResponse")
      .delete()
      .eq("id", validatedData.id)

    if (responseError) throw responseError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting form response:", error)
    return NextResponse.json(
      { error: "Failed to delete form response" },
      { status: 500 }
    )
  }
} 