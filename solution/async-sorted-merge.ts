// Print all entries, across all of the *async* sources, in chronological order.
import { MinPriorityQueue } from "@datastructures-js/priority-queue";
import { chunk, compact } from "lodash";
import LogSource, { LogEntry } from "../lib/log-source";
import Printer from "../lib/printer";

export const MAX_CONCURRENCY = 20;
export const MAX_QUEUE_SIZE = 25_000;

export default async (logSources: LogSource[], printer: Printer) => {
  const logEntries: LogEntry[] = [];
  for (const sources of chunk(logSources, MAX_CONCURRENCY)) {
    logEntries.push(
      ...compact(await Promise.all(sources.map(async (src) => src.popAsync())))
    );
  }

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
    if (logEntryQueue.size() + logSourceQueue.size() > MAX_QUEUE_SIZE) {
      const logSourceWithMostRecentEntry = logSourceQueue.dequeue();

      if (!logSourceWithMostRecentEntry) continue;

      const next = await logSourceWithMostRecentEntry.popAsync();

      if (next) {
        logEntryQueue.enqueue(next);
      }

      if (!logSourceWithMostRecentEntry.drained) {
        logSourceQueue.enqueue(logSourceWithMostRecentEntry);
      }
    } else {
      const undrainedLogSources = logSourceQueue.toArray();
      logSourceQueue.clear();

      for (const sources of chunk(undrainedLogSources, MAX_CONCURRENCY)) {
        await Promise.all(
          sources.map(async (src) => {
            const next = await src.popAsync();

            if (next) {
              logEntryQueue.enqueue(next);
            }
          })
        );

        for (const src of sources) {
          if (!src.drained) {
            logSourceQueue.enqueue(src);
          }
        }
      }
    }
  }

  for (const logEntry of logEntryQueue) {
    printer.print(logEntry);
  }

  printer.done();
};
