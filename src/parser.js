const getTextContent = (element, tagName) => {
  const node = element.getElementsByTagName(tagName)[0];
  return node?.textContent?.trim() ?? '';
};

const makeParsingError = () => new Error('errors.invalidRss');

export default (rssContent) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(rssContent, 'application/xml');

  const channel = document.getElementsByTagName('channel')[0];

  if (!channel) {
    throw makeParsingError();
  }

  const title = getTextContent(channel, 'title');
  const description = getTextContent(channel, 'description');

  if (!title) {
    throw makeParsingError();
  }

  const items = Array.from(channel.getElementsByTagName('item'));

  const posts = items
    .map((item) => ({
      title: getTextContent(item, 'title'),
      description: getTextContent(item, 'description'),
      link: getTextContent(item, 'link'),
    }))
    .filter((post) => post.title && post.link);

  return {
    feed: {
      title,
      description,
    },
    posts,
  };
};