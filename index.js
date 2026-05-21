/*
 Give credits to Kevin dev
 Contact me at 256742932677
 Base creator and pterodactyl panels seller.
 
*/

process.on("uncaughtException", (err) => {
    console.error("Caught exception:", err);
});

console.clear();
console.log('Starting...');

require('./setting/config');

const { 
    default: 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    jidDecode, 
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");

const pino = require('pino');
const chalk = require('chalk');
const readline = require("readline");
const FileType = require('file-type');
const fs = require('fs');
const path = require('path');

const {
    Boom 
} = require('@hapi/boom');

const {
    smsg,
    formatSize, 
    isUrl, 
    generateMessageTag,
    getBuffer,
    getSizeMedia, 
    runtime, 
    fetchJson, 
    sleep 
} = require('./start/lib/myfunction');
const PluginManager = require('./start/lib/PluginManager');

const usePairingCode = true;

const question = (text) => {
    const rl = readline.createInterface({ 
        input: process.stdin, output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(text, (ans) => {
            rl.close();
            resolve(ans);
        });
    });
}
const { makeInMemoryStore } = require("./start/lib/store/");

async function loadAllPlugins() {
    try {
        
        const pluginManager = new PluginManager();
        const pluginsDir = path.join(__dirname, 'Plugins');
        
        if (!fs.existsSync(pluginsDir)) {
            fs.mkdirSync(pluginsDir, { recursive: true });
            console.log(chalk.yellow(`📁 Created plugins directory: ${pluginsDir}`));
        }
        
        const count = pluginManager.loadPlugins(pluginsDir);
        console.log(chalk.green(`✅ Loaded ${count} plugins successfully!`));
        global.pluginManager = pluginManager;
        return count;
    } catch (error) {
        console.error(chalk.red(`Error loading plugins: ${error.message}`));
        return 0;
    }
}


const store = makeInMemoryStore({
    logger: pino().child({
        level: 'silent',
        stream: 'store'
    })
});

async function kelvinstart() {

await loadAllPlugins();

    const {
        state,
        saveCreds 
    } = await useMultiFileAuthState('./session');
    
    const kelvin = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: !usePairingCode,
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

  
    if (usePairingCode && !kelvin.authState.creds.registered) {
        try {
            const phoneNumber = await question(chalk.greenBright(`Thanks for choosing Kelvin Tech Base. Please provide your number start with 256xxx:\n`));
            
            let code;
            if (typeof global !== 'undefined' && global.pairingCode) {
                
                try {
                    code = await kelvin.requestPairingCode(phoneNumber.trim(), `${global.pairingCode}`);
                } catch (err) {

                    code = await kelvin.requestPairingCode(phoneNumber.trim());
                }
            } else {
                code = await kelvin.requestPairingCode(phoneNumber.trim());
            }
            console.log(`your pairing code: ${code}`);
        } catch (e) {
            console.error("Failed to request pairing code:", e);
        }
    }

    store.bind(kelvin.ev);
   
    kelvin.ev.on('messages.upsert', async chatUpdate => {
   try {
     let mek = chatUpdate.messages[0];
     if (!mek.message) return;
     mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
     
     // Handle status updates
     if (mek.key && mek.key.remoteJid === 'status@broadcast') {
         return; // Don't process status as regular messages
     }
     
     // Continue with regular message processing
     // if (!kelvin.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
     
     let m = smsg(kelvin, mek, store);
     
     // Log ALL messages to console for debugging
     const senderName = mek.pushName || "Unknown";
     const senderNumber = mek.key.participant ? mek.key.participant.split('@')[0] : mek.key.remoteJid.split('@')[0];
     const isGroup = mek.key.remoteJid.endsWith('@g.us');
     
     // use system.js to handle plugins 
     require("./system")(kelvin, m, chatUpdate, store);
     
   } catch (err) {
     console.error(err);		
   }
});

    kelvin.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };

    kelvin.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = kelvin.decodeJid(contact.id);
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
        }
    });

    kelvin.public = global.status;

    kelvin.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            console.log(lastDisconnect.error);
            if (lastDisconnect.error == 'Error: Stream Errored (unknown)') {
                process.exit();
            } else if (reason === DisconnectReason.badSession) {
                console.log(`Bad Session File, Please Delete Session and Scan Again`);
                process.exit();
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log('Connection closed, reconnecting...');
                process.exit();
            } else if (reason === DisconnectReason.connectionLost) {
                console.log('Connection lost, trying to reconnect');
                process.exit();
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log('Connection Replaced, Another New Session Opened, Please Close Current Session First');
                kelvin.logout();
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(`Device Logged Out, Please Scan Again And Run.`);
                kelvin.logout();
            } else if (reason === DisconnectReason.restartRequired) {
                console.log('Restart Required, Restarting...');
                await kelvinstart();
            } else if (reason === DisconnectReason.timedOut) {
                console.log('Connection TimedOut, Reconnecting...');
                kelvinstart();
            }
        } else if (connection === "connecting") {
            console.log('connecting . . . ');
        } else if (connection === "open") {
            console.log('Bot connected successfully');
        }
    });

    kelvin.sendText = (jid, text, quoted = '', options) => {
	    kelvin.sendMessage(jid, { text: text, ...options }, { quoted });
    }
    
    kelvin.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message;
        let mime = (message.msg || message).mimetype || "";
        let messageType = message.mtype
            ? message.mtype.replace(/Message/gi, "")
            : mime.split("/")[0];

        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        let type = await FileType.fromBuffer(buffer);
        let trueFileName = attachExtension ? (filename + "." + (type ? type.ext : 'bin')) : filename;
        await fs.writeFileSync(trueFileName, buffer);
        return trueFileName;
    };

    
    kelvin.downloadMediaMessage = async (message) => {
          let mime = (message.msg || message).mimetype || ''
          let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
          const stream = await downloadContentFromMessage(message, messageType)
          let buffer = Buffer.from([])
            for await(const chunk of stream) {
		buffer = Buffer.concat([buffer, chunk])}
	    return buffer
    } 
    
    kelvin.ev.on('creds.update', saveCreds);
    return kelvin;
}

kelvinstart();

let file = require.resolve(__filename);
require('fs').watchFile(file, () => {
    require('fs').unwatchFile(file);
    console.log('\x1b[0;32m' + __filename + ' \x1b[1;32mupdated!\x1b[0m');
    delete require.cache[file];
    require(file);
});