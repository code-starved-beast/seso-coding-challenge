// Print all entries, across all of the *async* sources, in chronological order.
import { sortBy } from "lodash";
import LogSource, { LogEntry } from "../lib/log-source";
import Printer from "../lib/printer";

export default async (logSources: LogSource[], printer: Printer) => {
  let logEntryQueue: LogEntry[] = [];

  const sortedLogSourcesByLastEntry = sortBy(
    logSources.filter(({ drained }) => !drained),
    (source) => {
      const next = source.pop();
      if (next) {
        logEntryQueue.push(next);
        return next.date.valueOf();
      }

      return Date.now();
    }
  );

  logEntryQueue = sortBy(logEntryQueue, ({ date }) => date.valueOf());

  const undrainedLogSources = sortedLogSourcesByLastEntry.filter(
    ({ drained }) => !drained
  );

  while (undrainedLogSources.length > 0) {
    const nextEntry = logEntryQueue.shift();

    if (nextEntry) {
      printer.print(nextEntry);
    }

    const logSourceWithMostRecentEntry = undrainedLogSources.shift();

    if (!logSourceWithMostRecentEntry) continue;

    const next = logSourceWithMostRecentEntry.pop();
    if (!next) {
      continue;
    }

    let i = 0;
    for (; i < logEntryQueue.length; i++) {
      if (logEntryQueue[i].date > next.date) {
        break;
      }
    }

    logEntryQueue.splice(i, 0, next);

    if (!logSourceWithMostRecentEntry.drained) {
      undrainedLogSources.splice(i, 0, logSourceWithMostRecentEntry);
    }
  }

  for (const logEntry of logEntryQueue) {
    printer.print(logEntry);
  }

  printer.done();
};
