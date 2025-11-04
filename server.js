import express from "express";
import pool from "./db.js";

const app = express();

app.get("/api/question", async (req, res) => {
    const questionObject = await getQuestionObject();
    const { question, answer } = await formQuestionAndAnswer(questionObject);
    const wrongAnswers = await getWrongAnswers(questionObject, answer);

    res.json({
        question,
        answer,
        wrongAnswers,
    });
});

async function getQuestionObject() {
    const questionQueryResult = await pool.query(
        "SELECT * FROM questions LIMIT 1;"
    );
    return questionQueryResult.rows[0];
}

async function formQuestionAndAnswer(questionObject) {
    const { template, template_type, choice_type, table_to_retrieve } =
        questionObject;
    const answerQuery = `SELECT ${template_type}, ${choice_type} FROM ${table_to_retrieve} ORDER BY RANDOM() LIMIT 1;`;
    const answerObject = await pool.query(answerQuery);
    const question = template.replace(
        /<[^>]+>/,
        answerObject.rows[0][template_type]
    );
    const answer = answerObject.rows[0][choice_type];

    return { question, answer };
}

async function getWrongAnswers(questionObject, answer) {
    const { choice_type, table_to_retrieve } = questionObject;
    const wrongAnswerQuery = `
        SELECT ${choice_type}
        FROM (
            SELECT DISTINCT ${choice_type}
            FROM ${table_to_retrieve}
            WHERE ${choice_type} != '${answer}'
        )
        ORDER BY RANDOM()
        LIMIT 3;
    `;
    const wrongAnswerObject = await pool.query(wrongAnswerQuery);
    const wrongAnswers = [];
    for (const wrongAnswer of wrongAnswerObject.rows) {
        wrongAnswers.push(wrongAnswer[`${choice_type}`]);
    }

    return wrongAnswers;
}

app.listen(8000, () => {
    console.log("Listening on port 8000");
});
