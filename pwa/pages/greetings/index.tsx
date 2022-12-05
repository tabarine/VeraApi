import { GetServerSideProps, NextComponentType, NextPageContext } from "next";
import Head from "next/head";
import { dehydrate, QueryClient, useQuery } from "react-query";

import Pagination from "../../components/common/Pagination";
import { List } from "../../components/greeting/List";
import { PagedCollection } from "../../types/collection";
import { Greeting } from "../../types/Greeting";
import { fetch, FetchResponse } from "../../utils/dataAccess";
import { useMercure } from "../../utils/mercure";

const getGreetings = async () =>
  await fetch<PagedCollection<Greeting>>("/greetings");

const Page: NextComponentType<NextPageContext> = () => {
  const { data: { data: greetings, hubURL } = { hubURL: null } } = useQuery<
    FetchResponse<PagedCollection<Greeting>> | undefined
  >("greetings", getGreetings);
  const collection = useMercure(greetings, hubURL);

  if (!collection || !collection["hydra:member"]) return null;

  return (
    <div>
      <div>
        <Head>
          <title>Greeting List</title>
        </Head>
      </div>
      <List greetings={collection["hydra:member"]} />
      <Pagination collection={collection} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery("greetings", getGreetings);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default Page;
