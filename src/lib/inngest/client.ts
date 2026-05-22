import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "payflow",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
