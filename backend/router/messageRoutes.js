import express from 'express';
import { deleteMessage, getAllMessages, sendMessage } from '../controller/messageController.js';

const router = express.Router();

router.post("/send", sendMessage)
router.get("/get", getAllMessages)
router.delete("/delete/:id", deleteMessage)

export default router;