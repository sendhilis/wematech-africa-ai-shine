import { Writable } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { AppProviders, AppRoutes } from "./App";

export interface RenderResult {
  html: string;
  head: string;
}

/** Renders one route to HTML, waiting for every lazy page/section to load. */
export function render(url: string): Promise<RenderResult> {
  const helmetContext: Record<string, any> = {};
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, enabled: false } } });

  return new Promise((resolve, reject) => {
    let html = "";
    const sink = new Writable({
      write(chunk, _enc, cb) {
        html += chunk.toString();
        cb();
      },
      final(cb) {
        const h = helmetContext.helmet;
        const head = h
          ? [h.title, h.meta, h.link, h.script].map((t: { toString(): string }) => t.toString()).join("\n")
          : "";
        resolve({ html, head });
        cb();
      },
    });

    const stream = renderToPipeableStream(
      <AppProviders helmetContext={helmetContext} queryClient={queryClient}>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </AppProviders>,
      {
        onAllReady() {
          stream.pipe(sink);
        },
        onShellError: reject,
        onError(err) {
          reject(err);
        },
      },
    );
  });
}
