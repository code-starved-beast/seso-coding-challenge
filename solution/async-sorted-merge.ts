// Print all entries, across all of the *async* sources, in chronological order.
import LogSource from "../lib/log-source";
import Printer from "../lib/printer";

export default async (logSources: LogSource[], printer: Printer) => {
  console.log("Async sort complete.");
};
