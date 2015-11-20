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
  static wrap(src, {history} = {history: false}) {
    return new Data(src, {history});
  }

  constructor(src, {history}) {
    this.content$ = flyd.stream(src);
    this.updated$ = flyd.stream();

    if (history) {
      this.updates$ = flyd.scan(
        this.record,
        [],
        this.updated$
      );
    } else {
      flyd.on(this.update, this.updated$);
    }
  }

  record = (updates, update) => {
    const result = this.update(update);

    if (result) updates.push(result);

    return updates;
  };

  update = (update) => {
    if (typeof update === "undefined" ||
        update.constructor !== Update) return;

    this.content$(R.set(update.lens, update.to, this.content$()));

    return update;
  };

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
