import { version } from '../../../../package.json';
import News from '../../../../source/renderer/app/domains/News';
import { update } from './fakeDataUpdate';
import type { NewsType } from '../../../../source/renderer/app/api/news/types';

/*
 * Both spellings, and the reason is a discrepancy in shipped source rather than
 * indecision here.
 *
 * `NewsTarget` (api/news/types.ts:13-16) declares `platform: string`, which the
 * required-field check enforces. `NewsCollection` reads `target.platforms` and
 * tests the running platform for membership (domains/News.ts:99-109), and the
 * repository's own sample payload carries `platforms` on all eleven of its items.
 * Nothing anywhere reads the singular field.
 *
 * So an item built from the declared type alone matches nothing and is dropped
 * before it reaches a story, which is what these fixtures did. Assigned through a
 * name rather than inline so the extra field is not an excess-property error.
 * Written up in .agent/findings/10-the-newsfeed-target-type-names-the-wrong-field.md.
 */
const newsTarget = {
  daedalusVersion: version,
  platform: 'darwin',
  platforms: ['darwin', 'win32', 'linux'],
};

export const getNewsItem = (
  id: number,
  type: NewsType,
  locale: string,
  read?: boolean
  // @ts-ignore ts-migrate(2503) FIXME: Cannot find namespace 'News'.
): News.News =>
  new News.News({
    id,
    title:
      type === 'software-update'
        ? update[locale].title
        : `Title - ${type} - ${locale} - ${read ? 'read' : 'unread'}`,
    content:
      type === 'software-update'
        ? update[locale].content
        : `Content - ${locale}`,
    target: newsTarget,
    action: {
      label: 'Visit en-US',
      url: 'https://daedalus.support.se7enlabs.com/',
    },
    date: new Date().getTime() - 100 - id,
    type,
    read: read || false,
  });
