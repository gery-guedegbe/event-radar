"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = require("express");
const db_1 = require("../config/db");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 5MB
    },
});
const uploadRouter = (0, express_1.Router)();
exports.uploadRouter = uploadRouter;
uploadRouter.post("/", upload.single("file"), async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    console.log("Fichier reçu:", file.originalname, file.mimetype, file.size);
    const fileName = `events/${Date.now()}-${file.originalname}`;
    try {
        const { data, error } = await db_1.supabase.storage
            .from("images")
            .upload(fileName, file.buffer, {
            contentType: file.mimetype,
        });
        if (error)
            throw error;
        const { data: { publicUrl }, } = db_1.supabase.storage.from("images").getPublicUrl(data.path);
        return res.status(200).json({ url: publicUrl });
    }
    catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ error: "Upload failed" });
    }
});
