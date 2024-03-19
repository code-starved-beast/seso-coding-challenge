// Print all entries, across all of the *async* sources, in chronological order.
import { MinPriorityQueue } from "@datastructures-js/priority-queue";
import LogSource, { LogEntry } from "../lib/log-source";
import Printer from "../lib/printer";

export default async (logSources: LogSource[], printer: Printer) => {
  const logEntryQueue = new MinPriorityQueue<LogEntry>(({ date }) =>
    date.valueOf()
  );
  const logSourceQueue = new MinPriorityQueue<LogSource>(({ last }) =>
    last.date.valueOf()
  );

  for (const logSource of logSources) {
    const logEntry = logSource.pop();

    if (logEntry) {
      logEntryQueue.enqueue(logEntry);
    }

    if (!logSource.drained) {
      logSourceQueue.enqueue(logSource);
    }  
  }

  while (logSourceQueue.size() > 0) {
    const nextEntry = logEntryQueue.dequeue();

    if (nextEntry) {
      printer.print(nextEntry);
    }

    const logSourceWithMostRecentEntry = logSourceQueue.dequeue();

    if (!logSourceWithMostRecentEntry) continue;

    const next = logSourceWithMostRecentEntry.pop();

    if (!next) {
      continue;
    }

    logEntryQueue.enqueue(next);

    if (!logSourceWithMostRecentEntry.drained) {
      logSourceQueue.enqueue(logSourceWithMostRecentEntry);
    }
  }

  for (const logEntry of logEntryQueue) {
    printer.print(logEntry);
  }

  printer.done();
};
