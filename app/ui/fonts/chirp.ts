import localFont from "next/font/local";

const chirp = localFont({
  src: [
    {
      path: "./chirp-regular-web.woff",
      weight: "400",
    },
    {
      path: "./chirp-medium-web.woff",
      weight: "500",
    },
    {
      path: "./chirp-bold-web.woff",
      weight: "600",
    },
  ],
});

export default chirp;