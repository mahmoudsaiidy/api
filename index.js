require('dotenv').config(); 
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require("axios");

const Chat = require('./modules/chat');

app.use(bodyParser.json());
app.use(cors());


mongoose.connect("mongodb+srv://ai:10203040@cluster0.1ipyd.mongodb.net/").then(r => console.log('connect to db'))
.catch(e => console.log('connect faild', e));

async function Update(email, message, response) {
    try {
        const exist = await Chat.findOne({ email });

        if (exist) {
            exist.chat.push({ message, response }); 
            await exist.save();
            console.log("Chat updated successfully:", exist);

        } else {
            // if the user the one calling then this case hase been handled 
            const newChat = new Chat({
                email,
                chat: [{ message, response }]  
            });
            await newChat.save();
            console.log("New chat document created:", newChat);
        }
    } catch (e) {
        console.error("Error updating chat:", e);
    }
}


app.post('/chat-with-ai', async (req, res) => {
    try {
        const { email, message } = req.body;
        const response = await axios.post("https://9df4-34-145-69-15.ngrok-free.app/chat", { message });

        if(typeof response.data === 'string'){
            response.data = JSON.parse(response.data)
        }

        let filterResponse = response.data.response.replace(/\n+/g, ' ').replace(/\*/g, '').replace(/\\/g, '');

        await Update(email, message, filterResponse);
        console.log(response.data);
        res.json(filterResponse);

    } catch (e) {
        console.error("Error:", e);
        res.status(500).json({ err: "Error communicating with AI server" });
    }
});


app.post('/all-chat', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        let chatData = await Chat.findOne({ email }).lean();
        if (!chatData) {
            chatData = new Chat({
                email,
                chat: []
            });
            await chatData.save();
        }

        chatData.chat = chatData.chat.map(({ _id, ...rest }) => rest);
        console.log(chatData.chat);
        res.json(chatData.chat);

    } catch (e) {
        console.error("Error fetching chat:", e);
        res.status(500).json({ e: "Internal Server Error" });
    }
});  

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    res.send({ msg :"online" })
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log('online'); });
