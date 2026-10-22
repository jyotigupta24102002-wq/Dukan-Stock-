export const MON = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const inr = (n) =>
  "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

export const today = () => {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
};

export const dfmt = (s) => {
  const p = String(s).split("-");
  return +p[2] + " " + MON[+p[1] - 1] + " " + p[0];
};
