import LogSource from "./lib/log-source";
import Printer from "./lib/printer";
import syncSortedMerge from "./solution/sync-sorted-merge";
import asyncSortedMerge from "./solution/async-sorted-merge";

function runSolutions(sourceCount: number) {
    /**
     * Challenge Number 1!
     *
     * Assume that a LogSource only has one method: pop() which will return a LogEntry.
     *
     * A LogEntry is simply an object of the form:
     * {
     * 		date: Date,
     * 		msg: String,
     * }
     *
     * All LogEntries from a given LogSource are guaranteed to be popped in chronological order.
     * Eventually a LogSource will end and return boolean false.
     *
     * Your job is simple: print the sorted merge of all LogEntries across `n` LogSources.
     *
     * Call `printer.print(logEntry)` to print each entry of the merged output as they are ready.
     * This function will ensure that what you print is in fact in chronological order.
     * Call 'printer.done()' at the end to get a few stats on your solution!
     */
    const syncLogSources: LogSource[] = [];
    for (let i = 0; i < sourceCount; i++) {
      syncLogSources.push(new LogSource());
    }

    const syncPrinter = new Printer();
    syncSortedMerge(syncLogSources, syncPrinter);

    /**
     * Challenge Number 2!
     *
     * Similar to Challenge Number 1, except now you should assume that a LogSource
     * has only one method: popAsync() which returns a promise that resolves with a LogEntry,
     * or boolean false once the LogSource has ended.
     *
     * Your job is simple: print the sorted merge of all LogEntries across `n` LogSources.
     *
     * Call `printer.print(logEntry)` to print each entry of the merged output as they are ready.
     * This function will ensure that what you print is in fact in chronological order.
     * Call 'printer.done()' at the end to get a few stats on your solution!
     */
    const asyncLogSources: LogSource[] = [];
    for (let i_1 = 0; i_1 < sourceCount; i_1++) {
      asyncLogSources.push(new LogSource());
    }
    
    const asyncPrinter = new Printer();
    asyncSortedMerge(asyncLogSources, asyncPrinter);
}

// Adjust this input to see how your solutions perform under various loads.
runSolutions(100);
