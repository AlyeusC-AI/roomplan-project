import { api } from "@/lib/api";
import { toast } from "sonner-native";

interface ConnectFormParams {
  formId: number;
  projectId: string;
}

/**
 * Connects a form to a project
 */
export async function connectFormToProject({ formId, projectId }: ConnectFormParams) {
  try {
    const response = await api.post("/api/v1/organization/forms/connect", {
      formId,
      projectId,
    });

    const data = response.data;

    if (response.status !== 200) {
      throw new Error(data.error || "Failed to connect form to project");
    }

    toast.success("Form connected successfully");
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to connect form";
    toast.error(message);
    throw error;
  }
}

/**
 * Disconnects a form from a project
 */
export async function disconnectFormFromProject({ formId, projectId }: ConnectFormParams) {
  try {
    const response = await api.delete("/api/v1/organization/forms/connect", {
      data: { formId, projectId },
      headers: {
        "Content-Type": "application/json",
      },
    });

            const data = response.data;

    if (response.status !== 200) {
      throw new Error(data.error || "Failed to disconnect form from project");
    }

    toast.success("Form disconnected successfully");
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to disconnect form";
    toast.error(message);
    throw error;
  }
}

/**
 * Gets all form connections for a specific project
 */
export async function getFormConnections(projectId: string) {
  try {
    const response = await api.get(`/api/v1/organization/forms/connect?projectId=${projectId}`);

    const data = response.data;

    if (response.status !== 200) {
      throw new Error(data.error || "Failed to get form connections");
    }

    return data.connections;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get form connections";
    toast.error(message);
    throw error;
  }
} 