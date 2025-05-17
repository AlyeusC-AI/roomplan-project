import type { Note, CreateNoteDto, UpdateNoteDto } from "../types/note";
import { apiClient } from "./client";

class NotesService {
  async create(data: CreateNoteDto): Promise<Note> {
    const response = await apiClient.post<Note>("/notes", data);
    return response.data;
  }

  async findAll(roomId: string): Promise<Note[]> {
    const response = await apiClient.get<Note[]>(`/notes/room/${roomId}`);
    return response.data;
  }

  async findOne(id: string): Promise<Note> {
    const response = await apiClient.get<Note>(`/notes/${id}`);
    return response.data;
  }

  async update(id: string, data: UpdateNoteDto): Promise<Note> {
    const response = await apiClient.patch<Note>(`/notes/${id}`, data);
    return response.data;
  }

  async remove(id: string): Promise<Note> {
    const response = await apiClient.delete<Note>(`/notes/${id}`);
    return response.data;
  }
}

export const notesService = new NotesService();
