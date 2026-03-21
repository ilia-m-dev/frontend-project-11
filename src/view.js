import { subscribe } from 'valtio/vanilla';

const createFeedItem = (feed) => {
  const item = document.createElement('li');
  item.classList.add('list-group-item', 'border-0', 'px-0');

  const title = document.createElement('h3');
  title.classList.add('h5', 'mb-1');
  title.textContent = feed.title;

  const description = document.createElement('p');
  description.classList.add('text-muted', 'mb-0');
  description.textContent = feed.description;

  item.append(title, description);
  return item;
};

const createPostItem = (post, isViewed) => {
  const item = document.createElement('li');
  item.classList.add(
    'list-group-item',
    'd-flex',
    'justify-content-between',
    'align-items-start',
    'border-0',
    'px-0',
  );

  const link = document.createElement('a');
  link.href = post.link;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.dataset.id = post.id;
  link.textContent = post.title;

  if (isViewed) {
    link.classList.add('fw-normal', 'link-secondary');
  } else {
    link.classList.add('fw-bold');
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.textContent = 'Просмотр';
  button.dataset.id = post.id;
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#postModal');

  item.append(link, button);

  return item;
};

const renderFeeds = (container, feeds) => {
  container.innerHTML = '';

  if (feeds.length === 0) {
    return;
  }

  const title = document.createElement('h2');
  title.classList.add('mb-4');
  title.textContent = 'Фиды';

  const list = document.createElement('ul');
  list.classList.add('list-group', 'mb-5');

  feeds.forEach((feed) => {
    list.append(createFeedItem(feed));
  });

  container.append(title, list);
};

const renderPosts = (container, posts, viewedPostIds) => {
  container.innerHTML = '';

  if (posts.length === 0) {
    return;
  }

  const title = document.createElement('h2');
  title.classList.add('mb-4');
  title.textContent = 'Посты';

  const list = document.createElement('ul');
  list.classList.add('list-group');

  posts.forEach((post) => {
    const isViewed = viewedPostIds.includes(post.id);
    list.append(createPostItem(post, isViewed));
  });

  container.append(title, list);
};

const renderModal = (state, elements) => {
  const post = state.posts.find(({ id }) => id === state.ui.modalPostId);

  if (!post || !elements.modalTitle || !elements.modalBody || !elements.modalFullArticleLink) {
    return;
  }

  elements.modalTitle.textContent = post.title;
  elements.modalBody.textContent = post.description;
  elements.modalFullArticleLink.href = post.link;
};

export default (state, elements, i18n) => {
  const {
    input,
    submitButton,
    feedback,
    feedsContainer,
    postsContainer,
  } = elements;

  const renderForm = () => {
    const { state: formState, error } = state.form;

    input.classList.remove('is-invalid', 'is-valid');
    feedback.textContent = '';
    feedback.classList.remove('text-danger', 'text-success');

    if (formState === 'failed') {
      input.classList.add('is-invalid');
      feedback.textContent = i18n.t(error ?? 'errors.unknown');
      feedback.classList.add('text-danger');
    }

    if (formState === 'success') {
      input.classList.add('is-valid');
      feedback.textContent = i18n.t('form.success');
      feedback.classList.add('text-success');
    }

    const isProcessing = formState === 'processing';
    input.disabled = isProcessing;
    submitButton.disabled = isProcessing;
  };

  const render = () => {
    renderForm();
    renderPosts(postsContainer, state.posts, state.ui.viewedPostIds);
    renderFeeds(feedsContainer, state.feeds);
    renderModal(state, elements);
  };

  render();
  subscribe(state, render);
};