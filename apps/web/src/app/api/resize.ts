// import handleUpload from "@lib/image-processing/handleUpload";
// import { NextApiRequest, NextApiResponse } from "next";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };
// // Used by mobile app
// export default async function ProtectedRoute(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method === "POST") return await handleUpload(req, res);
//   else
//     return res
//       .status(405)
//       .json({ Error: `Operation ${req.method} not allowed` });
// }
