import axios from 'axios';
import state from './state.js';
import { buildUrlSchema } from './validators.js';
import parseRss from './parser.js';

const normalizeUrl = (value) => value.trim();

const getProxyUrl = (url) => 'https://allorigins.hexlet.app/get';

const fetchRss = (url) => axios.get(getProxyUrl(url), {
  params: {
    disableCache: true,
    url,
  },
});

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

  if (error?.isParsingError) {
    return 'errors.invalidRss';
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
          .then((response) => parseRss(response.data.contents))
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