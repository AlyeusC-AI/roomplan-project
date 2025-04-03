import { toast } from "sonner";

interface ConnectFormParams {
  formId: number;
  projectId: string;
}

/**
 * Connects a form to a project
 */
export async function connectFormToProject({ formId, projectId }: ConnectFormParams) {
  try {
    const response = await fetch("/api/v1/organization/forms/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ formId, projectId }),
    });

    const data = await response.json();

    if (!response.ok) {
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
    const response = await fetch("/api/v1/organization/forms/connect", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ formId, projectId }),
    });

    const data = await response.json();

    if (!response.ok) {
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
    const response = await fetch(`/api/v1/organization/forms/connect?projectId=${projectId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to get form connections");
    }

    return data.connections;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get form connections";
    toast.error(message);
    throw error;
  }
} 