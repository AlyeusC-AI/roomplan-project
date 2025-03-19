import { supabaseServiceRole } from "@lib/supabase/admin";
import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { user as getUser } from "@lib/supabase/get-user";
import { z } from "zod";

// Form field type enum
const FormFieldType = z.enum([
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "DATE",
  "RADIO",
  "CHECKBOX",
  "SELECT",
  "FILE",
  "IMAGE",
  "RATING",
  "SIGNATURE",
  "TIME"
]);

// Validation schemas
const formFieldSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  type: FormFieldType,
  isRequired: z.boolean().optional(),
  order: z.number().optional(),
  options: z.array(z.object({
    id: z.number().optional(),
    name: z.string(),
    value: z.string(),
    order: z.number().optional()
  })).optional()
});

const formSectionSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  fields: z.array(formFieldSchema).optional()
});

const createFormSchema = z.object({
  name: z.string(),
  desc: z.string().optional(),
  sections: z.array(formSectionSchema).optional()
});

const updateFormSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  desc: z.string().optional(),
  sections: z.array(formSectionSchema).optional()
});

const deleteFormSchema = z.object({
  id: z.number()
});

// GET /api/v1/organization/forms
export async function GET(req: NextRequest) {
  try {
    const [, user] = await getUser(req);
    const client = await createClient();

    const organizationId: string = user?.user_metadata.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const org=await client.from("Organization").select("id").eq("publicId", organizationId).single();

    if (org.error) throw org.error;

    // Get forms for the organization
    const { data: forms, error } = await client
      .from("Form")
      .select(`
        *,
        sections: FormSection (
          *,
          fields:FormField (
            *,
            options: FormOption (*)
          )
        )
      `).order("created_at", { ascending: false })
      .eq("orgId", org.data.id);

    if (error) throw error;

    return NextResponse.json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    return NextResponse.json(
      { error: "Failed to fetch forms" },
      { status: 500 }
    );
  }
}

// POST /api/v1/organization/forms
export async function POST(req: NextRequest) {
  try {
    const [, user] = await getUser(req);
    const client = await createClient();
    const body = await req.json();
    
    // Validate request body
    const validatedData = createFormSchema.parse(body);
    
    const organizationId: string = user?.user_metadata.organizationId;


    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const org=await client.from("Organization").select("id").eq("publicId", organizationId).single();

    if (org.error) throw org.error;

    // Start a transaction
    const { data: form, error: formError } = await client
      .from("Form")
      .insert({
        name: validatedData.name,
        desc: validatedData.desc,
        orgId: org.data.id
      })
      .select()
      .single();

    if (formError) throw formError;

    // Create sections and fields
    for (const section of validatedData.sections || []) {
      const { data: formSection, error: sectionError } = await client
        .from("FormSection")
        .insert({
          name: section.name,
          formId: form.id
        })
        .select()
        .single();

      if (sectionError) throw sectionError;

      // Create fields for this section
      for (const field of section.fields || []) {
        const { data: formField, error: fieldError } = await client
          .from("FormField")
          .insert({
            name: field.name,
            type: field.type,
            isRequired: field.isRequired,
            order: field.order,
            sectionId: formSection.id
          })
          .select()
          .single();

        if (fieldError) throw fieldError;

        // Create options if they exist
        if (field.options && field.options.length > 0) {
          const { error: optionsError } = await client
            .from("FormOption")
            .insert(
              field.options.map(option => ({
                name: option.name,
                value: option.value,
                order: option.order,
                formFieldId: formField.id
              }))
            );

          if (optionsError) throw optionsError;
        }
      }
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error("Error creating form:", error);
    return NextResponse.json(
      { error: "Failed to create form" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/organization/forms
export async function PUT(req: NextRequest) {
  try {
    const [, user] = await getUser(req);
    const client = await createClient();
    const body = await req.json();
    
    // Validate request body
    const validatedData = updateFormSchema.parse(body);

    // Update form
    const { data: updatedForm, error: updateError } = await client
      .from("Form")
      .update({
        name: validatedData.name,
        desc: validatedData.desc,
      })
      .eq("id", validatedData.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Get existing sections and fields
    const { data: existingSections, error: sectionsError } = await client
      .from("FormSection")
      .select("id, name, formId")
      .eq("formId", validatedData.id);

    if (sectionsError) throw sectionsError;

    const { data: existingFields, error: fieldsError } = await client
      .from("FormField")
      .select("id, name, type, isRequired, order, sectionId")
      .in(
        "sectionId",
        existingSections?.map((section) => section.id) || []
      );

    if (fieldsError) throw fieldsError;

    // Create maps for quick lookup
    const existingSectionsMap = new Map(
      existingSections?.map((section) => [section.name, section]) || []
    );
    const existingFieldsMap = new Map<number, typeof existingFields[number]>(
      existingFields?.map((field) => {
        if (!field.id) return null;
        return [field.id, field];
      }).filter((entry): entry is [number, typeof existingFields[number]] => entry !== null) || []
    );
    console.log("🚀 ~ PUT ~ validatedData.sections:",JSON.stringify(validatedData.sections, null, 2))

    // Update or create sections
    for (const section of validatedData.sections || []) {
      const existingSection = existingSectionsMap.get(section.name);
      
      if (existingSection) {
        // Update existing section
        const { error: sectionUpdateError } = await client
          .from("FormSection")
          .update({ name: section.name })
          .eq("id", existingSection.id);

        if (sectionUpdateError) throw sectionUpdateError;
      } else {
        // Create new section
        const { data: newSection, error: sectionCreateError } = await client
          .from("FormSection")
          .insert({
            name: section.name,
            formId: validatedData.id
          })
          .select()
          .single();

        if (sectionCreateError) throw sectionCreateError;
        existingSectionsMap.set(section.name, newSection);
      }

      // Update or create fields for this section
      for (const field of section.fields || []) {
        const sectionId = existingSection?.id || existingSectionsMap.get(section.name)?.id;
        if (!sectionId) throw new Error("Section ID not found");

        const fieldKey = field.id || 0;
        const existingField = existingFieldsMap.get(fieldKey);
        console.log("🚀 ~ PUT ~ existingField:", existingField)

        if (existingField) {
          // Update existing field
          const { error: fieldUpdateError } = await client
            .from("FormField")
            .update({
              name: field.name,
              type: field.type,
              isRequired: field.isRequired,
              order: field.order,
            })
            .eq("id", existingField.id);

          if (fieldUpdateError) throw fieldUpdateError;

          // Handle options for existing field
          if (field.options && (field.type === "RADIO" || field.type === "CHECKBOX" || field.type === "SELECT")) {
            // Delete existing options
            const { error: deleteOptionsError } = await client
              .from("FormOption")
              .delete()
              .eq("formFieldId", existingField.id);

            if (deleteOptionsError) throw deleteOptionsError;

            // Insert new options
            if (field.options.length > 0) {
              const { error: insertOptionsError } = await client
                .from("FormOption")
                .insert(
                  field.options.map((option, index) => ({
                    name: option.name,
                    value: option.value,
                    order: index + 1,
                    formFieldId: existingField.id
                  }))
                );

              if (insertOptionsError) throw insertOptionsError;
            }
          }
        } else {
          // Create new field
          const { data: newField, error: fieldCreateError } = await client
            .from("FormField")
            .insert({
              name: field.name,
              type: field.type,
              isRequired: field.isRequired,
              order: field.order,
              sectionId: sectionId
            })
            .select()
            .single();

          if (fieldCreateError) throw fieldCreateError;
          existingFieldsMap.set(fieldKey, newField);

          // Handle options for new field
          if (field.options && (field.type === "RADIO" || field.type === "CHECKBOX" || field.type === "SELECT")) {
            if (field.options.length > 0) {
              const { error: insertOptionsError } = await client
                .from("FormOption")
                .insert(
                  field.options.map((option, index) => ({
                    name: option.name,
                    value: option.value,
                    order: index + 1,
                    formFieldId: newField.id
                  }))
                );

              if (insertOptionsError) throw insertOptionsError;
            }
          }
        }
      }
    }

    // Soft delete removed sections and their fields
    const sectionsToDelete = Array.from(existingSectionsMap.values())
      .filter((section) => !validatedData.sections?.some((s) => s.name === section.name));

    if (sectionsToDelete.length > 0) {
      const { error: deleteError } = await client
        .from("FormSection")
        .delete()
        .in(
          "id",
          sectionsToDelete.map((section) => section.id)
        );

      if (deleteError) throw deleteError;
    }

    return NextResponse.json(updatedForm);
  } catch (error) {
    console.error("Error updating form:", error);
    return NextResponse.json(
      { error: "Failed to update form" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/organization/forms
export async function DELETE(req: NextRequest) {
  try {
    const [, user] = await getUser(req);
    const client = await createClient();
    const body = await req.json();
    
    // Validate request body
    const validatedData = deleteFormSchema.parse(body);

    // Delete the form and all related data
    const { error } = await client
      .from("Form")
      .delete()
      .eq("id", validatedData.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json(
      { error: "Failed to delete form" },
      { status: 500 }
    );
  }
} 