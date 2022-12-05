import { FunctionComponent } from "react";
import Link from "next/link";

import ReferenceLinks from "../common/ReferenceLinks";
import { getPath } from "../../utils/dataAccess";
import { Greeting } from "../../types/Greeting";

interface Props {
  greetings: Greeting[];
}

export const List: FunctionComponent<Props> = ({ greetings }) => (
  <div>
    <h1>Greeting List</h1>
    <Link href="/greetings/create">
      <a className="btn btn-primary">Create</a>
    </Link>
    <table className="table table-responsive table-striped table-hover">
      <thead>
        <tr>
          <th>id</th>
          <th>name</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {greetings &&
          greetings.length !== 0 &&
          greetings.map(
            (greeting) =>
              greeting["@id"] && (
                <tr key={greeting["@id"]}>
                  <th scope="row">
                    <ReferenceLinks
                      items={{
                        href: getPath(greeting["@id"], "/greetings/[id]"),
                        name: greeting["@id"],
                      }}
                    />
                  </th>
                  <td>{greeting["name"]}</td>
                  <td>
                    <Link href={getPath(greeting["@id"], "/greetings/[id]")}>
                      <a>
                        <i className="bi bi-search" aria-hidden="true"></i>
                        <span className="sr-only">Show</span>
                      </a>
                    </Link>
                  </td>
                  <td>
                    <Link
                      href={getPath(greeting["@id"], "/greetings/[id]/edit")}
                    >
                      <a>
                        <i className="bi bi-pen" aria-hidden="true" />
                        <span className="sr-only">Edit</span>
                      </a>
                    </Link>
                  </td>
                </tr>
              )
          )}
      </tbody>
    </table>
  </div>
);
