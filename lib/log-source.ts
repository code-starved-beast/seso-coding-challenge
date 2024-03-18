import { random } from "lodash";
import { Company } from "Faker";
import { delay } from "bluebird";

/*
    We don't like OOP - in fact - we despise it!

    However, most real world implementations of something like a log source
    will be in OO form - therefore - we simulate that interaction here.
*/

export interface LogEntry {
  date: Date;
  msg: string;
}

export default class LogSource {
  drained: boolean;
  last: LogEntry

  constructor() {
    this.drained = false;
    this.last = {
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * random(40, 60)),
      msg: Company.catchPhrase(),
    };
  }

  getNextPseudoRandomEntry() {
    return {
      date: new Date(
        this.last.date.getTime() +
          1000 * 60 * 60 * random(10) +
          random(1000 * 60)
      ),
      msg: Company.catchPhrase(),
    };
  }

  pop(): LogEntry | false {
    this.last = this.getNextPseudoRandomEntry();
    if (this.last.date > new Date()) {
      this.drained = true;
    }
    return this.drained ? false : this.last;
  }

  async popAsync(): Promise<LogEntry | false> {
    this.last = this.getNextPseudoRandomEntry();
    if (this.last.date > new Date()) {
      this.drained = true;
    }
    await delay(random(8));
    
    return (this.drained ? false : this.last);
  }
};
