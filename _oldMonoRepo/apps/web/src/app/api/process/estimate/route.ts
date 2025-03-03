import { TextractDocument } from "amazon-textract-response-parser";
import { NextRequest, NextResponse } from "next/server";

const {
  TextractClient,
  GetDocumentAnalysisCommand,
} = require("@aws-sdk/client-textract");

const textract = new TextractClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_REKOGNITION_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_REKOGNITION_SECRET_ACCESS_KEY || "",
  },
});

// TODO HANDLE NextToken
async function getJobsFromTextract(JobId: string) {
  const params = { JobId };

  // if (NextToken) params.NextToken = NextToken;

  const command = new GetDocumentAnalysisCommand(params);

  try {
    return await textract.send(command);
  } catch (err) {
    // Handle error
    console.log("ERR", err);
    return err;
  }
}

export async function POST(req: NextRequest) {
  const { jobId } = await req.json();
  console.log("Requesting job: ", jobId);
  const jobData = await getJobsFromTextract(jobId);
  const parsed = new TextractDocument(jobData);
  console.log("Parsed", parsed);
  // console.log('Got data', jobData)
  return NextResponse.json("ok", { status: 200 });
}
