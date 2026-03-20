import state from './state.js';
import { buildUrlSchema } from './validators.js';

const normalizeUrl = (value) => value.trim();

const addFeed = (url) => {
  state.feeds.push({ id: crypto.randomUUID(), url });
};

export default () => {
  const validate = (url) => {
    const existingUrls = state.feeds.map((f) => f.url);
    return buildUrlSchema(existingUrls).validate(url);
  };

  const handleSubmit = (rawUrl) => {
    state.form.error = null;
    state.form.state = 'processing';

    const url = normalizeUrl(rawUrl);

    return validate(url)
      .then((validatedUrl) => {
        addFeed(validatedUrl);
        state.form.state = 'success';
        return validatedUrl;
      })
      .catch((err) => {
        state.form.state = 'failed';
        state.form.error = err.message;
        throw err;
      });
  };

  return { handleSubmit };
};