import http from 'node:http';
import handler from 'serve-handler';

const port = Number(process.env.PORT || 3000);

const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: 'build',
    cleanUrls: true,
    rewrites: [{ source: '**', destination: '/index.html' }],
    headers: [
      {
        source: '**/*.@(js|css|woff2|svg|png|jpg|jpeg|gif|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: 'index.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ],
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server started on port ${port}`);
});
