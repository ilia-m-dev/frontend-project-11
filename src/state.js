import { proxy } from 'valtio/vanilla'

export default proxy({
  form: {
    state: 'filling',
    error: null,
  },
  feeds: [],
  posts: [],
  ui: {
    viewedPostIds: [],
    modalPostId: null,
  },
})
