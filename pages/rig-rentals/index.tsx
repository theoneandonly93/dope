import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.statusCode = 308;
  res.setHeader("Location", "/rig-rentals/market");
  return { props: {} } as any;
};

export default function Redirect() { return null; }
//#