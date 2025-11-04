import express from "express";
import pool from "./db.js";

const app = express();

app.get("/api/question", async (req, res) => {
    const result = await pool.query("SELECT * FROM questions LIMIT 1;");
    const { template, template_type, choice_type, table_to_retrieve } =
        result.rows[0];
    const answer_query = `SELECT ${template_type}, ${choice_type} FROM ${table_to_retrieve} LIMIT 1;`;

    const answerObject = await pool.query(answer_query);
    const question = template.replace(
        /<[^>]+>/,
        answerObject.rows[0][template_type]
    );
    const correctAnswer = answerObject.rows[0][choice_type];

    const wrong_answer_query = `SELECT ${choice_type} FROM ${table_to_retrieve} WHERE ${choice_type} != '${correctAnswer}' LIMIT 3;`;
    const wrong_answer_object = await pool.query(wrong_answer_query);
    const wrong_answers = [];
    for (const wrong_answer of wrong_answer_object.rows) {
        wrong_answers.push(wrong_answer[`${choice_type}`]);
    }

    res.json({
        question: question,
        answer: correctAnswer,
        wrongAnswers: wrong_answers,
    });
});

app.listen(8000, () => {
    console.log("Listening on port 8000");
});
