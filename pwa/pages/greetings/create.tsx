import { NextComponentType, NextPageContext } from "next";
import Head from "next/head";

import { Form } from "../../components/greeting/Form";

const Page: NextComponentType<NextPageContext> = () => (
  <div>
    <div>
      <Head>
        <title>Create Greeting</title>
      </Head>
    </div>
    <Form />
  </div>
);

export default Page;
