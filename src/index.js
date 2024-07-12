require('dotenv').config();

const tmi = require('tmi.js');

const { DateTime } = require('luxon');

// ----------------COMMANDS--------------

const rank = require('./commands/rank.js');
const clip = require('./commands/clip.js');
const post = require('./commands/post.js');

// ----------------UTIL------------------

const MemoryManager = require('./util/memoryManager.js');
const memoryManager = new MemoryManager();
const ai = require('./util/ai.js');
const followChannel = require('./util/followChannel.js');
const isFollowersChatOnly = require('./util/isFollowersChatOnly.js');

// ----------------TMI------------------

const channel = process.env.CHANNEL;
const username = process.env.BOT_USERNAME;
const password = process.env.BOT_PASSWORD;

const options = {
    options : { debug : false },
    connection : { 
        reconnect : true,
        secure : true
     },
     identity : {
            username,
            password
        },
        channels : [channel]
    };


const messageStorage = [];

const client = new tmi.client(options);
client.connect().catch(console.error);


// ----------------EVENTS----------------

client.on('connected', async () => {
    console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Connected to Twitch`);

});

client.on('message', async (channel, user, message, self) => {

    try {

        if(self)return;

        // -----COMMANDS------
    
         if(message.toLowerCase() == '!rank'){
             const rankInfo = await rank(user.username);
             return client.say(channel, rankInfo);

         }

        if(message.toLowerCase() == '!tonka'){
            return client.say(channel, 'Tonka is a cool guy');

        }

        if(message.toLowerCase().startsWith('!clip')){
            const args = message.split(' ');
            const duration = parseInt(args[1]) || 30;
            const clipUrl = await clip(duration);
            if(clipUrl){
                return client.say(channel, `Clip created: ${clipUrl}`);
            } else {
                return client.say(channel, 'Failed to create clip.');
            }
        }

        if(message.toLowerCase().startsWith('!post')){
            const args = message.split(' ');
            const duration = parseInt(args[1]) || 30;
            const postUrl = await post(duration);
            if(postUrl){
                console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Post URL: ${postUrl}`);
                return client.say(channel, `Posted on: ${postUrl}`);
            } else {
                return client.say(channel, 'Failed to post the clip.');
            }
        }

        // -----AI CHAT------

        if (parseInt(process.env.CHATBOT) == 1){  

            if(message.toLowerCase().includes(process.env.CHATBOT_KEYWORD) || message.includes(`@${options.identity.username}`)){

                const aiResponse = await ai(user.username, memoryManager, message,1);

                return client.say(channel, aiResponse);
                
            } else {

                messageStorage.push("username : "+user.username+", message : "+message);

            }

            if(messageStorage.length == 9 ){
                const aiResponse = await ai(user.username, memoryManager, "Chat summary : "+messageStorage.join(' '),0 );
                client.say(channel, aiResponse);
                messageStorage.length = 0; 
                return;
            }

        }
        
    } catch (error) {
        console.error(`[${DateTime.utc().toFormat('HH:mm')}] info: Error: `+ error.message);
    }

});

client.on('notice', (channel, msgid, message) => {
    
    console.log(`[${DateTime.utc().toFormat('HH:mm')}] error: ${channel} - ${message}`);
});



