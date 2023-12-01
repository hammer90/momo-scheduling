import {
  MongoSchedule,
  MomoJobBuilder,
  MomoErrorEvent,
  MomoEvent,
} from "@tngtech/momo-scheduler";
import { randomUUID } from "crypto";

let jobsRunning = 0;
async function slowJob(): Promise<void> {
  const id = randomUUID();
  jobsRunning += 1;
  console.log(`starting ${id}, jobs running ${jobsRunning}`);
  await new Promise((resolve) => setTimeout(resolve, 30_000));
  console.log(`finished ${id}`);
  jobsRunning -= 1;
}

async function run(): Promise<void> {
  const mongoSchedule = await MongoSchedule.connect({
    scheduleName: "scheduler",
    url: "mongodb://localhost:27017",
  });
  mongoSchedule.on("error", (error: MomoErrorEvent) => {
    console.dir(error);
  });
  mongoSchedule.on("debug", (debug: MomoEvent) => {
    console.dir(debug);
  });

  const job = new MomoJobBuilder()
    .withName("job")
    .withSchedule("10 seconds")
    .withHandler(slowJob)
    .withConcurrency(1)
    .withMaxRunning(1)
    .build();

  await mongoSchedule.define(job);
  await mongoSchedule.start();

  await new Promise(() => {});
}

void run();
