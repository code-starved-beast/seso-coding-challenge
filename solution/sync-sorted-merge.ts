// Print all entries, across all of the *async* sources, in chronological order.
import { MinPriorityQueue } from "@datastructures-js/priority-queue";
import LogSource from "../lib/log-source";
import Printer from "../lib/printer";

export default (logSources: LogSource[], printer: Printer) => {
  for (const src of logSources) {
    src.pop();
  }

  const logSourceQueue = MinPriorityQueue.fromArray(logSources, ({ last }) => last.date.valueOf());

  while (logSourceQueue.size() > 0) {
    const logSourceWithMostRecentEntry = logSourceQueue.dequeue();

    printer.print(logSourceWithMostRecentEntry.last);
    logSourceWithMostRecentEntry.pop();

    if (!logSourceWithMostRecentEntry.drained) {
      logSourceQueue.enqueue(logSourceWithMostRecentEntry);
    }
  }

  printer.done();
};
