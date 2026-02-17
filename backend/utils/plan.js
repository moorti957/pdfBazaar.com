export const getDownloadLimit = (plan) => {
  if (plan === "basic") return 5;
  if (plan === "standard") return 15;
  if (plan === "premium") return Infinity;
  return 0;
};
