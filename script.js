const { Client, GatewayIntentBits } = require("discord.js");
const readline = require("readline");
const colors = require("colors");
const config = require("./settings.json");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let encerrado = false;

function perguntar(pergunta) {
    return new Promise(resolve => {
        if (encerrado) return;
        rl.question(pergunta, resposta => resolve(resposta.trim()));
    });
}

client.once("ready", async () => {
    console.log(`\n${client.user.tag} estou online.`.green);

    console.log(`
        Mass DM
        Opções:
    [1] Modo Normal
    [2] Modo Tempo Limite
`.cyan);

    const opcao = await perguntar("[?] Qual Opção Você Escolhe: ");
    const guildId = await perguntar("[!] Fale O ID Do Servidor: ");

    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
        console.log("Servidor não encontrado.".red);
        finalizar();
        return;
    }

    await guild.members.fetch();
    const membros = guild.members.cache.filter(m => !m.user.bot);

    console.log(`[!] ${membros.size} Usuário(s) Raspado(s)`.yellow);
    console.log("Aviso: Envio iniciado.\n".yellow);

    let delay = opcao === "2" ? 5000 : 0;

    for (const member of membros.values()) {
        setTimeout(async () => {
            try {
                await member.user.send(config.mensagem);
                console.log(`DM enviada para ${member.user.tag}`.green);
            } catch (err) {
                if (err.code === 50007) {
                    console.log(`DM BLOQUEADA: ${member.user.tag}`.yellow);
                } else {
                    console.log(
                        `Erro com ${member.user.tag} | Código: ${err.code || "desconhecido"}`.red
                    );
                    if (err.message) console.log(`Motivo: ${err.message}`.gray);
                }
            }
        }, delay);

        if (delay > 0) delay += 5000;
    }
});

function finalizar() {
    if (!encerrado) {
        encerrado = true;
        rl.close();
        process.exit(0);
    }
}

process.on("SIGINT", () => {
    console.log("\nEncerrando...".red);
    finalizar();
});

client.login(config.token);