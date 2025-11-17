import pool from "./db.js";

export async function getQuestionObject(queryParams, pathParams) {
    let questionQuery = "SELECT * FROM questions";

    const hasPathParam = Object.keys(pathParams).length > 0;
    const hasQueryParam = Object.keys(queryParams).length > 0;

    if (hasPathParam && hasQueryParam) {
        questionQuery += ` WHERE difficulty='${pathParams.diff}'`;

        if (typeof queryParams.category == "string") {
            questionQuery += `AND category='${queryParams.category}'`;
        } else {
            let cur = 0;

            for (let category of queryParams.category) {
                if (cur == 0) {
                    questionQuery += ` AND (category='${category}'`;
                } else {
                    questionQuery += ` OR category='${category}'`;
                }
                cur += 1;
            }

            questionQuery += ")";
        }
    } else if (hasQueryParam) {
        if (typeof queryParams.category == "string") {
            questionQuery += ` WHERE category='${queryParams.category}'`;
        } else {
            let cur = 0;

            for (let category of queryParams.category) {
                if (cur == 0) {
                    questionQuery += ` WHERE category='${category}'`;
                } else {
                    questionQuery += ` OR category='${category}'`;
                }
                cur += 1;
            }
        }
    } else if (hasPathParam) {
        questionQuery += ` WHERE difficulty='${pathParams.diff}'`;
    }

    questionQuery += ` ORDER BY RANDOM() LIMIT 1;`;
    const questionQueryResult = await pool.query(questionQuery);

    return questionQueryResult.rows[0];
}

export async function formQuestionAndAnswer(questionObject) {
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

export async function getWrongAnswers(questionObject, answer) {
    const { choice_type, table_to_retrieve } = questionObject;
    const wrongAnswerQuery = `
        SELECT ${choice_type}
        FROM (
            SELECT DISTINCT ${choice_type}
            FROM ${table_to_retrieve}
            WHERE ${choice_type} != $$${answer}$$
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
