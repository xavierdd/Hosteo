const config = require(`${process.cwd()}/config/config.json`);
const Discord = require('discord.js');
const serverSchema = require(`${process.cwd()}/modelos/servidor.js`)
const { asegurar_todo } = require(`${process.cwd()}/utils/funciones.js`)
module.exports = async (client, message) => {
    if (!message.guild || !message.channel || message.author.bot) return;
    await asegurar_todo(message.guild.id, message.author.id);
    let data = await serverSchema.findOne({guildID: message.guild.id});

    //si el bot es mencionado, devolvemos un mensaje de respuesta indicando el prefijo establecido en el servidor
    if(message.content.includes(client.user.id)) return message.reply({
        embeds: [
            new Discord.EmbedBuilder()
            .setTitle(`✅ **Para ver mis comandos usa \`${data.prefijo}help\`!**`)
            .setFooter({text: `© desarrollado por dewstouh#1088 | 2022`, iconURL: `https://cdn.discordapp.com/avatars/282942681980862474/7ff4f4ae92af5feb0d258a71cdb0b060.png`})
            .setColor(client.color)
        ]
    })

    if (!message.content.startsWith(data.prefijo)) return;
    const args = message.content.slice(data.prefijo.length).trim().split(" ");
    const cmd = args.shift()?.toLowerCase();
    const command = client.commands.get(cmd) || client.commands.find(c => c.aliases && c.aliases.includes(cmd));
    if (command) {
        if (command.owner) {
            if (!config.ownerIDS.includes(message.author.id)) return message.reply(`❌ **Solo los dueños de este bot pueden ejecutar este comando!**\n**Dueños del bot:** ${config.ownerIDS.map(ownerid => `<@${ownerid}>`)}`)
        }
        if(command.premium){
            if(data.premium){
                if(data.premium <= Date.now()) return message.reply("❌ **Tu suscripción premium ha expirado!**")
            } else {
                return message.reply("❌ **Este es un comando premium!**")
            }
        }


        if(command.permisos_bot){
            if(!message.guild.members.me.permissions.has(command.permisos_bot)) return message.reply(`❌ **No tengo suficientes permisos para ejecutar este comando!**\nNecesito los siguientes permisos ${command.permisos_bot.map(permiso => `\`${permiso}\``).join(", ")}`)
        }

        if(command.permisos){
            if(!message.member.permissions.has(command.permisos)) return message.reply(`❌ **No tienes suficientes permisos para ejecutar este comando!**\nNecesitas los siguientes permisos ${command.permisos.map(permiso => `\`${permiso}\``).join(", ")}`)
        }

        //ejecutar el comando
        command.run(client, message, args, data.prefijo, data.idioma);
    } else {
        //opcional
        return message.reply("❌ No he encontrado el comando que me has especificado!");
    }

}

/*
╔═════════════════════════════════════════════════════╗
║    || - || Desarrollado por dewstouh#1088 || - ||   ║
║    ----------| discord.gg/MBPsvcphGf |----------    ║
╚═════════════════════════════════════════════════════╝
*/
