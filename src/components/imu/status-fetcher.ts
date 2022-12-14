import { Status, StatusCallback, StatusFetcher } from '../types';

export function createStatusFetcher(url: string): StatusFetcher {
  let currentStatus: Status = 'Unavailable';
  const callbacks: StatusCallback[] = [];

  function set(newStatus: Status) {
    currentStatus = newStatus;

    callbacks.forEach((cb) => cb(currentStatus));
  }

  function _fetch() {
    fetch(url)
      .then((res) => res.json() as Promise<{ status: Status }>)
      .then(({ status }) => set(status))
      .catch((_) => set('Error'));
  }

  return {
    fetch() {
      _fetch();

      return this;
    },
    register(callback) {
      callbacks.push(callback);
      // callback(currentStatus);

      return this;
    },
  };
}

const statusFetchers: Record<string, StatusFetcher> = {};
export function addStatusFetcher(
  name: string,
  url: string,
  cb?: StatusCallback
) {
  statusFetchers[name] = createStatusFetcher(url);

  if (cb) {
    statusFetchers[name].register(cb);
  }
}

export function fetchAllStatuses() {
  Object.keys(statusFetchers).forEach((name) => statusFetchers[name].fetch());
}
