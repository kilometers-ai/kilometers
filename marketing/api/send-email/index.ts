import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { EmailClient } from "@azure/communication-email";

export async function httpTrigger(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("HTTP trigger function processed a request to send-email.");

  const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
  const senderAddress = process.env.AZURE_COMMUNICATION_SENDER_ADDRESS;
  const recipientAddress = process.env.AZURE_COMMUNICATION_SENDER_ADDRESS;

  if (!connectionString || !senderAddress || !recipientAddress) {
    context.error(
      "Azure Communication Services configuration is missing in environment variables."
    );
    return {
      status: 500,
      body: "Server configuration error.",
    };
  }

  const { name, email, message } = (await req.json()) as {
    name: string;
    email: string;
    message: string;
  };

  if (name && email && message) {
    try {
      const client = new EmailClient(connectionString);

      const emailMessage = {
        senderAddress: senderAddress,
        content: {
          subject: `New Contact Form Message from ${name}`,
          plainText: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        },
        recipients: {
          to: [{ address: recipientAddress }],
        },
      };

      const poller = await client.beginSend(emailMessage);
      await poller.pollUntilDone();

      return {
        status: 200,
        body: "Email sent successfully.",
      };
    } catch (e) {
      context.error("Error sending email:", e);
      return {
        status: 500,
        body: "Failed to send email.",
      };
    }
  } else {
    return {
      status: 400,
      body: "Please provide name, email, and message in the request body.",
    };
  }
}

export default httpTrigger; 