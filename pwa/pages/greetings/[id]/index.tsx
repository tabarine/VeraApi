import {
  GetStaticPaths,
  GetStaticProps,
  NextComponentType,
  NextPageContext,
} from "next";
import DefaultErrorPage from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import { dehydrate, QueryClient, useQuery } from "react-query";

import { Show } from "../../../components/greeting/Show";
import { PagedCollection } from "../../../types/collection";
import { Greeting } from "../../../types/Greeting";
import { fetch, FetchResponse, getPaths } from "../../../utils/dataAccess";
import { useMercure } from "../../../utils/mercure";

const getGreeting = async (id: string | string[] | undefined) =>
  id ? await fetch<Greeting>(`/greetings/${id}`) : Promise.resolve(undefined);

const Page: NextComponentType<NextPageContext> = () => {
  const router = useRouter();
  const { id } = router.query;

  const {
    data: { data: greeting, hubURL, text } = { hubURL: null, text: "" },
  } = useQuery<FetchResponse<Greeting> | undefined>(["greeting", id], () =>
    getGreeting(id)
  );
  const greetingData = useMercure(greeting, hubURL);

  if (!greetingData) {
    return <DefaultErrorPage statusCode={404} />;
  }

  return (
    <div>
      <div>
        <Head>
          <title>{`Show Greeting ${greetingData["@id"]}`}</title>
        </Head>
      </div>
      <Show greeting={greetingData} text={text} />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({
  params: { id } = {},
}) => {
  if (!id) throw new Error("id not in query param");
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(["greeting", id], () => getGreeting(id));

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const response = await fetch<PagedCollection<Greeting>>("/greetings");
  const paths = await getPaths(response, "greetings", "/greetings/[id]");

  return {
    paths,
    fallback: true,
  };
};

export default Page;
