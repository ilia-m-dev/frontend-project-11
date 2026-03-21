import axios from 'axios';
import state from './state.js';
import parseRss from './parser.js';

const UPDATE_INTERVAL = 5000;

const getProxyUrl = () => 'https://allorigins.hexlet.app/get';

const fetchRss = (url) => axios.get(getProxyUrl(), {
  params: {
    disableCache: true,
    url,
  },
});

const getRssContent = (response) => {
  const { data } = response;

  if (typeof data === 'string') {
    return data;
  }

  if (typeof data?.contents === 'string') {
    return data.contents;
  }

  throw new Error('errors.invalidRss');
};

const getExistingLinks = () => state.posts.map((post) => post.link);

const addNewPosts = (feedId, posts) => {
  const existingLinks = getExistingLinks();

  const newPosts = posts
    .filter((post) => !existingLinks.includes(post.link))
    .map((post) => ({
      id: crypto.randomUUID(),
      feedId,
      title: post.title,
      description: post.description,
      link: post.link,
    }));

  if (newPosts.length > 0) {
    state.posts.unshift(...newPosts);
  }
};

const updateFeed = (feed) => (
  fetchRss(feed.url)
    .then((response) => parseRss(getRssContent(response)))
    .then((data) => {
      addNewPosts(feed.id, data.posts);
    })
    .catch(() => {})
);

const updateFeeds = () => {
  Promise.all(state.feeds.map((feed) => updateFeed(feed)))
    .finally(() => {
      setTimeout(updateFeeds, UPDATE_INTERVAL);
    });
};

export default () => {
  setTimeout(updateFeeds, UPDATE_INTERVAL);
};