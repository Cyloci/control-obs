export const mustFind = <A>(array: A[], findFn: (x: A) => boolean): A => {
  const result = array.find(findFn);
  if (!result) {
    throw Error(`failed to find item in mustFind`);
  }
  return result;
};
