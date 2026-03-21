import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import i18next from 'i18next';
import state from './state.js';
import app from './app.js';
import view from './view.js';
import resources from './locales.js';
import runFeedsUpdater from './updateFeeds.js';

const elements = {
  form: document.querySelector('form'),
  input: document.querySelector('input[name="url"]'),
  submitButton: document.querySelector('button[type="submit"]'),
  feedback: document.querySelector('.feedback'),
  feedsContainer: document.querySelector('.feeds'),
  postsContainer: document.querySelector('.posts'),
  modalTitle: document.querySelector('#postModalLabel'),
  modalBody: document.querySelector('.modal-body'),
  modalFullArticleLink: document.querySelector('.full-article-link'),
};

const markPostAsViewed = (postId) => {
  if (!state.ui.viewedPostIds.includes(postId)) {
    state.ui.viewedPostIds.push(postId);
  }
};

const init = async () => {
  const i18n = i18next.createInstance();

  await i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  view(state, elements, i18n);

  const { handleSubmit } = app();

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const url = elements.input.value;

    handleSubmit(url)
      .then(() => {
        elements.form.reset();
        elements.input.focus();
      })
      .catch(() => {
        elements.input.focus();
      });
  });

  elements.postsContainer.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-id]');

    if (!trigger) {
      return;
    }

    const { id } = trigger.dataset;
    state.ui.modalPostId = id;
    markPostAsViewed(id);
  });

  runFeedsUpdater();
};

init();