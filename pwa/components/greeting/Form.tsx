import { FunctionComponent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import { useMutation } from "react-query";

import { fetch, FetchError, FetchResponse } from "../../utils/dataAccess";
import { Greeting } from "../../types/Greeting";

interface Props {
  greeting?: Greeting;
}

interface SaveParams {
  values: Greeting;
}

interface DeleteParams {
  id: string;
}

const saveGreeting = async ({ values }: SaveParams) =>
  await fetch<Greeting>(!values["@id"] ? "/greetings" : values["@id"], {
    method: !values["@id"] ? "POST" : "PUT",
    body: JSON.stringify(values),
  });

const deleteGreeting = async (id: string) =>
  await fetch<Greeting>(id, { method: "DELETE" });

export const Form: FunctionComponent<Props> = ({ greeting }) => {
  const [, setError] = useState<string | null>(null);
  const router = useRouter();

  const saveMutation = useMutation<
    FetchResponse<Greeting> | undefined,
    Error | FetchError,
    SaveParams
  >((saveParams) => saveGreeting(saveParams));

  const deleteMutation = useMutation<
    FetchResponse<Greeting> | undefined,
    Error | FetchError,
    DeleteParams
  >(({ id }) => deleteGreeting(id), {
    onSuccess: () => {
      router.push("/greetings");
    },
    onError: (error) => {
      setError(`Error when deleting the resource: ${error}`);
      console.error(error);
    },
  });

  const handleDelete = () => {
    if (!greeting || !greeting["@id"]) return;
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    deleteMutation.mutate({ id: greeting["@id"] });
  };

  return (
    <div>
      <h1>
        {greeting ? `Edit Greeting ${greeting["@id"]}` : `Create Greeting`}
      </h1>
      <Formik
        initialValues={
          greeting
            ? {
                ...greeting,
              }
            : new Greeting()
        }
        validate={() => {
          const errors = {};
          // add your validation logic here
          return errors;
        }}
        onSubmit={(values, { setSubmitting, setStatus, setErrors }) => {
          const isCreation = !values["@id"];
          saveMutation.mutate(
            { values },
            {
              onSuccess: () => {
                setStatus({
                  isValid: true,
                  msg: `Element ${isCreation ? "created" : "updated"}.`,
                });
                router.push("/greetings");
              },
              onError: (error) => {
                setStatus({
                  isValid: false,
                  msg: `${error.message}`,
                });
                if ("fields" in error) {
                  setErrors(error.fields);
                }
              },
              onSettled: () => {
                setSubmitting(false);
              },
            }
          );
        }}
      >
        {({
          values,
          status,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-control-label" htmlFor="greeting_name">
                name
              </label>
              <input
                name="name"
                id="greeting_name"
                value={values.name ?? ""}
                type="text"
                placeholder="A nice person"
                required={true}
                className={`form-control${
                  errors.name && touched.name ? " is-invalid" : ""
                }`}
                aria-invalid={errors.name && touched.name ? "true" : undefined}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="invalid-feedback"
                component="div"
                name="name"
              />
            </div>
            {status && status.msg && (
              <div
                className={`alert ${
                  status.isValid ? "alert-success" : "alert-danger"
                }`}
                role="alert"
              >
                {status.msg}
              </div>
            )}
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSubmitting}
            >
              Submit
            </button>
          </form>
        )}
      </Formik>
      <Link href="/greetings">
        <a className="btn btn-primary">Back to list</a>
      </Link>
      {greeting && (
        <button className="btn btn-danger" onClick={handleDelete}>
          <a>Delete</a>
        </button>
      )}
    </div>
  );
};
