import { json, LinksFunction, LoaderFunctionArgs, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { Hamburger } from "components/hamburger";
import { useEffect, useState } from "react";

import appStylesHref from "./app.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref }
]

import { createEmptyContact, getContacts } from "./data";

enum InputNames {
  query = "query"
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const q = url.searchParams.get(InputNames.query)
  const contacts = await getContacts(q);
  return json({ contacts, q });
}

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`contacts/${contact.id}/edit`)
}

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const searching = navigation.location &&
    new URLSearchParams(navigation.location.search).has(InputNames.query);

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  const [ collapsed, setCollapsed ] = useState(true);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar" className={collapsed ? "collapsed" : ""}>
          {!collapsed && <h1>Remix Contacts</h1>}
          <div>
            {!collapsed && (
              <Link to="/"> 
                <button>Home</button>
              </Link>
            )}
            <button className="hamburgerButton" onClick={() => setCollapsed(!collapsed)}>
              <Hamburger />
            </button>
          </div>
          {!collapsed && (
            <>
              <div>
                <Form 
                  onChange={event => {
                    const isFirstSearch = q === null;
                    submit(event.currentTarget, { replace: !isFirstSearch })
                  }} 
                  id="search-form" 
                  role="search"
                >
                  <input
                    id="q"
                    aria-label="Search contacts"
                    className={searching ? "loading" : ""}
                    placeholder="Search"
                    type="search"
                    name={InputNames.query}
                    defaultValue={q ?? ""}
                  />
                  <div id="search-spinner" aria-hidden hidden={!searching} />
                </Form>
                <Form method="post">
                  <button type="submit">New</button>
                </Form>
              </div>
              <nav>
                {contacts.length ? (
                  <ul>
                    {contacts.map(contact => (
                      <li key={contact.id}>
                        <NavLink
                          className={({ isActive, isPending }) => (
                            isActive ? "active" : isPending ? "pending" : ""
                          )}
                          to={`contacts/${contact.id}`}
                        >
                          {contact.first || contact.last ? (
                            <>{contact.first} {contact.last}</>
                          ) : (
                            <i>No Name</i>
                          )}
                          {contact.favorite && <span>★</span>}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    <i>No contacts</i>
                  </p>
                )}
              </nav>
            </>
          )}
        </div>
        <div 
          id="detail"
          className={navigation.state === "loading" && !searching ? "loading" : ""}
          onClick={() => setCollapsed(true)}
        >
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}