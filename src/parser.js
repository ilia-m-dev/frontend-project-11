const getTextContent = (element, tagName) => {
  const node = element.querySelector(tagName)
  return node?.textContent?.trim() ?? ''
}

const makeParsingError = () => new Error('errors.invalidRss')

export default (rssContent) => {
  const parser = new DOMParser()
  const document = parser.parseFromString(rssContent, 'text/xml')

  if (document.querySelector('parsererror')) {
    throw makeParsingError()
  }

  const channel = document.querySelector('channel')

  if (!channel) {
    throw makeParsingError()
  }

  const title = getTextContent(channel, 'title')
  const description = getTextContent(channel, 'description')

  if (!title) {
    throw makeParsingError()
  }

  const items = Array.from(document.querySelectorAll('item'))

  const posts = items
    .map(item => ({
      title: getTextContent(item, 'title'),
      description: getTextContent(item, 'description'),
      link: getTextContent(item, 'link'),
    }))
    .filter(post => post.title && post.link)

  return {
    feed: {
      title,
      description,
    },
    posts,
  }
}
