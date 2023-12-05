import { Bot, CommandContext, Context } from "grammy";
import { getLuz } from "./luz";
import dotenv from "dotenv";

dotenv.config();

const botToken = process.env.BOT_TOKEN; // Ensure the BOT_TOKEN is set in your .env file
if (!botToken)
  throw new Error("BOT_TOKEN must be provided as an environment variable.");
const bot = new Bot(botToken);

// Function to format the date based on the command input
function formatDate(input: string): string | null {
  const today = new Date();
  switch (input) {
    case "hoy":
      return today.toISOString().split("T")[0];
    case "mañana":
      today.setDate(today.getDate() + 1);
      return today.toISOString().split("T")[0];
    case "ayer":
      today.setDate(today.getDate() - 1);
      return today.toISOString().split("T")[0];
    default:
      // Check if the format is DD/MM/YYYY or YYYY-MM-DD and convert if necessary
      if (/\d{2}\/\d{2}\/\d{4}/.test(input)) {
        const [day, month, year] = input.split("/");
        return `${year}-${month}-${day}`;
      } else if (/\d{4}-\d{2}-\d{2}/.test(input)) {
        return input;
      }
      return null;
  }
}

// New function to map color to emoji
function mapColorToEmoji(color: string): string {
  switch (color) {
    case "high":
      return "📈";
    case "default":
      return "🟰";
    case "low":
      return "📉";
    default:
      return "";
  }
}

// Command handler for /luz
bot.command("luz", async (ctx) => {
  let dateInput = ctx.message!.text.split(" ")[1]; // Get the date part from the command
  if (!dateInput) {
    dateInput = "hoy"; // Default to today if no date is specified
  }

  const formattedDate = formatDate(dateInput);
  if (!formattedDate) {
    ctx.reply(
      "Invalid date format. Use 'DD/MM/YYYY', 'YYYY-MM-DD', 'hoy', 'mañana', or 'ayer'."
    );
    return;
  }

  try {
    const prices = await getLuz(formattedDate);
    // Format the prices as a Markdown list
    const response = `Electricity Prices for ${formattedDate}:\n\n${prices?.reduce(
      (acc, priceInfo) => {
        const emoji = mapColorToEmoji(priceInfo.color);
        return acc + `${emoji} ${priceInfo.hour}: ${priceInfo.price}\n`;
      },
      ""
    )}`;
    if (!prices || prices.length === 0) {
      ctx.reply(`No data found for ${formattedDate}.`);
      return;
    }
    ctx.reply(response, { parse_mode: "Markdown" });
  } catch (error) {
    ctx.reply(`Error fetching data for ${formattedDate}.`);
  }
});

// Manejador de comandos de ayuda
bot.command(["ayuda", "help", "start"], (ctx) => {
  const mensajeAyuda = `
🤖 *Guía de Bot de Precios de Luz* 🤖

¡Obtén rápidamente los precios de la electricidad!

🔹 Usa \`/luz\` para los precios de hoy.
🔹 Usa \`/luz hoy\` para los precios de hoy (igual que /luz).
🔹 Usa \`/luz mañana\` para los precios de mañana.
🔹 Usa \`/luz ayer\` para los precios de ayer.
🔹 Usa \`/luz <fecha>\` para precios de una fecha específica, p.ej., \`/luz 05/12/2023\`.

Las fechas pueden estar en formato DD/MM/AAAA o AAAA-MM-DD.

⏱️ ¡Obtén tus precios sin complicaciones!`;

  ctx.reply(mensajeAyuda, { parse_mode: "Markdown" });
});

// Start the bot
bot.start();
