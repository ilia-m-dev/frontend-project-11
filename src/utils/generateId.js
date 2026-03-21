let counter = 0;

const generateId = () => {
  counter += 1;
  return `id-${Date.now()}-${counter}`;
};

export default generateId;