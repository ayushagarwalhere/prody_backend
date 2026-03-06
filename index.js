import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
const port = 3000;

app.use(cookieParser());
app.use(cors());

app.get("/check", (req, res) => {
  res.status(200).json({ status: "positive" });
});

app.listen(port, () => {
  console.log("Server started at http://localhost:3000");
});
