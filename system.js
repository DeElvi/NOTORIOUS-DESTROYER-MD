/*
 * Give credits to Kevindev
 * Contact me on +256742932677
 * Coding sounds louder 
*/

require('./setting/config');
const fs = require('fs');
const yts = require('yt-search');
const util = require("util");
const axios = require('axios');
const os = require('os');
const lolcatjs = require('lolcatjs');
const { performance } = require('perf_hooks');
const moment = require("moment-timezone");
const path = require('path');
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);
const timezones = global.timezones || "Africa/Kampala";

const {
  spawn,
  exec, 
  execSync 
} = require('child_process');

const { 
  default: baileys,
  proto, 
  generateWAMessage,
  generateWAMessageFromContent,
  getContentType, 
  downloadContentFromMessage,
  prepareWAMessageMedia
} = require("@whiskeysockets/baileys");
const { ok } = require('assert');
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


// Menu Images - KelvinTech Style
let kelvinkid1, kelvinkid2, kelvinkid3;

// Load images
try {
    kelvinkid1 = fs.readFileSync("./Media/Kelvin1.jpg");
    kelvinkid2 = fs.readFileSync("./Media/Kelvin2.jpg");
    kelvinkid3 = fs.readFileSync("./Media/Kelvin3.jpg");
} catch (e) {
    console.log('Menu images not found, using fallback');
}

module.exports = kelvin = async (kelvin, m, chatUpdate, store) => {
    try {
        const body = (
            m.mtype === "conversation" ? m.message.conversation :
            m.mtype === "imageMessage" ? m.message.imageMessage.caption :
            m.mtype === "videoMessage" ? m.message.videoMessage.caption :
            m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text :
            m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId :
            m.mtype === "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
            m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId :
            m.mtype === "interactiveResponseMessage" ? JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id :
            m.mtype === "templateButtonReplyMessage" ? m.msg.selectedId :
            m.mtype === "messageContextInfo" ? m.message.buttonsResponseMessage?.selectedButtonId || 
                                               m.message.listResponseMessage?.singleSelectReply.selectedRowId || 
                                               m.text : ""
        );
        
        const sender = m.key.fromMe ? kelvin.user.id.split(":")[0] + "@s.whatsapp.net" || kelvin.user.id : m.key.participant || m.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        const budy = (typeof m.text === 'string' ? m.text : '');
        
        const prefix = '.'; // Default prefix
        const isCmd = body && typeof body === 'string' && body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : '';
        const args = isCmd ? body.slice(prefix.length).trim().split(/ +/).slice(1) : [];
        const text = args.join(" ");
        
        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        const contributor = JSON.parse(fs.readFileSync('./start/lib/database/owner.json'));

        const botNumber = await kelvin.decodeJid(kelvin.user.id);
        const Access = [botNumber, ...contributor, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
        
        const pushname = m.pushName || "No Name";
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';
        const qmsg = (quoted.msg || quoted);
        const isMedia = /image|video|sticker|audio/.test(mime);

        const groupMetadata = isGroup ? await kelvin.groupMetadata(m.chat).catch((e) => {}) : "";
        const groupOwner = isGroup ? groupMetadata.owner : "";
        const groupName = m.isGroup ? groupMetadata.subject : "";
        const participants = isGroup ? await groupMetadata.participants : "";
        const groupAdmins = isGroup ? await participants.filter((v) => v.admin !== null).map((v) => v.id) : "";
        const groupMembers = isGroup ? groupMetadata.participants : "";
        const isGroupAdmins = isGroup ? groupAdmins.includes(m.sender) : false;
        const isBotGroupAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
        const isBotAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
        const isAdmins = isGroup ? groupAdmins.includes(m.sender) : false;

        //================== [ CONSOLE LOG] ==================//
        const dayz = moment(Date.now()).tz(timezones).locale('en').format('dddd');
        const timez = moment(Date.now()).tz(timezones).locale('en').format('HH:mm:ss z');
        const datez = moment(Date.now()).tz(timezones).format("DD/MM/YYYY");

        if (m.message) {
            lolcatjs.fromString(`┏━━━━━━━━━━━━━『  Kelvin base 』━━━━━━━━━━━━━─`);
            lolcatjs.fromString(`»  Sent Time: ${dayz}, ${timez}`);
            lolcatjs.fromString(`»  Date: ${datez}`);
            lolcatjs.fromString(`»  Message Type: ${m.mtype || 'N/A'}`);
            lolcatjs.fromString(`»  Sender Name: ${pushname || 'N/A'}`);
            lolcatjs.fromString(`»  Chat ID: ${m.chat?.split('@')[0] || 'N/A'}`);
            
            if (isGroup) {
                lolcatjs.fromString(`»  Group: ${groupName || 'N/A'}`);
                lolcatjs.fromString(`»  Group JID: ${m.chat?.split('@')[0] || 'N/A'}`);
            }
            
            lolcatjs.fromString(`»  Message: ${budy || 'N/A'}`);
            lolcatjs.fromString('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━─ ⳹\n\n');
        }
        //<================================================>//
        
        const reply = (text) => m.reply(text);

        const context = {
            kelvin,
            m,
            reply,
            store,
            prefix,
            command,
            args,
            text,
            isCmd,
            sender,
            senderNumber,
            pushname,
            Access,
            isGroup,
            groupName,
            groupMetadata,
            groupOwner,
            participants,
            groupAdmins,
            quoted,
            mime,
            qmsg,
            isMedia,
            body: budy,
            botNumber,
            from,
            sleep,
            fetchJson,
            getBuffer,
            formatSize,
            timezones,
            isUrl,
            runtime,
            match: command,
            mess: global.mess,
            global: global,
            mentionedJid: m.mentionedJid || [],
            pluginManager: global.pluginManager
        };

        // Format memory function
        const formatMemory = (memory) => {
            return memory < 1024 * 1024 * 1024
                ? Math.round(memory / 1024 / 1024) + ' MB'
                : Math.round(memory / 1024 / 1024 / 1024) + ' GB';
        };

        // Progress bar function
        const progressBar = (used, total, size = 6) => {
            let percentage = Math.round((used / total) * size);
            let bar = '█'.repeat(percentage) + '░'.repeat(size - percentage);
            return `[${bar}] ${Math.round((used / total) * 100)}%`;
        };

        // Generate menu function
        const generateMenu = (plugins, ownername, prefixz, modeStatus, versions, latensie, readmore) => {
            const memoryUsage = process.memoryUsage();
            const botUsedMemory = memoryUsage.heapUsed;
            const totalMemory = os.totalmem();
            const systemUsedMemory = totalMemory - os.freemem();

            // Count total unique commands across all plugins
            let totalCommands = 0;
            const uniqueCommands = new Set();
            for (const category in plugins) {
                plugins[category].forEach(plugin => {
                    if (plugin.command && plugin.command.length > 0) {
                        uniqueCommands.add(plugin.command[0]);
                    }
                });
            }
            totalCommands = uniqueCommands.size;

            let menu = `┌─❖ *Kelvin base* ❖─\n`;
            menu += `├─• ᴜsᴇʀ: ${ownername}\n`;
            menu += `├─• ʙᴏᴛ: ${global.botname}\n`;
            menu += `├─• ᴍᴏᴅᴇ: ${kelvin.public ? 'ᴘᴜʟʙɪᴄ' : 'ᴘʀɪᴠᴀᴛᴇ'}\n`;
            menu += `├─• ᴘʀᴇғɪx: [ ${prefixz} ]\n`;
            menu += `├─• ᴄᴍᴅs: ${totalCommands}+\n`;
            menu += `├─• ᴠᴇʀsɪᴏɴ: ${versions}\n`;
            menu += `├─• sᴘᴇᴇᴅ: ${latensie.toFixed(4)} ms\n`;
            menu += `├─• 𝚁𝙰𝙼: ${progressBar(systemUsedMemory, totalMemory)}\n`;
            menu += `└─• ᴅᴇᴠ: ☘ ᴋᴇʟᴠɪɴ ᴛᴇᴄʜ ☘\n`;
            menu += `${readmore}\n`;
            
            for (const category in plugins) {
                menu += `┌─❖  *${category.toUpperCase()} MENU* ❖─\n`;
                plugins[category].forEach(plugin => {
                    if (plugin.command && plugin.command.length > 0) {
                        menu += `├─❏ ${plugin.command[0]}\n`;
                    }
                });
                menu += `└─❖\n\n`;
            }
            return menu;
        };

        // Load menu plugins function
        const loadMenuPlugins = (directory) => {
            const plugins = {};
            
            if (!fs.existsSync(directory)) {
                console.error(`Directory ${directory} does not exist`);
                return plugins;
            }

            const files = fs.readdirSync(directory);
            files.forEach(file => {
                if (file.endsWith('.js')) {
                    const filePath = path.join(directory, file);
                    try {
                        delete require.cache[require.resolve(filePath)];
                        const pluginModule = require(filePath);
                        
                        const pluginArray = Array.isArray(pluginModule) ? pluginModule : [pluginModule];
                        
                        const category = path.basename(file, '.js');
                        if (!plugins[category]) {
                            plugins[category] = [];
                        }
                        
                        plugins[category].push(...pluginArray);
                    } catch (error) {
                        console.error(`Error loading plugin at ${filePath}:`, error);
                    }
                }
            });

            return plugins;
        };

        // Handle commands via plugin system
        if (isCmd && command) {
            const result = await global.pluginManager.executeCommand(context, command);
            
            if (!result.found) {
                switch (command) {
                    case 'menu': {
                        const startTime = performance.now();
                        await m.reply("*Loading menu*...");
                        const endTime = performance.now();
                        const latensie = endTime - startTime;
                        
                        const ownername = `${global.ownername}`;
                        const prefixz = prefix;  
                        const modeStatus = "online";
                        const versions = `${global.version}`; 
                        
                        const pluginsDir = path.join(__dirname, 'Plugins');
                        const plugins = loadMenuPlugins(pluginsDir);
                        
                        const menulist = generateMenu(plugins, ownername, prefixz, modeStatus, versions, latensie, readmore);
                        
                        const menuImages = [kelvinkid1, kelvinkid2, kelvinkid3].filter(Boolean);
                        const kelvinkids = menuImages.length > 0 ? menuImages[Math.floor(Math.random() * menuImages.length)] : null;
                        
                        if (kelvinkids) {
                            await kelvin.sendMessage(m.chat, {
                                image: kelvinkids,
                                caption: menulist,
                            }, { quoted: m });
                        } else {
                            await kelvin.sendMessage(m.chat, {
                                image: { url: "https://i.ibb.co/2W0H9Jq/avatar-contact.png" },
                                caption: menulist,
                            }, { quoted: m });
                        }
                        break;
                    }
                    
                    case 'reloadplugins': {
                        if (!Access) return reply('Owner only command!');
                        try {
                            const pluginsDir = path.join(__dirname, 'Plugins');
                            const count = global.pluginManager.reloadPlugins(pluginsDir);
                            reply(`✅ Reloaded ${count} plugins successfully!`);
                        } catch (error) {
                            reply(`Failed to reload plugins: ${error.message}`);
                        }
                        break;
                    }
                    
                    case 'plugins': {
                        if (!Access) return reply('Owner only command!');
                        const plugins = global.pluginManager.getAllPlugins();
                        let pluginList = '*LOADED PLUGINS*\n\n';
                        
                        for (const [category, pluginArray] of Object.entries(plugins)) {
                            pluginList += `*${category.toUpperCase()}*:\n`;
                            pluginArray.forEach(plugin => {
                                pluginList += `• ${plugin.command[0]}`;
                                if (plugin.command.length > 1) {
                                    pluginList += ` (${plugin.command.slice(1).join(', ')})`;
                                }
                                pluginList += '\n';
                            });
                            pluginList += '\n';
                        }
                        
                        reply(pluginList);
                        break;
                    }
                    
                    default: {
                        if (budy.startsWith('>')) {
                            if (!Access) return;
                            try {
                                let evaled = await eval(budy.slice(2));
                                if (typeof evaled !== 'string') evaled = util.inspect(evaled);
                                await m.reply(evaled);
                            } catch (err) {
                                m.reply(String(err));
                            }
                        }
                            
                        if (budy.startsWith('<')) {
                            if (!Access) return;
                            let kode = budy.trim().split(/ +/)[0];
                            let teks;
                            try {
                                teks = await eval(`(async () => { ${kode == ">>" ? "return" : ""} ${text}})()`);
                            } catch (e) {
                                teks = e;
                            } finally {
                                await m.reply(util.format(teks));
                            }
                        }

                        if (budy.startsWith('-')) {
                            if (!Access) return;         
                            if (text == "rm -rf *") return m.reply("😹");
                            exec(budy.slice(2), (err, stdout) => {
                                if (err) return m.reply(`${err}`);
                                if (stdout) return m.reply(stdout);
                            });
                        }
                    }
                }
            } else if (!result.success) {
                reply(`Error executing ${command}: ${result.error}`);
            }
        }
        
    } catch (err) {
        console.log(util.format(err));
    }
};

let file = require.resolve(__filename);
require('fs').watchFile(file, () => {
    require('fs').unwatchFile(file);
    console.log('\x1b[0;32m' + __filename + ' \x1b[1;32mupdated!\x1b[0m');
    delete require.cache[file];
    require(file);
});