import getProjectForOrg from "@servicegeek/db/queries/project/getProjectForOrg";
import getUser from "@servicegeek/db/queries/user/getUser";
import { File } from "formidable";
const fs = require("fs").promises;

import { supabaseServiceRole } from "./admin";

const uploadFileToProject = async (
  userId: string,
  projectPublicId: string,
  file: File
) => {
  const servicegeekUser = await getUser(userId);
  const organizationId = servicegeekUser?.org?.organization.id;
  if (!organizationId) return null;
  const project = await getProjectForOrg(projectPublicId, organizationId);
  if (!project) {
    return null;
  }

  const fsdata = await fs.readFile(file.filepath);
  const inputBuffer = Buffer.from(fsdata);

  console.log(
    "uploading data",
    `${servicegeekUser.org?.organization.publicId}/${projectPublicId}/${file.originalFilename}`
  );
  const { data, error } = await supabaseServiceRole.storage
    .from("user-files")
    .upload(
      `${servicegeekUser.org?.organization.publicId}/${projectPublicId}/${file.originalFilename}`,
      inputBuffer,
      {
        upsert: true,
        contentType: file.mimetype || undefined,
      }
    );

  if (error) {
    console.log("error uploading", error);
    return null;
  }

  return data;
};

export default uploadFileToProject;
