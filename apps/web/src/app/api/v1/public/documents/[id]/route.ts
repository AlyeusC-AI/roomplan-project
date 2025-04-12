import { supabaseServiceRole } from "@lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";


const createDocumentSchema = z.object({
    projectId: z.string(),
    json: z.string(),
  });

// GET /api/v1/public/documents/[id]
export async function GET(
  req: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log("🚀 ~ params:", params)
  try {
    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get("projectId");
    const {id,} = await params;
    console.log("🚀 ~ projectId:", projectId)

const {data:project, error:projectError} = await supabaseServiceRole
.from("Project").select("*")
.eq("publicId", projectId!)
.single();

if (projectError) throw projectError;

    let document;
    // Get document by ID
    const { data: documentIsExists, error: documentIsExistsError } = await supabaseServiceRole
      .from("Document")
      .select("*")
      .eq("publicId", id)
      .eq("projectId", project.id)
      .single();
      console.log("🚀 ~ documentIsExists:", documentIsExists)

    document = documentIsExists;
    if(!documentIsExists) {
        const { data: originalDocument, error: originalDocumentError } = await supabaseServiceRole
        .from("Document")
        .select("*")
        .eq("publicId", id)
        .single();

        if (originalDocumentError) throw originalDocumentError;

        document = originalDocument;
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

// POST /api/v1/public/documents/[id]
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const {id} = await params;
      const body = await req.json();
      
      // Validate request body
      const validatedData = createDocumentSchema.parse(body);
      
   let document;
      
   const {data:project, error:projectError} = await supabaseServiceRole
   .from("Project").select("*")
   .eq("publicId", validatedData.projectId!)
   .single();
   if (projectError) throw projectError;

      // Start a transaction
      const { data: isDocumentExists, error: documentError } = await supabaseServiceRole
        .from("Document").select("*")
        .eq("publicId", id)
        .eq("projectId", project.id)
        
        .single();
        console.log("🚀 ~ POST ~ isDocumentExists:", isDocumentExists)

    //   if (documentError) throw documentError;
  
      if (isDocumentExists) {
       
        const { data: updatedDocument, error: updatedDocumentError } = await supabaseServiceRole
        .from("Document").update({
            json: validatedData.json
        })
        .eq("publicId", id)
        .eq("projectId", project.id)
        
        .single();
        
        if (updatedDocumentError) throw updatedDocumentError;
        
        document = updatedDocument;
      } else {
const {data:originalDocument, error:originalDocumentError} = await supabaseServiceRole
.from("Document").select("*")
.eq("publicId", id)

.single();

if (originalDocumentError) throw originalDocumentError;



        const { data: newDocument, error: newDocumentError } = await supabaseServiceRole
        .from("Document").insert({
            json: validatedData.json,
            projectId: project.id,
            url:originalDocument?.url,
            name:originalDocument?.name,
            publicId:originalDocument?.publicId

        }).select("*")
        .single();
        
        if (newDocumentError) throw newDocumentError;
        
        document = newDocument;
      }

      return NextResponse.json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      return NextResponse.json(
        { error: "Failed to create document" },
        { status: 500 }
      );
    }
  }