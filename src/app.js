import axios from 'axios';
import state from './state.js';
import { buildUrlSchema } from './validators.js';
import parseRss from './parser.js';

const normalizeUrl = (value) => value.trim();

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

const addFeedWithPosts = (url, feedData) => {
  const feedId = crypto.randomUUID();

  state.feeds.unshift({
    id: feedId,
    url,
    title: feedData.feed.title,
    description: feedData.feed.description,
  });

  const posts = feedData.posts.map((post) => ({
    id: crypto.randomUUID(),
    feedId,
    title: post.title,
    description: post.description,
    link: post.link,
  }));

  state.posts.unshift(...posts);
};

const getErrorKey = (error) => {
  if (error?.message?.startsWith('errors.')) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    return 'errors.network';
  }

  return 'errors.unknown';
};

export default () => {
  const validate = (url) => {
    const existingUrls = state.feeds.map((feed) => feed.url);
    return buildUrlSchema(existingUrls).validate(url);
  };

  const handleSubmit = (rawUrl) => {
    state.form.error = null;
    state.form.state = 'processing';

    const url = normalizeUrl(rawUrl);

    return validate(url)
      .then((validatedUrl) => (
        fetchRss(validatedUrl)
          .then((response) => parseRss(getRssContent(response)))
          .then((feedData) => {
            addFeedWithPosts(validatedUrl, feedData);
            state.form.state = 'success';
            return validatedUrl;
          })
      ))
      .catch((error) => {
        state.form.state = 'failed';
        state.form.error = getErrorKey(error);
        throw error;
      });
  };

  return { handleSubmit };
};