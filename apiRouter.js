import express from "express";
import { getQuestionObject, formQuestionAndAnswer, getWrongAnswers } from "./questionUtils.js";

export const apiRouter = express.Router()

apiRouter.get("/question", async (req, res) => {
    console.log("request received");
    console.log(req.query)
    console.log(req.params)
    const questionObject = await getQuestionObject(req.query, req.params);
    const { question, answer } = await formQuestionAndAnswer(questionObject);
    const wrongAnswers = await getWrongAnswers(questionObject, answer);

    res.json({
        question,
        answer,
        wrongAnswers,
    });
});

apiRouter.get("/question/:diff", async (req, res) => {
    console.log("request received");
    console.log(req.query)
    console.log(req.params)
    const questionObject = await getQuestionObject(req.query, req.params);
    const { question, answer } = await formQuestionAndAnswer(questionObject);
    const wrongAnswers = await getWrongAnswers(questionObject, answer);

    res.json({
        question,
        answer,
        wrongAnswers,
    });
})