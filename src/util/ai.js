const axios = require('axios');
const { DateTime } = require('luxon');
require('dotenv').config();
async function ai(user, memoryManager, message, x){

    const history = memoryManager.getUserHistory(user);

    let historySummary = history.map(h => `Prompt: "${h.prompt}", Response: "${h.response}"`).join('; ');
    
    if (historySummary.length > 0) {
        historySummary = `Previous convo : ${historySummary}`;
    }

    const headers = {
        Authorization: `Bearer ${process.env.SHARD_API_KEY}`,
        
    }

    var data;

    if (x == 1){
            data = {
            model : "llama-3-70b",
            messages: [
                {
                    role: "system",
                    content: process.env.AI_SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: `last convo: ${historySummary}, new prompt: ${message}`,
                }
            ],
            stream: false
        };
    }

    if (x == 0){
        data = {
            model : "llama-3-70b",
            messages: [
                {
                    role: "system",
                    content: process.env.AI_SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: `${message}`,
                }
            ],
            stream: false
        };
    }

    try {

        const response = await axios.post(process.env.SHARD_API_LINK, data, { headers });

        if(response.status === 200){

            console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: AI request successful.`);
            

            if (x == 1){ 
                memoryManager.addToHistory(user, message, response.data.choices[0].message.content);
                return `@${user} ${response.data.choices[0].message.content}`; 
            }

            if (x == 0){ return response.data.choices[0].message.content; }


        }

    } catch (error) {
        console.error(`[${DateTime.utc().toFormat('HH:mm')}] error: Error getting the response from  SHARD API: `+ error.message);
    }

}

module.exports = ai;