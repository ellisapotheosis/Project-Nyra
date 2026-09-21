import type { NextPageContext } from "next";

type ErrorPageProps = {
  statusCode?: number;
};

export default function ErrorPage({ statusCode }: ErrorPageProps): JSX.Element {
  return (
    <main
      style={{
        alignItems: "center",
        display: "flex",
        fontFamily: "system-ui, sans-serif",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div>
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
          {statusCode ?? "Error"}
        </p>
        <h1>Something went wrong</h1>
        <p style={{ color: "#64748b" }}>Please try again.</p>
      </div>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => ({
  statusCode: res?.statusCode ?? err?.statusCode ?? 500,
});
