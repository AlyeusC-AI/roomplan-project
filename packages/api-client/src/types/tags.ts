export interface Tag {
  id: string;
  name: string;
  type: "PROJECT" | "IMAGE";
  color?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TagFilters {
  type?: "PROJECT" | "IMAGE";
  organizationId: string;
  searchTerm?: string;
}

export interface CreateTagDto {
  name: string;
  type: "PROJECT" | "IMAGE";
  color?: string;
  organizationId: string;
}

export interface UpdateTagDto {
  name?: string;
  color?: string;
}

export interface SetTagsDto {
  tagNames: string[];
  organizationId: string;
}

export interface BulkUpsertTagsDto {
  tags: Array<{
    name: string;
    type: "PROJECT" | "IMAGE";
    color?: string;
    organizationId: string;
  }>;
}

export interface TagStats {
  totalTags: number;
  projectTags: number;
  imageTags: number;
  mostUsedTags: Array<{
    id: string;
    name: string;
    type: "PROJECT" | "IMAGE";
    color: string;
    usageCount: number;
  }>;
}

export interface ProjectWithTags {
  id: string;
  name: string;
  tags: Tag[];
}

export interface ImageWithTags {
  id: string;
  url: string;
  tags: Tag[];
}
