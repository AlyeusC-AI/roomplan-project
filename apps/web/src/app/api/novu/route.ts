import { serve } from "@novu/framework/next";
import { testWorkflow } from "@/lib/novu";

export const { GET, POST, OPTIONS } = serve({ workflows: [testWorkflow] });
