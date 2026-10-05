# IQ Canvas Core

Independent, headless CAD service. Original files in this package are licensed
under **AGPL-3.0-only**. JSCAD dependencies retain their MIT licenses and notices.
No IQ Canvas UI, user boards, API credentials or proprietary modules are included.

## Run

Requires Node 22+. `npm ci`, `npm test`, `npm run source`, then set a random
`IQ_CORE_TOKEN` of at least 24 characters and run `npm start`. The service binds
to loopback by default. Put an authenticated HTTPS reverse proxy in front of it
for remote use. Set `IQ_CORE_HOST` only for an intentional container deployment.
The server rejects executable JavaScript; it accepts bounded JSON geometry.

POST `/v1/generate`, `Authorization: Bearer <token>`:

```json
{"engine":"jscad","model":{"type":"subtract","children":[{"type":"box","size":[30,30,10]},{"type":"cylinder","radius":4,"height":12}]}}
```

Response: `{engine,mime:"model/stl",filename,content}`. Dimensions are in the
model's chosen units; STL has no unit metadata. Supported primitives: box,
sphere, cylinder; operations: union, subtract, intersect; optional translate.
No arbitrary CAD script execution, assemblies, STEP export or Python workers.

## Source and license

GET `/` advertises the license and source location. GET `/source` offers the
source archive without authentication. Rebuild that archive with `npm run source`
after every change and before starting the service, so the offered source matches
the running version. Archive includes source, lockfile, tests, build script,
license and JSCAD notices; `npm ci` obtains unmodified MIT dependencies.
The service refuses to start if this archive is missing.

## Integration

The commercial client communicates over HTTP using generic model JSON and STL.
It must not import this package into its browser bundle or application worker.
Separate processes and HTTP are an architecture choice, not a legal guarantee
that two programs are separate works. Review actual coupling and provenance
before a commercial release. No third-party license is replaced by AGPL.

Only JSCAD is implemented here. Other researched tools are recorded in
`ENGINE-MATRIX.md` as future integrations, not installed or working adapters.

## Cloudflare edge deployment

`npm ci && npm run build` builds the standalone Worker and a corresponding-source ZIP. Hosting metadata is in `.openai/hosting.json`. Runtime token belongs in deployment environment, never in the archive. Edge API supports the same bounded JSON contract; platform CPU limits replace Node worker termination. `/source.zip` serves the exact source used to build the deployed Worker. Rebuild and redeploy after every code change. The commercial UI is not part of this package.
