import {
  HeadContent,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";

import {
  TanStackRouterDevtoolsPanel,
} from "@tanstack/react-router-devtools";

import {
  TanStackDevtools,
} from "@tanstack/react-devtools";

import appCss from "../styles.css?url";
import "../styles/root-navigation.css";

import Header from "../components/header";

import Footer from "../components/footer";


export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1",
      },
      {
        title: "Job Portal",
      },
    ],

    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>

      <body>

        <Header />

        <div className="site-page-content">
          {children}
        </div>
         <Footer />
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: (
                <TanStackRouterDevtoolsPanel />
              ),
            },
          ]}
        />

        <Scripts />

      </body>
    </html>
  );
}