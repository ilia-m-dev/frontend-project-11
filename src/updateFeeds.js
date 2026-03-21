import axios from 'axios';
import state from './state.js';
import parseRss from './parser.js';
import generateId from './utils/generateId.js';

const UPDATE_INTERVAL = 5000;

const getProxyUrl = () => 'https://allorigins.hexlet.app/get';

const fetchRss = (url) => axios.get(getProxyUrl(), {
  params: {
    disableCache: true,
    url,
  },
});

const getExistingLinks = () => state.posts.map((post) => post.link);

const addNewPosts = (feedId, posts) => {
  const existingLinks = getExistingLinks();

  const newPosts = posts
    .filter((post) => !existingLinks.includes(post.link))
    .map((post) => ({
      id: generateId(),
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
    .then((response) => parseRss(response.data.contents))
    .then((data) => {
      addNewPosts(feed.id, data.posts);
    })
    .catch(() => {})
);

const updateFeeds = () => {
  const promises = state.feeds.map((feed) => updateFeed(feed));

  Promise.all(promises)
    .finally(() => {
      setTimeout(updateFeeds, UPDATE_INTERVAL);
    });
};

export default () => {
  setTimeout(updateFeeds, UPDATE_INTERVAL);
};