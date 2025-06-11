import { Router, Request, Response } from "express";
import { supabase } from "../config/db";
import multer from "multer";

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 5MB
  },
});

const uploadRouter = Router();

uploadRouter.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response): Promise<any> => {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Fichier reçu:", file.originalname, file.mimetype, file.size);

    const fileName = `events/${Date.now()}-${file.originalname}`;

    try {
      const { data, error } = await supabase.storage
        .from("images")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(data.path);

      return res.status(200).json({ url: publicUrl });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ error: "Upload failed" });
    }
  }
);

export { uploadRouter };
