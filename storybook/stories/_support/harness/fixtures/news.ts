import NewsDomains from '../../../../../source/renderer/app/domains/News';
import { getNewsItem } from '../../../news/_utils/fakeDataNewsFeed';
import {
  availableAppVersion,
  getNewsUpdateItem,
} from '../../../news/_utils/fakeDataUpdate';

/*
 * The three stores the overlay screens above the router read.
 *
 * `newsFeedData` is a real `NewsCollection` rather than a plain object. The
 * containers do not read it as data: they read `incident`, `alerts.unread` and
 * `alerts.all`, which are computed getters that filter and order the list, and a
 * hand-written stand-in would have had to reproduce that ordering and would stop
 * matching the moment it changed. Building the real collection from the same
 * items the component-level news stories use keeps one shape in the repository
 * instead of two.
 *
 * The collection filters on `global.environment`, so `_support/environment.ts`
 * has to have run before one is constructed. It is imported for its side effect
 * by the fixtures below, through the story support module they already pull in.
 */

const { NewsCollection } = NewsDomains;

const LOCALE = 'en-US';

export const emptyNewsFeed = () => new NewsCollection([]);

// One of each type a container branches on, plus a read item so the unread
// counts are not trivially the whole list.
export const populatedNewsFeed = () =>
  new NewsCollection([
    getNewsItem(1, 'announcement', LOCALE),
    getNewsItem(2, 'info', LOCALE),
    getNewsItem(3, 'alert', LOCALE),
    getNewsItem(4, 'alert', LOCALE, true),
  ]);

export const incidentNewsFeed = () =>
  new NewsCollection([
    getNewsItem(5, 'incident', LOCALE),
    getNewsItem(6, 'announcement', LOCALE),
  ]);

export const alertNewsFeed = () =>
  new NewsCollection([getNewsItem(7, 'alert', LOCALE)]);

export const newsFeedDefaults = {
  rawNews: [],
  newsUpdatedAt: null,
  fetchingNewsFailed: false,
  openedAlert: null,
  fetchLocalNews: false,
  // Computed getters, as plain values.
  newsFeedData: emptyNewsFeed(),
  isLoadingNews: false,
  // Methods the containers pass straight through as handlers.
  markNewsAsRead: () => {},
  openAlert: () => {},
  closeOpenedAlert: () => {},
  proceedNewsAction: () => {},
};

/*
 * AppUpdateStore's observables and the six computed getters derived from its
 * download data. `availableUpdate` being null is what makes the update overlay
 * render nothing, and it is the state all but a few days of an installation's
 * life are spent in, so it is the default.
 */
export const appUpdateDefaults = {
  availableUpdate: null,
  availableUpdateVersion: '',
  isUpdateDownloading: false,
  isUpdateDownloaded: false,
  isUpdateProgressOpen: false,
  isAutomaticUpdateFailed: false,
  isUpdatePostponed: false,
  isWaitingToQuitDaedalus: false,
  installationProgress: 0,
  downloadInfo: null,
  downloadData: null,
  availableAppVersion: null,
  displayAppUpdateOverlay: false,
  displayAppUpdateNewsItem: false,
  formattedDownloadData: {
    timeLeft: '',
    downloaded: '',
    total: '',
    progress: 0,
  },
  downloadTimeLeft: '',
  totalDownloaded: '',
  totalDownloadSize: '',
  downloadProgress: 0,
  showManualUpdate: false,
};

// An update waiting to be installed, which is the only state the overlay renders
// in at all: the container returns null without one.
export const updateAvailable = () => ({
  availableUpdate: getNewsUpdateItem(false, LOCALE),
  availableUpdateVersion: availableAppVersion,
  displayAppUpdateOverlay: true,
  displayAppUpdateNewsItem: true,
  downloadProgress: 64,
  downloadTimeLeft: '2 minutes',
  totalDownloaded: '128 MB',
  totalDownloadSize: '200 MB',
});

export const uiNotificationsDefaults = {
  activeNotifications: {},
  activeNotificationsTimeouts: {},
  isOpen: () => false,
};

// The two notifications with no values to interpolate, so a story can show the
// bar without also having to supply a wallet or an address.
export const activeNotifications = {
  downloadLogsProgress: { index: 0 },
  downloadLogsSuccess: { index: 1 },
};
