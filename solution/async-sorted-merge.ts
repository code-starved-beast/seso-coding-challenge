// Print all entries, across all of the *async* sources, in chronological order.
import { MinPriorityQueue } from "@datastructures-js/priority-queue";
import { compact } from "lodash";
import LogSource from "../lib/log-source";
import Printer from "../lib/printer";

export default async (logSources: LogSource[], printer: Printer) => {
  const logEntries = compact(
    await Promise.all(logSources.map(async (source) => source.popAsync()))
  );

  const logEntryQueue = MinPriorityQueue.fromArray(logEntries, ({ date }) =>
    date.valueOf()
  );
  const logSourceQueue = MinPriorityQueue.fromArray(logSources, ({ last }) =>
    last.date.valueOf()
  );

  while (logSourceQueue.size() > 0) {
    const nextEntry = logEntryQueue.dequeue();

    if (nextEntry) {
      printer.print(nextEntry);
    } else {
      break;
    }

    const logSourceWithMostRecentEntry = logSourceQueue.dequeue();

    if (!logSourceWithMostRecentEntry) continue;

    await Promise.all(
      logSources.filter(({ drained }) => !drained).map(async (src) => {
        const next = await src.popAsync();

        if (!next) {
          return;
        }

        logEntryQueue.enqueue(next);
      })
    );

    if (!logSourceWithMostRecentEntry.drained) {
      logSourceQueue.enqueue(logSourceWithMostRecentEntry);
    }
  }

  for (const logEntry of logEntryQueue) {
    printer.print(logEntry);
  }

  printer.done();
};
