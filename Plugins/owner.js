const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = [

{
        command: ['getpp', 'pp', 'profilepic', 'getprofile'],
        operate: async ({ kelvin, m, reply, quoted, Access, mess }) => {
            if (!Access) return reply(global.mess.owner);
            
            if (!quoted) {
                await kelvin.sendMessage(m.chat, {
                    react: {
                        text: "📷",
                        key: m.key
                    }
                });
                return reply('Reply to a user to get their profile picture.');
            }

            // React with 📷 emoji to the command message
            await kelvin.sendMessage(m.chat, {
                react: {
                    text: "📷",
                    key: m.key
                }
            });

            const userId = quoted.sender;

            try {
                const ppUrl = await kelvin.profilePictureUrl(userId, 'image');

                await kelvin.sendMessage(m.chat, 
                    { 
                        image: { url: ppUrl }, 
                        caption: `⌘ *Profile Picture of:* @${userId.split('@')[0]}`,
                        mentions: [ userId ]
                    }, { quoted: m }); 
            } catch (error) {
                console.error('Error getting profile picture:', error);
                await kelvin.sendMessage(m.chat, { 
                    image: { url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60' }, 
                    caption: '⚠️ No profile picture found.' 
                }, { quoted: m });
            }
        }
    },
    {
        command: ['toviewonce', 'tovo', 'tovv', 'vv'],
        operate: async ({ kelvin, m, reply, quoted, mime, Access, mess }) => {
        if (!Access) return reply(global.mess.owner) 
    try {
        if (!m.quoted) return reply('❌ Reply to a ViewOnce Video, Image, or Audio.');

        const quotedMessage = m.msg.contextInfo.quotedMessage;
        if (!quotedMessage) return reply('❌ No media found in the quoted message.');

        if (quotedMessage.imageMessage) {
            let imageCaption = quotedMessage.imageMessage.caption || '';
            let imageUrl = await kelvin.downloadAndSaveMediaMessage(quotedMessage.imageMessage);
            await kelvin.sendMessage(m.chat, { image: { url: imageUrl }, caption: imageCaption });
        }

        if (quotedMessage.videoMessage) {
            let videoCaption = quotedMessage.videoMessage.caption || '';
            let videoUrl = await kelvin.downloadAndSaveMediaMessage(quotedMessage.videoMessage);
            await kelvin.sendMessage(m.chat, { video: { url: videoUrl }, caption: videoCaption });
        }

        if (quotedMessage.audioMessage) {
            let audioUrl = await kelvin.downloadAndSaveMediaMessage(quotedMessage.audioMessage);
            await kelvin.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mp4' });
        }

    } catch (error) {
        console.error('Error processing vv command:', error);
        reply('❌ An error occurred while processing your request.');
    }
    
  }
},
{
    command: ['block', 'blockuser'],
    operate: async ({ kelvin, m, reply, quoted, text, mentionedJid, Access, mess }) => {
          if (!Access) return reply(global.mess.owner);
        
        if (!m.quoted && !mentionedJid[0] && !text) return reply("Reply to a message or mention/user ID to block");
        
        const userId = mentionedJid[0] || quoted?.sender || text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        
        try {
            // React with 🚫 emoji
            await kelvin.sendMessage(m.chat, {
                react: {
                    text: "🚫",
                    key: m.key
                }
            });
            
            // Block the user
            await kelvin.updateBlockStatus(userId, "block");
            reply(`✅ Successfully blocked @${userId.split('@')[0]}`);
        } catch (error) {
            console.error('Error blocking user:', error);
            reply(`Failed to block user: ${error.message}`);
        }
    }
},
{
    command: ['unblock', 'unblockuser'],
    operate: async ({ kelvin, m, reply, quoted, text, mentionedJid, Access, mess }) => {
          if (!Access) return reply(global.mess.owner);
        
        if (!m.quoted && !mentionedJid[0] && !text) return reply("Reply to a message or mention/user ID to unblock");
        
        const userId = mentionedJid[0] || quoted?.sender || text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        
        try {
            // React with ✅ emoji
            await kelvin.sendMessage(m.chat, {
                react: {
                    text: "✅",
                    key: m.key
                }
            });
            
            // Unblock the user
            await kelvin.updateBlockStatus(userId, "unblock");
            reply(`✅ Successfully unblocked @${userId.split('@')[0]}`);
        } catch (error) {
            console.error('Error unblocking user:', error);
            reply(`Failed to unblock user: ${error.message}`);
        }
    }
}
];