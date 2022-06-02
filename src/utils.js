export const padNumber = (numb) => {
  if (numb > 999) return numb;
  return ("00" + numb).slice(-3);
};
