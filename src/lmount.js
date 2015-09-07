import flyd from "flyd";
import R from "ramda";

function makeLens(path) {
  return R.lens(R.path(path), R.assocPath(path));
}

class Update {
  constructor({from, to, lens}) {
    this.from = from;
    this.to = to;
    this.lens = lens;
  }
}

export class Data {
  static wrap(src) {
    return new Data(src);
  }

  constructor(src) {
    this.content$ = flyd.stream(src);
    this.updated$ = flyd.stream();
    this.updates$ = flyd.scan((updates, update) => {
      if (typeof update === "undefined") return [];
      if (update.constructor !== Update) return updates;

      this.content$(R.set(update.lens, update.to, this.content$()));
      updates.push(update);
      return updates;
    }, [], this.updated$);
  }

  on(listener) {
    flyd.on(listener, this.content$);
  }
}

export class Mount {
  static on({data, path}) {
    return new Mount({data, path});
  }

  constructor({path, data}) {
    this.path = path;
    this.lens = makeLens(path);
    this.data = data;
  }

  set value(value) {
    this.data.updated$(new Update({
      lens: this.lens,
      from: this.value,
      to: value
    }));

    return value;
  }

  get value() {
    return R.view(this.lens, this.data.content$());
  }
}
