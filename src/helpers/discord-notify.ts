/**
 * Discord webhook notification utility for guest book submissions
 * Sends simple notifications when new notes or fan art are submitted
 */

const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1463420161347293280/zKBhUZn8dKLqKV2Qo10kOuh310C_mrZqZ39GVkK5HnA8PyM5bH2YIlURML9NX2LxFvNU";

interface DiscordWebhookPayload {
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    timestamp?: string;
  }>;
}

/**
 * Send a notification to Discord when a new guest book entry is created
 * @param type - The type of submission ("note" or "fan art")
 * @param submitterName - The name of the person who submitted
 */
export async function notifyNewGuestBookEntry(
  type: "note" | "fan art",
  submitterName: string
): Promise<void> {
  try {
    const emoji = type === "note" ? "📝" : "🎨";
    const color = type === "note" ? 0x7289da : 0xff73fa; // Blue for notes, pink for fan art

    const payload: DiscordWebhookPayload = {
      embeds: [
        {
          title: `${emoji} New Guest Book ${type === "note" ? "Note" : "Fan Art"}`,
          description: `**${submitterName}** just submitted a new ${type}!`,
          color: color,
          fields: [
            {
              name: "Action Required",
              value:
                "Visit the [Guest Book page](https://rainbowcockroach.github.io/soul_collection/guest-book) to view the submission.",
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(
        `Discord webhook failed: ${response.status} ${response.statusText}`
      );
    } else {
      console.log(
        `Discord notification sent for new ${type} from ${submitterName}`
      );
    }
  } catch (error) {
    // Log error but don't throw - we don't want Discord issues to break the submission
    console.error("Error sending Discord notification:", error);
  }
}
