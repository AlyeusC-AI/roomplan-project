declare global {
  interface ImageQuery_User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }

  interface ImageQuery_ImageNote {
    id: string;
    createdAt: string;
    updatedAt: string;
    imageId: string;
    body: string;
    mentions: string[];
    userId: string;
    User: ImageQuery_User;
    isDeleted: boolean;
  }

  interface ImageQuery_Room {
    publicId: string;
    name: string;
  }

  interface ImageQuery_Inference {
    publicId: string;
    Room: ImageQuery_Room;
  }

  interface ImageQuery_Image {
    createdAt: string;
    publicId: string;
    key: string;
    includeInReport: boolean;
    description: string;
    id: string;
    ImageNote: ImageQuery_ImageNote[];
    Inference: ImageQuery_Inference[];
  }

  interface ImageQuery_Input {
    onlySelected: boolean;
    sortDirection: string;
    rooms: string[];
    includUrlMap: boolean;
  }
}

export {};
