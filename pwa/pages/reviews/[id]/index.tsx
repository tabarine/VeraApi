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

import { Show } from "../../../components/review/Show";
import { PagedCollection } from "../../../types/collection";
import { Review } from "../../../types/Review";
import { fetch, FetchResponse, getPaths } from "../../../utils/dataAccess";
import { useMercure } from "../../../utils/mercure";

const getReview = async (id: string | string[] | undefined) =>
  id ? await fetch<Review>(`/reviews/${id}`) : Promise.resolve(undefined);

const Page: NextComponentType<NextPageContext> = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: { data: review, hubURL, text } = { hubURL: null, text: "" } } =
    useQuery<FetchResponse<Review> | undefined>(["review", id], () =>
      getReview(id)
    );
  const reviewData = useMercure(review, hubURL);

  if (!reviewData) {
    return <DefaultErrorPage statusCode={404} />;
  }

  return (
    <div>
      <div>
        <Head>
          <title>{`Show Review ${reviewData["@id"]}`}</title>
        </Head>
      </div>
      <Show review={reviewData} text={text} />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({
  params: { id } = {},
}) => {
  if (!id) throw new Error("id not in query param");
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(["review", id], () => getReview(id));

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const response = await fetch<PagedCollection<Review>>("/reviews");
  const paths = await getPaths(response, "reviews", "/reviews/[id]");

  return {
    paths,
    fallback: true,
  };
};

export default Page;
