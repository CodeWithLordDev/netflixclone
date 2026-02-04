import express from "express";
import { checkUserPlan } from "../middleware/CheckUserPlan.js";

const router = express.Router();

router.get("/plan-status", checkUserPlan, (req, res) => {
  res.json({
    plan: req.userPlan,
    showAd: req.userPlan === "free",
  });
});

export default router;
