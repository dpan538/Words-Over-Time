import { createHash } from "node:crypto";
import {
  createReadStream,
  createWriteStream,
  existsSync,
} from "node:fs";
import {
  copyFile,
  mkdir,
  open,
  readFile,
  rename,
  stat,
  statfs,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { createInterface } from "node:readline";
import { createGunzip } from "node:zlib";

const ROOT = process.cwd();
const RELEASE = "googlebooks-eng-20200217";
const RELEASE_DIRECTORY = "20200217/eng";
const VIEWER_SHORTHAND = "eng_2019";
const VIEWER_CORPUS_ID = 26;
const START_YEAR = 1500;
const END_YEAR = 2019;
const OFFICIAL_INDEX_URL =
  "https://storage.googleapis.com/books/ngrams/books/datasetsv3.html";
const VIEWER_INFO_URL = "https://books.google.com/ngrams/info";
const DATASET_LICENSE = "Creative Commons Attribution 3.0 Unported License";
const DATASET_LICENSE_URL = "https://creativecommons.org/licenses/by/3.0/";

const CACHE_DIR = path.join(
  ROOT,
  ".cache",
  "google-ngram",
  "20200217",
  "eng",
);
const ARTIFACT_DIR = path.join(
  ROOT,
  "docs",
  "research",
  "forever",
  "google-fixed-20200217",
);
const FROZEN_DIR = path.join(ARTIFACT_DIR, "frozen");
const EXTRACTED_DIR = path.join(ARTIFACT_DIR, "extracted");

type SourceObject = {
  id: "unigram-shard" | "bigram-shard" | "annual-token-totals";
  url: string;
  fileName: string;
  expectedBytes: number;
  expectedEtag: string;
  expectedLastModified: string;
  expectedCrc32c: string;
  expectedMd5Base64: string;
  expectedGeneration: string;
  ngramOrder: 1 | 2 | null;
};

const SOURCE_OBJECTS: SourceObject[] = [
  {
    id: "unigram-shard",
    url: "https://storage.googleapis.com/books/ngrams/books/20200217/eng/1-00018-of-00024.gz",
    fileName: "1-00018-of-00024.gz",
    expectedBytes: 593_921_274,
    expectedEtag: "d42b5cec82ecb6d0b5f19d018fcd1743",
    expectedLastModified: "Sat, 14 Mar 2020 01:29:37 GMT",
    expectedCrc32c: "Xu/7xQ==",
    expectedMd5Base64: "1Ctc7ILsttC18Z0Bj80XQw==",
    expectedGeneration: "1584149377777664",
    ngramOrder: 1,
  },
  {
    id: "bigram-shard",
    url: "https://storage.googleapis.com/books/ngrams/books/20200217/eng/2-00407-of-00589.gz",
    fileName: "2-00407-of-00589.gz",
    expectedBytes: 647_005_430,
    expectedEtag: "8fe3ba01e4032bf15184824b20143529",
    expectedLastModified: "Sat, 14 Mar 2020 01:32:03 GMT",
    expectedCrc32c: "ds6jgQ==",
    expectedMd5Base64: "j+O6AeQDK/FRhIJLIBQ1KQ==",
    expectedGeneration: "1584149523190707",
    ngramOrder: 2,
  },
  {
    id: "annual-token-totals",
    url: "https://storage.googleapis.com/books/ngrams/books/20200217/eng/totalcounts-1",
    fileName: "totalcounts-1",
    expectedBytes: 13_546,
    expectedEtag: "fea9f8e9fe2c9b7b6862ec292a11e23d",
    expectedLastModified: "Tue, 14 Jul 2020 16:49:55 GMT",
    expectedCrc32c: "vdSUiw==",
    expectedMd5Base64: "/qn46f4sm3toYuwpKhHiPQ==",
    expectedGeneration: "1594745395448856",
    ngramOrder: null,
  },
];

const CORE_SHARD_COMPRESSED_BYTES = SOURCE_OBJECTS.filter(
  (source) => source.ngramOrder !== null,
).reduce((sum, source) => sum + source.expectedBytes, 0);
const TOTAL_DOWNLOAD_BYTES = SOURCE_OBJECTS.reduce(
  (sum, source) => sum + source.expectedBytes,
  0,
);
const REQUIRED_FREE_BYTES = TOTAL_DOWNLOAD_BYTES * 2 + 256 * 1024 * 1024;

const VIEWER_REQUEST_URL =
  "https://books.google.com/ngrams/json?content=forever%3Aeng_2019%2Cfor%20ever%3Aeng_2019&year_start=1500&year_end=2019&corpus=26&smoothing=0&case_insensitive=false";
const VIEWER_RESPONSE_PATH = path.join(
  FROZEN_DIR,
  "viewer-eng_2019-s0-case-sensitive.json",
);
const VIEWER_REQUEST_PATH = path.join(FROZEN_DIR, "viewer-request.json");
const TOTALCOUNTS_FROZEN_PATH = path.join(FROZEN_DIR, "totalcounts-1");

type HeadRecord = {
  id: SourceObject["id"];
  url: string;
  httpStatus: number;
  contentLength: number;
  lastModified: string;
  etag: string;
  xGoogHash: string[];
  xGoogGeneration: string;
  acceptRanges: string;
};

type LocalRecord = {
  cachePath: string;
  exists: boolean;
  bytes: number | null;
  sha256: string | null;
  md5Hex: string | null;
  md5Base64: string | null;
  verifiedAgainstOfficialMd5: boolean;
};

type ExtractSpec = {
  id: "forever" | "for-ever" | "forevermore";
  exactForm: "forever" | "for ever" | "forevermore";
  ngramOrder: 1 | 2;
  role: "core_joined" | "core_spaced" | "optional_related";
  sourceId: "unigram-shard" | "bigram-shard";
  wideSourceFile: string;
  annualFile: string;
};

const EXTRACT_SPECS: ExtractSpec[] = [
  {
    id: "forever",
    exactForm: "forever",
    ngramOrder: 1,
    role: "core_joined",
    sourceId: "unigram-shard",
    wideSourceFile: "forever-1.source.tsv",
    annualFile: "forever-1.annual.tsv",
  },
  {
    id: "for-ever",
    exactForm: "for ever",
    ngramOrder: 2,
    role: "core_spaced",
    sourceId: "bigram-shard",
    wideSourceFile: "for-ever-2.source.tsv",
    annualFile: "for-ever-2.annual.tsv",
  },
  {
    id: "forevermore",
    exactForm: "forevermore",
    ngramOrder: 1,
    role: "optional_related",
    sourceId: "unigram-shard",
    wideSourceFile: "forevermore-1.source.tsv",
    annualFile: "forevermore-1.annual.tsv",
  },
];

const ANNUAL_HEADER =
  "ngram\tyear\tmatch_count\tvolume_count\tngram_order\tcorpus_release\tsource_shard\twide_field_index";

function relative(filePath: string) {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

function isoNow() {
  return new Date().toISOString();
}

async function ensureDirectories() {
  await Promise.all([
    mkdir(CACHE_DIR, { recursive: true }),
    mkdir(FROZEN_DIR, { recursive: true }),
    mkdir(EXTRACTED_DIR, { recursive: true }),
  ]);
}

async function writeJsonAtomic(filePath: string, value: unknown) {
  const partialPath = `${filePath}.part`;
  await writeFile(partialPath, `${JSON.stringify(value, null, 2)}\n`);
  await rename(partialPath, filePath);
}

async function digestFile(filePath: string, algorithm: "sha256" | "md5", encoding: "hex" | "base64") {
  const hash = createHash(algorithm);
  await pipeline(createReadStream(filePath), hash);
  return hash.digest(encoding);
}

async function sha256File(filePath: string) {
  return digestFile(filePath, "sha256", "hex");
}

const identityDigestCache = new Map<
  string,
  {
    size: number;
    mtimeMs: number;
    digests: { sha256: string; md5Hex: string; md5Base64: string };
  }
>();

async function identityDigests(filePath: string) {
  const fileStat = await stat(filePath);
  const cached = identityDigestCache.get(filePath);
  if (cached && cached.size === fileStat.size && cached.mtimeMs === fileStat.mtimeMs) {
    return cached.digests;
  }
  const sha256 = createHash("sha256");
  const md5Hex = createHash("md5");
  const md5Base64 = createHash("md5");
  for await (const chunk of createReadStream(filePath)) {
    sha256.update(chunk);
    md5Hex.update(chunk);
    md5Base64.update(chunk);
  }
  const digests = {
    sha256: sha256.digest("hex"),
    md5Hex: md5Hex.digest("hex"),
    md5Base64: md5Base64.digest("base64"),
  };
  identityDigestCache.set(filePath, {
    size: fileStat.size,
    mtimeMs: fileStat.mtimeMs,
    digests,
  });
  return digests;
}

function allHeaderValues(headers: Headers, name: string) {
  const value = headers.get(name);
  if (!value) return [];
  return value.split(",").map((item) => item.trim());
}

function normalizedEtag(value: string) {
  return value.replace(/^"|"$/g, "");
}

function assertObjectIdentity(source: SourceObject, record: HeadRecord) {
  if (record.httpStatus !== 200) {
    throw new Error(`${source.id}: expected HTTP 200, received ${record.httpStatus}`);
  }
  if (record.contentLength !== source.expectedBytes) {
    throw new Error(
      `${source.id}: expected ${source.expectedBytes} bytes, received ${record.contentLength}`,
    );
  }
  if (normalizedEtag(record.etag) !== source.expectedEtag) {
    throw new Error(`${source.id}: ETag changed from the discovery baseline`);
  }
  if (record.lastModified !== source.expectedLastModified) {
    throw new Error(`${source.id}: Last-Modified changed from the discovery baseline`);
  }
  if (record.xGoogGeneration !== source.expectedGeneration) {
    throw new Error(`${source.id}: x-goog-generation changed from the discovery baseline`);
  }
  const expectedHashes = [
    `crc32c=${source.expectedCrc32c}`,
    `md5=${source.expectedMd5Base64}`,
  ];
  for (const expected of expectedHashes) {
    if (!record.xGoogHash.includes(expected)) {
      throw new Error(`${source.id}: missing expected x-goog-hash ${expected}`);
    }
  }
  if (record.acceptRanges.toLowerCase() !== "bytes") {
    throw new Error(`${source.id}: server no longer advertises byte ranges`);
  }
}

async function discoverObjects() {
  const records: HeadRecord[] = [];
  for (const source of SOURCE_OBJECTS) {
    const response = await fetch(source.url, { method: "HEAD" });
    const record: HeadRecord = {
      id: source.id,
      url: source.url,
      httpStatus: response.status,
      contentLength: Number(response.headers.get("content-length")),
      lastModified: response.headers.get("last-modified") ?? "",
      etag: response.headers.get("etag") ?? "",
      xGoogHash: allHeaderValues(response.headers, "x-goog-hash"),
      xGoogGeneration: response.headers.get("x-goog-generation") ?? "",
      acceptRanges: response.headers.get("accept-ranges") ?? "",
    };
    assertObjectIdentity(source, record);
    records.push(record);
  }
  return records;
}

async function availableBytes() {
  const disk = await statfs(ROOT);
  return Number(disk.bavail) * Number(disk.bsize);
}

async function assertDiskSpace() {
  const available = await availableBytes();
  if (available < REQUIRED_FREE_BYTES) {
    throw new Error(
      `Insufficient disk: ${available} available; ${REQUIRED_FREE_BYTES} required`,
    );
  }
  return available;
}

async function localRecord(source: SourceObject): Promise<LocalRecord> {
  const cachePath = path.join(CACHE_DIR, source.fileName);
  if (!existsSync(cachePath)) {
    return {
      cachePath: relative(cachePath),
      exists: false,
      bytes: null,
      sha256: null,
      md5Hex: null,
      md5Base64: null,
      verifiedAgainstOfficialMd5: false,
    };
  }
  const fileStat = await stat(cachePath);
  const digests = await identityDigests(cachePath);
  return {
    cachePath: relative(cachePath),
    exists: true,
    bytes: fileStat.size,
    sha256: digests.sha256,
    md5Hex: digests.md5Hex,
    md5Base64: digests.md5Base64,
    verifiedAgainstOfficialMd5:
      digests.md5Hex === source.expectedEtag &&
      digests.md5Base64 === source.expectedMd5Base64,
  };
}

async function writeSourceRightsManifest() {
  await writeJsonAtomic(path.join(ARTIFACT_DIR, "source-rights-manifest.json"), {
    schemaVersion: 1,
    datasetDefaults: {
      dataset: "Google Books Ngram Corpus, English 2019 fixed release",
      viewerShorthand: VIEWER_SHORTHAND,
      persistentIdentifier: RELEASE,
      rawReleaseDirectory: RELEASE_DIRECTORY,
      sourceUrl: OFFICIAL_INDEX_URL,
      viewerInfoUrl: VIEWER_INFO_URL,
      license: DATASET_LICENSE,
      licenseUrl: DATASET_LICENSE_URL,
      attribution: "Google Books Ngram Viewer",
      rightsBoundary:
        "The downloaded Ngram compilation is CC BY 3.0. Google states that Ngram Viewer graphs and data may be freely used with acknowledgement appreciated. This record does not grant rights in underlying scanned books or page images.",
    },
    itemOverrides: {},
  });
}

async function writeAcquisitionManifest(
  discovery: HeadRecord[],
  retrievalStartedAt: string,
  discoveryCompletedAt: string,
  cacheVerificationCompletedAt: string | null,
  diskBytes: number,
) {
  const objects = [];
  for (const source of SOURCE_OBJECTS) {
    const local = await localRecord(source);
    objects.push({
      ...discovery.find((record) => record.id === source.id),
      expectedBytes: source.expectedBytes,
      expectedEtag: source.expectedEtag,
      expectedLastModified: source.expectedLastModified,
      expectedXGoogHash: [
        `crc32c=${source.expectedCrc32c}`,
        `md5=${source.expectedMd5Base64}`,
      ],
      ngramOrder: source.ngramOrder,
      local: {
        ...local,
        cacheVerifiedAt:
          local.verifiedAgainstOfficialMd5 && cacheVerificationCompletedAt
            ? cacheVerificationCompletedAt
            : null,
      },
    });
  }
  await writeJsonAtomic(path.join(ARTIFACT_DIR, "acquisition-manifest.json"), {
    schemaVersion: 1,
    retrievalStartedAt,
    discoveryCompletedAt,
    cacheVerificationCompletedAt,
    officialIndexUrl: OFFICIAL_INDEX_URL,
    release: {
      viewerShorthand: VIEWER_SHORTHAND,
      persistentIdentifier: RELEASE,
      rawReleaseDirectory: RELEASE_DIRECTORY,
      expectedUpperYear: END_YEAR,
    },
    diskPreflight: {
      availableBytes: diskBytes,
      requiredBytes: REQUIRED_FREE_BYTES,
      coreShardCompressedBytes: CORE_SHARD_COMPRESSED_BYTES,
      totalDownloadBytes: TOTAL_DOWNLOAD_BYTES,
      policy:
        "Requires two times compressed object bytes plus 256 MiB for partial files, retained cache, and streaming extraction overhead.",
      passed: diskBytes >= REQUIRED_FREE_BYTES,
    },
    objects,
  });
}

async function assertCacheObjectIdentity(source: SourceObject) {
  const manifest = JSON.parse(
    await readFile(path.join(ARTIFACT_DIR, "acquisition-manifest.json"), "utf8"),
  ) as {
    objects: Array<{ id: SourceObject["id"]; local: LocalRecord }>;
  };
  const pinned = manifest.objects.find((item) => item.id === source.id)?.local;
  if (
    !pinned?.exists ||
    pinned.bytes !== source.expectedBytes ||
    pinned.sha256 === null ||
    pinned.md5Hex !== source.expectedEtag ||
    pinned.md5Base64 !== source.expectedMd5Base64 ||
    !pinned.verifiedAgainstOfficialMd5
  ) {
    throw new Error(`${source.id}: acquisition manifest does not pin a verified cache object`);
  }
  const cachePath = path.join(CACHE_DIR, source.fileName);
  const cacheStat = await stat(cachePath);
  if (cacheStat.size !== source.expectedBytes) {
    throw new Error(`${source.id}: cache length changed after acquisition`);
  }
  const actual = await identityDigests(cachePath);
  if (
    actual.sha256 !== pinned.sha256 ||
    actual.md5Hex !== source.expectedEtag ||
    actual.md5Base64 !== source.expectedMd5Base64
  ) {
    throw new Error(`${source.id}: cache identity changed after acquisition`);
  }
}

async function downloadObject(source: SourceObject) {
  const finalPath = path.join(CACHE_DIR, source.fileName);
  const partialPath = `${finalPath}.part`;

  if (existsSync(finalPath)) {
    const finalStat = await stat(finalPath);
    if (finalStat.size !== source.expectedBytes) {
      throw new Error(
        `${source.id}: formal cache file has invalid length ${finalStat.size}; refusing to overwrite it`,
      );
    }
    const digests = await identityDigests(finalPath);
    if (
      digests.md5Hex !== source.expectedEtag ||
      digests.md5Base64 !== source.expectedMd5Base64
    ) {
      throw new Error(`${source.id}: formal cache file fails official MD5/ETag verification`);
    }
    return;
  }

  let offset = 0;
  if (existsSync(partialPath)) {
    offset = (await stat(partialPath)).size;
    if (offset > source.expectedBytes) {
      throw new Error(`${source.id}: partial file is larger than the official object`);
    }
  }

  if (offset === source.expectedBytes) {
    const digests = await identityDigests(partialPath);
    if (
      digests.md5Hex !== source.expectedEtag ||
      digests.md5Base64 !== source.expectedMd5Base64
    ) {
      throw new Error(`${source.id}: complete .part fails official MD5/ETag verification`);
    }
    await rename(partialPath, finalPath);
    return;
  }

  const headers = new Headers();
  if (offset > 0) headers.set("Range", `bytes=${offset}-`);
  const response = await fetch(source.url, { headers });
  const expectedStatus = offset > 0 ? 206 : 200;
  if (response.status !== expectedStatus || !response.body) {
    throw new Error(
      `${source.id}: expected HTTP ${expectedStatus} while downloading, received ${response.status}`,
    );
  }
  if (offset > 0) {
    const expectedContentRange = `bytes ${offset}-${source.expectedBytes - 1}/${source.expectedBytes}`;
    if (response.headers.get("content-range") !== expectedContentRange) {
      throw new Error(
        `${source.id}: unexpected Content-Range ${response.headers.get("content-range")}`,
      );
    }
  } else if (Number(response.headers.get("content-length")) !== source.expectedBytes) {
    throw new Error(`${source.id}: GET Content-Length differs from discovery`);
  }

  await pipeline(
    Readable.fromWeb(response.body as never),
    createWriteStream(partialPath, { flags: offset > 0 ? "a" : "w" }),
  );
  const downloadedBytes = (await stat(partialPath)).size;
  if (downloadedBytes !== source.expectedBytes) {
    throw new Error(
      `${source.id}: incomplete .part (${downloadedBytes}/${source.expectedBytes}); rerun to resume`,
    );
  }

  // A valid-looking formal filename is created only after length, local SHA-256,
  // and the official MD5/ETag identity have all been verified.
  const digests = await identityDigests(partialPath);
  if (
    digests.md5Hex !== source.expectedEtag ||
    digests.md5Base64 !== source.expectedMd5Base64
  ) {
    throw new Error(`${source.id}: downloaded .part fails official MD5/ETag verification`);
  }
  await rename(partialPath, finalPath);
}

async function downloadAll() {
  for (const source of SOURCE_OBJECTS) {
    await downloadObject(source);
  }
}

function parseAnnualRow(line: string, source: SourceObject) {
  const fields = line.split("\t");
  if (fields.length !== 8) {
    throw new Error(`${source.id}: expected 8 annual TSV fields, received ${fields.length}`);
  }
  const [
    ngram,
    yearLexeme,
    matchLexeme,
    volumeLexeme,
    orderLexeme,
    release,
    sourceShard,
    wideFieldIndexLexeme,
  ] = fields;
  if (!/^\d{4}$/.test(yearLexeme)) {
    throw new Error(`${source.id}: invalid year lexeme ${JSON.stringify(yearLexeme)}`);
  }
  if (!/^(0|[1-9]\d*)$/.test(matchLexeme)) {
    throw new Error(`${source.id}: invalid match_count lexeme`);
  }
  if (!/^(0|[1-9]\d*)$/.test(volumeLexeme)) {
    throw new Error(`${source.id}: invalid volume_count lexeme`);
  }
  if (orderLexeme !== String(source.ngramOrder)) {
    throw new Error(`${source.id}: annual row has wrong n-gram order`);
  }
  if (release !== RELEASE) {
    throw new Error(`${source.id}: annual row has wrong corpus release`);
  }
  if (sourceShard !== source.fileName) {
    throw new Error(`${source.id}: annual row has wrong source shard`);
  }
  if (!/^[1-9]\d*$/.test(wideFieldIndexLexeme)) {
    throw new Error(`${source.id}: invalid wide field index`);
  }
  return {
    ngram,
    year: Number(yearLexeme),
    yearLexeme,
    matchCount: Number(matchLexeme),
    matchLexeme,
    volumeCount: Number(volumeLexeme),
    volumeLexeme,
    wideFieldIndex: Number(wideFieldIndexLexeme),
  };
}

function parseWideSourceRecord(line: string, source: SourceObject) {
  const fields = line.split("\t");
  if (fields.length < 2) {
    throw new Error(`${source.id}: v3 wide record has no annual observation fields`);
  }
  const ngram = fields[0];
  const seenYears = new Set<number>();
  const observations = fields.slice(1).map((field, offset) => {
    const tuple = field.split(",");
    if (tuple.length !== 3) {
      throw new Error(
        `${source.id}: v3 observation field ${offset + 1} must be year,match_count,volume_count`,
      );
    }
    const [yearLexeme, matchLexeme, volumeLexeme] = tuple;
    if (!/^\d{4}$/.test(yearLexeme)) {
      throw new Error(`${source.id}: invalid v3 year lexeme ${JSON.stringify(yearLexeme)}`);
    }
    if (!/^(0|[1-9]\d*)$/.test(matchLexeme)) {
      throw new Error(`${source.id}: invalid v3 match_count lexeme`);
    }
    if (!/^(0|[1-9]\d*)$/.test(volumeLexeme)) {
      throw new Error(`${source.id}: invalid v3 volume_count lexeme`);
    }
    const year = Number(yearLexeme);
    if (year > END_YEAR) {
      throw new Error(`${source.id}: retained year ${year} exceeds the fixed release upper year`);
    }
    if (seenYears.has(year)) {
      throw new Error(`${source.id}: duplicate year ${year} in one exact v3 source record`);
    }
    seenYears.add(year);
    return {
      year,
      yearLexeme,
      matchLexeme,
      volumeLexeme,
      // Zero-based index in the tab-split source record; index 0 is the ngram.
      wideFieldIndex: offset + 1,
    };
  });
  return { ngram, observations };
}

function validateTotalcountsBytes(bytes: Buffer) {
  const fields = bytes.toString("utf8").trimEnd().split("\t");
  const sentinel = fields.shift();
  if (sentinel === undefined || sentinel.trim() !== "") {
    throw new Error("annual-token-totals: expected the v3 leading empty ngram field");
  }
  const seenYears = new Set<number>();
  const annualWordTokens = new Map<number, number>();
  let earliestYear: number | null = null;
  let latestYear: number | null = null;
  for (const [offset, field] of fields.entries()) {
    const tuple = field.split(",");
    if (tuple.length !== 4) {
      throw new Error(
        `annual-token-totals: field ${offset + 1} must be year,match_count,page_count,volume_count`,
      );
    }
    const [yearLexeme, matchLexeme, pageLexeme, volumeLexeme] = tuple;
    if (!/^\d{4}$/.test(yearLexeme)) {
      throw new Error("annual-token-totals: invalid year lexeme");
    }
    for (const [name, lexeme] of [
      ["match_count", matchLexeme],
      ["page_count", pageLexeme],
      ["volume_count", volumeLexeme],
    ] as const) {
      if (!/^[1-9]\d*$/.test(lexeme)) {
        throw new Error(`annual-token-totals: ${name} must be a positive integer`);
      }
    }
    const year = Number(yearLexeme);
    if (year > END_YEAR) {
      throw new Error("annual-token-totals: year exceeds the fixed release upper year");
    }
    if (seenYears.has(year)) {
      throw new Error(`annual-token-totals: duplicate year ${year}`);
    }
    seenYears.add(year);
    annualWordTokens.set(year, Number(matchLexeme));
    earliestYear = earliestYear === null ? year : Math.min(earliestYear, year);
    latestYear = latestYear === null ? year : Math.max(latestYear, year);
  }
  if (latestYear !== END_YEAR) {
    throw new Error(
      `annual-token-totals: expected latest year ${END_YEAR}, received ${latestYear}`,
    );
  }
  return { observedYears: fields.length, earliestYear, latestYear, annualWordTokens };
}

async function extractFromShard(source: SourceObject, specs: ExtractSpec[]) {
  const sourcePath = path.join(CACHE_DIR, source.fileName);
  if (!existsSync(sourcePath)) {
    throw new Error(`${source.id}: source shard is not downloaded`);
  }
  await assertCacheObjectIdentity(source);

  const output = new Map<
    string,
    {
      wideHandle: Awaited<ReturnType<typeof open>>;
      annualHandle: Awaited<ReturnType<typeof open>>;
      widePath: string;
      annualPath: string;
    }
  >();
  const stats = new Map<
    string,
    {
      sourceRecords: number;
      annualRows: number;
      earliestYear: number | null;
      latestYear: number | null;
      explicitZeroYears: number[];
    }
  >();
  for (const spec of specs) {
    const widePath = path.join(EXTRACTED_DIR, spec.wideSourceFile);
    const annualPath = path.join(EXTRACTED_DIR, spec.annualFile);
    const annualHandle = await open(`${annualPath}.part`, "w");
    await annualHandle.write(`${ANNUAL_HEADER}\n`);
    output.set(spec.exactForm, {
      wideHandle: await open(`${widePath}.part`, "w"),
      annualHandle,
      widePath,
      annualPath,
    });
    stats.set(spec.exactForm, {
      sourceRecords: 0,
      annualRows: 0,
      earliestYear: null,
      latestYear: null,
      explicitZeroYears: [],
    });
  }

  try {
    const lines = createInterface({
      input: createReadStream(sourcePath).pipe(createGunzip()),
      crlfDelay: Infinity,
    });
    for await (const line of lines) {
      const ngram = line.slice(0, line.indexOf("\t"));
      const target = output.get(ngram);
      if (!target) continue;
      const sourceRecord = parseWideSourceRecord(line, source);
      const spec = specs.find((candidate) => candidate.exactForm === sourceRecord.ngram);
      if (!spec || sourceRecord.ngram !== spec.exactForm) {
        throw new Error(`${source.id}: exact-equality filter invariant failed`);
      }
      const rowStats = stats.get(sourceRecord.ngram)!;
      if (rowStats.sourceRecords !== 0) {
        throw new Error(`${source.id}: duplicate exact v3 source record for ${sourceRecord.ngram}`);
      }
      await target.wideHandle.write(`${line}\n`);
      rowStats.sourceRecords = 1;
      for (const observation of sourceRecord.observations) {
        await target.annualHandle.write(
          [
            sourceRecord.ngram,
            observation.yearLexeme,
            observation.matchLexeme,
            observation.volumeLexeme,
            String(spec.ngramOrder),
            RELEASE,
            source.fileName,
            String(observation.wideFieldIndex),
          ].join("\t") + "\n",
        );
        rowStats.annualRows += 1;
        rowStats.earliestYear =
          rowStats.earliestYear === null
            ? observation.year
            : Math.min(rowStats.earliestYear, observation.year);
        rowStats.latestYear =
          rowStats.latestYear === null
            ? observation.year
            : Math.max(rowStats.latestYear, observation.year);
        if (observation.matchLexeme === "0") rowStats.explicitZeroYears.push(observation.year);
      }
    }
  } finally {
    await Promise.all(
      [...output.values()].flatMap(({ wideHandle, annualHandle }) => [
        wideHandle.close(),
        annualHandle.close(),
      ]),
    );
  }

  for (const spec of specs) {
    const target = output.get(spec.exactForm)!;
    const rowStats = stats.get(spec.exactForm)!;
    if (spec.role.startsWith("core_") && rowStats.sourceRecords !== 1) {
      throw new Error(`${source.id}: expected one exact source record for ${spec.exactForm}`);
    }
    await rename(`${target.widePath}.part`, target.widePath);
    await rename(`${target.annualPath}.part`, target.annualPath);
  }
  return stats;
}

async function extractAll() {
  const result: Record<string, unknown> = {};
  for (const source of SOURCE_OBJECTS.filter((item) => item.ngramOrder !== null)) {
    const specs = EXTRACT_SPECS.filter((spec) => spec.sourceId === source.id);
    const shardStats = await extractFromShard(source, specs);
    for (const spec of specs) {
      result[spec.id] = shardStats.get(spec.exactForm);
    }
  }

  const totalsSource = SOURCE_OBJECTS.find((source) => source.id === "annual-token-totals")!;
  const totalsCachePath = path.join(CACHE_DIR, totalsSource.fileName);
  if ((await stat(totalsCachePath)).size !== totalsSource.expectedBytes) {
    throw new Error("annual-token-totals: cache length failed before freezing");
  }
  await assertCacheObjectIdentity(totalsSource);
  validateTotalcountsBytes(await readFile(totalsCachePath));
  const partialTotalsPath = `${TOTALCOUNTS_FROZEN_PATH}.part`;
  await copyFile(totalsCachePath, partialTotalsPath);
  if ((await sha256File(partialTotalsPath)) !== (await sha256File(totalsCachePath))) {
    throw new Error("annual-token-totals: frozen copy checksum mismatch");
  }
  await rename(partialTotalsPath, TOTALCOUNTS_FROZEN_PATH);

  await writeJsonAtomic(path.join(EXTRACTED_DIR, "extraction-summary.json"), {
    schemaVersion: 1,
    release: RELEASE,
    viewerRequestBoundary: { start: START_YEAR, end: END_YEAR },
    rawCoverageRule:
      "The raw lower bound is not assumed from the Viewer request. Each form records its actual earliest/latest source observation; common-denominator coverage must use the intersection with totalcounts-1.",
    exactEqualityOnly: true,
    sparseAbsencePolicy:
      "Only source rows that exactly equal the registered form are retained. A missing form-year is absent_or_suppressed, never silently converted to observed_zero.",
    sourceWideRecordSchema:
      "ngram TAB year,match_count,volume_count TAB year,match_count,volume_count ...",
    annualExpandedSchema: [
      "ngram",
      "year",
      "match_count",
      "volume_count",
      "ngram_order",
      "corpus_release",
      "source_shard",
      "wide_field_index",
    ],
    wideFieldIndex:
      "Zero-based tab-field index in the exact wide source record. Index 0 is the ngram; annual observations begin at index 1.",
    forms: EXTRACT_SPECS.map((spec) => ({
      ...spec,
      wideRawFile: relative(path.join(EXTRACTED_DIR, spec.wideSourceFile)),
      annualFile: relative(path.join(EXTRACTED_DIR, spec.annualFile)),
      stats: result[spec.id],
    })),
  });
}

type ViewerRow = {
  ngram: string;
  parent: string;
  type: string;
  timeseries: number[];
};

function validateViewerBytes(bytes: Buffer) {
  const rows = JSON.parse(bytes.toString("utf8")) as ViewerRow[];
  if (!Array.isArray(rows) || rows.length !== 2) {
    throw new Error("Viewer response must contain exactly the two core forms");
  }
  const expectedForms = new Set(["forever:eng_2019", "for ever:eng_2019"]);
  for (const row of rows) {
    if (!expectedForms.delete(row.ngram)) {
      throw new Error(`Viewer returned an unexpected or duplicate ngram: ${row.ngram}`);
    }
    if (row.parent !== "" || row.type !== "NGRAM") {
      throw new Error(`Viewer returned unexpected parent/type for ${row.ngram}`);
    }
    if (row.timeseries.length !== END_YEAR - START_YEAR + 1) {
      throw new Error(`Viewer returned wrong year count for ${row.ngram}`);
    }
    for (const value of row.timeseries) {
      if (!Number.isFinite(value) || value < 0) {
        throw new Error(`Viewer returned an invalid frequency for ${row.ngram}`);
      }
    }
  }
  return rows;
}

async function freezeViewerResponse(forceRefresh = false) {
  const responseExists = existsSync(VIEWER_RESPONSE_PATH);
  const requestExists = existsSync(VIEWER_REQUEST_PATH);
  if (!forceRefresh && responseExists !== requestExists) {
    throw new Error(
      "Viewer freeze is incomplete (response/request pair mismatch); use --viewer-refresh instead of inventing capture provenance",
    );
  }
  let capturedAt = isoNow();
  let priorRequest:
    | {
        capturedAt?: string;
        requestUrl?: string;
        rawResponse?: { path?: string; bytes?: number; sha256?: string };
      }
    | undefined;
  if (!forceRefresh && requestExists) {
    const parsedPriorRequest = JSON.parse(
      await readFile(VIEWER_REQUEST_PATH, "utf8"),
    ) as NonNullable<typeof priorRequest>;
    priorRequest = parsedPriorRequest;
    capturedAt = parsedPriorRequest.capturedAt ?? capturedAt;
  }
  if (forceRefresh || !responseExists) {
    const response = await fetch(VIEWER_REQUEST_URL);
    if (!response.ok) {
      throw new Error(`Viewer request failed: ${response.status} ${response.statusText}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    validateViewerBytes(bytes);
    const partialPath = `${VIEWER_RESPONSE_PATH}.part`;
    await writeFile(partialPath, bytes);
    await sha256File(partialPath);
    await rename(partialPath, VIEWER_RESPONSE_PATH);
  }

  const bytes = await readFile(VIEWER_RESPONSE_PATH);
  const rows = validateViewerBytes(bytes);
  const responseSha256 = await sha256File(VIEWER_RESPONSE_PATH);
  if (
    priorRequest &&
    (priorRequest.requestUrl !== VIEWER_REQUEST_URL ||
      priorRequest.rawResponse?.path !== relative(VIEWER_RESPONSE_PATH) ||
      priorRequest.rawResponse?.bytes !== bytes.byteLength ||
      priorRequest.rawResponse?.sha256 !== responseSha256)
  ) {
    throw new Error(
      "Existing Viewer request provenance does not bind the frozen response; use --viewer-refresh",
    );
  }
  await writeJsonAtomic(VIEWER_REQUEST_PATH, {
    schemaVersion: 1,
    capturedAt,
    requestUrl: VIEWER_REQUEST_URL,
    params: {
      canonicalSurfaceForms: ["forever", "for ever"],
      content: ["forever:eng_2019", "for ever:eng_2019"],
      yearStart: START_YEAR,
      yearEnd: END_YEAR,
      corpusSelector: VIEWER_SHORTHAND,
      corpusQueryParam: VIEWER_CORPUS_ID,
      smoothing: 0,
      caseSensitive: true,
      caseInsensitiveRequestValue: false,
    },
    release: {
      viewerShorthand: VIEWER_SHORTHAND,
      persistentIdentifier: RELEASE,
    },
    rawResponse: {
      path: relative(VIEWER_RESPONSE_PATH),
      bytes: bytes.byteLength,
      sha256: responseSha256,
    },
    returned: rows.map((row) => ({
      canonicalSurfaceForm: row.ngram.replace(`:${VIEWER_SHORTHAND}`, ""),
      ngram: row.ngram,
      parent: row.parent,
      type: row.type,
      pointCount: row.timeseries.length,
    })),
    interpretationBoundary:
      "Viewer fractions retain order-specific denominators: forever is relative to unigrams and for ever is relative to bigrams. They cannot support a direct joined/spaced comparison.",
  });
}

async function fileDescriptor(filePath: string, requiredInTrackedCheckout: boolean) {
  const fileStat = await stat(filePath);
  return {
    path: relative(filePath),
    bytes: fileStat.size,
    sha256: await sha256File(filePath),
    requiredInTrackedCheckout,
  };
}

async function writeRegistries() {
  const coreFamilyPath = path.join(ARTIFACT_DIR, "core-family-registry.json");
  const registryRecord = (spec: ExtractSpec) => ({
    id: spec.id,
    exactForm: spec.exactForm,
    ngramOrder: spec.ngramOrder,
    role: spec.role,
    blocksCorePairEligibility: spec.role !== "optional_related",
    wideRawFile: relative(path.join(EXTRACTED_DIR, spec.wideSourceFile)),
    annualFile: relative(path.join(EXTRACTED_DIR, spec.annualFile)),
    sourceShard: SOURCE_OBJECTS.find((source) => source.id === spec.sourceId)!.url,
  });
  await writeJsonAtomic(coreFamilyPath, {
    schemaVersion: 1,
    familyId: "forever-joined-spaced-core",
    release: RELEASE,
    viewerShorthand: VIEWER_SHORTHAND,
    viewerRequestBoundary: { start: START_YEAR, end: END_YEAR },
    expectedRawUpperYear: END_YEAR,
    coreForms: EXTRACT_SPECS.filter((spec) => spec.role !== "optional_related").map(
      registryRecord,
    ),
    optionalRelatedForms: EXTRACT_SPECS.filter(
      (spec) => spec.role === "optional_related",
    ).map(registryRecord),
    outOfScope: [
      {
        exactForm: "forever and ever",
        ngramOrder: 3,
        role: "independent_trigram_phrase",
        acquired: false,
        blocksCorePairEligibility: false,
      },
    ],
  });

  const acquisitionManifest = JSON.parse(
    await readFile(path.join(ARTIFACT_DIR, "acquisition-manifest.json"), "utf8"),
  ) as {
    objects: Array<{
      id: SourceObject["id"];
      local: LocalRecord;
    }>;
  };
  const cacheFiles = SOURCE_OBJECTS.map((source) => {
    const acquisition = acquisitionManifest.objects.find((item) => item.id === source.id);
    if (
      !acquisition?.local.exists ||
      acquisition.local.bytes === null ||
      acquisition.local.sha256 === null ||
      !acquisition.local.verifiedAgainstOfficialMd5
    ) {
      throw new Error(`${source.id}: acquisition manifest lacks a verified local identity`);
    }
    return {
      path: acquisition.local.cachePath,
      bytes: acquisition.local.bytes,
      sha256: acquisition.local.sha256,
      requiredInTrackedCheckout: false,
    };
  });
  const wideSourceFiles = await Promise.all(
    EXTRACT_SPECS.map((spec) =>
      fileDescriptor(path.join(EXTRACTED_DIR, spec.wideSourceFile), true),
    ),
  );
  const annualFiles = await Promise.all(
    EXTRACT_SPECS.map((spec) =>
      fileDescriptor(path.join(EXTRACTED_DIR, spec.annualFile), true),
    ),
  );
  const committedFrozenFiles = await Promise.all([
    fileDescriptor(TOTALCOUNTS_FROZEN_PATH, true),
    fileDescriptor(VIEWER_RESPONSE_PATH, true),
    fileDescriptor(VIEWER_REQUEST_PATH, true),
    fileDescriptor(path.join(EXTRACTED_DIR, "extraction-summary.json"), true),
    fileDescriptor(coreFamilyPath, true),
    fileDescriptor(path.join(ARTIFACT_DIR, "acquisition-manifest.json"), true),
    fileDescriptor(path.join(ARTIFACT_DIR, "source-rights-manifest.json"), true),
  ]);
  const scriptFile = await fileDescriptor(
    path.join(ROOT, "scripts", "acquire_forever_google_20200217.ts"),
    true,
  );

  const cacheById = new Map(
    SOURCE_OBJECTS.map((source) => [
      source.id,
      cacheFiles.find((file) => file.path.endsWith(`/${source.fileName}`))!,
    ]),
  );
  const wideSourceById = new Map(
    EXTRACT_SPECS.map((spec) => [
      spec.id,
      wideSourceFiles.find((file) => file.path.endsWith(`/${spec.wideSourceFile}`))!,
    ]),
  );
  const annualById = new Map(
    EXTRACT_SPECS.map((spec) => [
      spec.id,
      annualFiles.find((file) => file.path.endsWith(`/${spec.annualFile}`))!,
    ]),
  );
  await writeJsonAtomic(path.join(ARTIFACT_DIR, "transform-manifest.json"), {
    schemaVersion: 1,
    contractScopes: {
      "fixed-viewer-separate-facets": ["google-20200217-viewer-freeze"],
      "fixed-raw-common-denominator": [
        "google-20200217-core-exact-form-extraction",
        "google-20200217-core-wide-to-annual-expansion",
        "google-20200217-totalcounts-freeze",
      ],
      "optional-related-form": [
        "google-20200217-optional-exact-form-extraction",
        "google-20200217-optional-wide-to-annual-expansion",
      ],
    },
    transforms: [
      {
        id: "google-20200217-core-exact-form-extraction",
        status: "active",
        scriptPath: "scripts/acquire_forever_google_20200217.ts",
        scriptSha256: scriptFile.sha256,
        inputs: [cacheById.get("unigram-shard"), cacheById.get("bigram-shard")],
        outputs: [wideSourceById.get("forever"), wideSourceById.get("for-ever")],
        formula:
          "Stream-decompress the registered 1-gram and 2-gram v3 shards and retain one complete wide source record iff tabField[0] is exactly forever or for ever respectively; preserve each record byte-for-byte apart from a terminal LF.",
        missingnessPolicy:
          "No missing form or year is synthesized. Absence from the official wide record remains absent_or_suppressed unless separate inclusion evidence proves observed_zero.",
      },
      {
        id: "google-20200217-core-wide-to-annual-expansion",
        status: "active",
        scriptPath: "scripts/acquire_forever_google_20200217.ts",
        scriptSha256: scriptFile.sha256,
        inputs: [wideSourceById.get("forever"), wideSourceById.get("for-ever")],
        outputs: [annualById.get("forever"), annualById.get("for-ever")],
        formula:
          "For each exact wide source record, emit one annual row per source observation field `year,match_count,volume_count`; preserve all three numeric lexemes and record the zero-based tab-field index for exact lineage back to the wide source record.",
        missingnessPolicy:
          "Only explicit observation fields are emitted. A missing year is absent_or_suppressed, not observed_zero; an explicit match_count lexeme of 0 is retained as observed_zero.",
      },
      {
        id: "google-20200217-optional-exact-form-extraction",
        status: "active",
        scriptPath: "scripts/acquire_forever_google_20200217.ts",
        scriptSha256: scriptFile.sha256,
        inputs: [cacheById.get("unigram-shard")],
        outputs: [wideSourceById.get("forevermore")],
        formula:
          "From the registered 1-gram v3 shard, retain one complete wide source record iff tabField[0] === forevermore; preserve the record byte-for-byte apart from a terminal LF.",
        missingnessPolicy:
          "This related form is optional and outside the core joined/spaced closure. Its absence cannot block the core contract and is never converted to zero.",
      },
      {
        id: "google-20200217-optional-wide-to-annual-expansion",
        status: "active",
        scriptPath: "scripts/acquire_forever_google_20200217.ts",
        scriptSha256: scriptFile.sha256,
        inputs: [wideSourceById.get("forevermore")],
        outputs: [annualById.get("forevermore")],
        formula:
          "Expand the optional forevermore wide record to annual rows while preserving numeric lexemes and zero-based source field indices.",
        missingnessPolicy:
          "Only explicit observation fields are emitted; this optional output is not an eligibility dependency of the core pair.",
      },
      {
        id: "google-20200217-viewer-freeze",
        status: "active",
        scriptPath: "scripts/acquire_forever_google_20200217.ts",
        scriptSha256: scriptFile.sha256,
        inputs: [],
        externalInputs: [
          {
            url: VIEWER_REQUEST_URL,
            method: "GET",
            release: RELEASE,
            viewerShorthand: VIEWER_SHORTHAND,
            corpusSelectionMethod: "inline :eng_2019 selector plus Viewer UI numeric ID",
            corpusQueryParam: VIEWER_CORPUS_ID,
            smoothing: 0,
            caseSensitive: true,
          },
        ],
        outputs: [
          committedFrozenFiles.find((file) =>
            file.path.endsWith("/viewer-eng_2019-s0-case-sensitive.json"),
          ),
          committedFrozenFiles.find((file) => file.path.endsWith("/viewer-request.json")),
        ],
        formula:
          "Freeze the exact HTTP response bytes once, then validate exactly two returned selector labels (forever:eng_2019 and for ever:eng_2019), empty parent, type=NGRAM, 520 unsmoothed finite non-negative points per series, inline :eng_2019 selectors, and numeric corpus=26. A corpus=eng_2019 query parameter is prohibited because the JSON endpoint ignores that alias. capturedAt describes acquisition only and is preserved after the first freeze.",
        missingnessPolicy:
          "Viewer zeros are retained as returned. The Viewer facets remain order-specific and cannot establish a shared denominator or synthesize raw match rows.",
      },
      {
        id: "google-20200217-totalcounts-freeze",
        status: "active",
        scriptPath: "scripts/acquire_forever_google_20200217.ts",
        scriptSha256: scriptFile.sha256,
        inputs: [cacheById.get("annual-token-totals")],
        outputs: [
          committedFrozenFiles.find((file) => file.path.endsWith("/totalcounts-1")),
        ],
        formula: "Byte-for-byte copy after official object length validation.",
        missingnessPolicy: "No rows or fields are altered or imputed.",
      },
      {
        id: "legacy-variable-viewer-fetch",
        status: "excluded_legacy",
        scriptPath: "scripts/fetch_ngram_forever.ts",
        inputs: [],
        outputs: [],
        formula: "Legacy heuristic/current-alias acquisition; outside this contract closure.",
        missingnessPolicy: "Not evaluated by the fixed-release contract.",
      },
    ],
  });
  const transformManifestFile = await fileDescriptor(
    path.join(ARTIFACT_DIR, "transform-manifest.json"),
    true,
  );
  await writeJsonAtomic(path.join(ARTIFACT_DIR, "checksums.json"), {
    schemaVersion: 1,
    algorithm: "sha256",
    files: [
      ...cacheFiles,
      ...wideSourceFiles,
      ...annualFiles,
      ...committedFrozenFiles,
      scriptFile,
      transformManifestFile,
    ].sort((a, b) => a.path.localeCompare(b.path)),
  });
}

async function validateCommittedAndCache(
  includeOptionalRelated = false,
  validatePresentCache = true,
) {
  const checksumsPath = path.join(ARTIFACT_DIR, "checksums.json");
  const checksumManifest = JSON.parse(await readFile(checksumsPath, "utf8")) as {
    algorithm: string;
    files: Array<{
      path: string;
      bytes: number;
      sha256: string;
      requiredInTrackedCheckout: boolean;
    }>;
  };
  if (checksumManifest.algorithm !== "sha256") {
    throw new Error("Checksum manifest algorithm must be sha256");
  }
  const descriptorsByPath = new Map<
    string,
    (typeof checksumManifest.files)[number]
  >();
  for (const descriptor of checksumManifest.files) {
    if (descriptorsByPath.has(descriptor.path)) {
      throw new Error(`Duplicate checksum descriptor path: ${descriptor.path}`);
    }
    descriptorsByPath.set(descriptor.path, descriptor);
  }
  const requiredCoreDescriptors = [
    ".cache/google-ngram/20200217/eng/1-00018-of-00024.gz",
    ".cache/google-ngram/20200217/eng/2-00407-of-00589.gz",
    ".cache/google-ngram/20200217/eng/totalcounts-1",
    "scripts/acquire_forever_google_20200217.ts",
    "docs/research/forever/google-fixed-20200217/acquisition-manifest.json",
    "docs/research/forever/google-fixed-20200217/source-rights-manifest.json",
    "docs/research/forever/google-fixed-20200217/transform-manifest.json",
    "docs/research/forever/google-fixed-20200217/core-family-registry.json",
    "docs/research/forever/google-fixed-20200217/extracted/extraction-summary.json",
    "docs/research/forever/google-fixed-20200217/extracted/forever-1.source.tsv",
    "docs/research/forever/google-fixed-20200217/extracted/forever-1.annual.tsv",
    "docs/research/forever/google-fixed-20200217/extracted/for-ever-2.source.tsv",
    "docs/research/forever/google-fixed-20200217/extracted/for-ever-2.annual.tsv",
    "docs/research/forever/google-fixed-20200217/frozen/totalcounts-1",
    "docs/research/forever/google-fixed-20200217/frozen/viewer-eng_2019-s0-case-sensitive.json",
    "docs/research/forever/google-fixed-20200217/frozen/viewer-request.json",
  ];
  const requiredOptionalDescriptors = [
    "docs/research/forever/google-fixed-20200217/extracted/forevermore-1.source.tsv",
    "docs/research/forever/google-fixed-20200217/extracted/forevermore-1.annual.tsv",
  ];
  for (const requiredPath of [
    ...requiredCoreDescriptors,
    ...(includeOptionalRelated ? requiredOptionalDescriptors : []),
  ]) {
    if (!descriptorsByPath.has(requiredPath)) {
      throw new Error(`Missing required checksum descriptor: ${requiredPath}`);
    }
  }
  for (const expected of checksumManifest.files) {
    if (!includeOptionalRelated && expected.path.includes("/forevermore-1.")) {
      continue;
    }
    if (!validatePresentCache && !expected.requiredInTrackedCheckout) continue;
    const filePath = path.join(ROOT, expected.path);
    if (!existsSync(filePath)) {
      if (expected.requiredInTrackedCheckout) {
        throw new Error(`Required frozen input is missing: ${expected.path}`);
      }
      continue;
    }
    const actualStat = await stat(filePath);
    if (actualStat.size !== expected.bytes) {
      throw new Error(`Length mismatch: ${expected.path}`);
    }
    if ((await sha256File(filePath)) !== expected.sha256) {
      throw new Error(`SHA-256 mismatch: ${expected.path}`);
    }
  }

  const rightsManifest = JSON.parse(
    await readFile(path.join(ARTIFACT_DIR, "source-rights-manifest.json"), "utf8"),
  ) as {
    datasetDefaults: {
      viewerShorthand: string;
      persistentIdentifier: string;
      rawReleaseDirectory: string;
      sourceUrl: string;
      license: string;
      licenseUrl: string;
      attribution: string;
      rightsBoundary: string;
    };
    itemOverrides: unknown;
  };
  const rights = rightsManifest.datasetDefaults;
  if (
    rights.viewerShorthand !== VIEWER_SHORTHAND ||
    rights.persistentIdentifier !== RELEASE ||
    rights.rawReleaseDirectory !== RELEASE_DIRECTORY ||
    rights.sourceUrl !== OFFICIAL_INDEX_URL ||
    rights.license !== DATASET_LICENSE ||
    rights.licenseUrl !== DATASET_LICENSE_URL ||
    rights.attribution !== "Google Books Ngram Viewer" ||
    typeof rights.rightsBoundary !== "string" ||
    rights.rightsBoundary.length < 80
  ) {
    throw new Error("Source/rights dataset defaults are incomplete or do not match the fixed release");
  }
  if (
    rightsManifest.itemOverrides === null ||
    Array.isArray(rightsManifest.itemOverrides) ||
    typeof rightsManifest.itemOverrides !== "object"
  ) {
    throw new Error("Source/rights itemOverrides must be an object keyed by path");
  }
  for (const [overridePath, override] of Object.entries(
    rightsManifest.itemOverrides as Record<string, unknown>,
  )) {
    if (
      overridePath.length === 0 ||
      override === null ||
      Array.isArray(override) ||
      typeof override !== "object" ||
      Object.keys(override).length === 0 ||
      Object.values(override).some((value) => typeof value !== "string")
    ) {
      throw new Error(`Invalid item-level rights override: ${overridePath}`);
    }
  }

  const viewerRows = validateViewerBytes(await readFile(VIEWER_RESPONSE_PATH));
  const viewerRequest = JSON.parse(await readFile(VIEWER_REQUEST_PATH, "utf8")) as {
    requestUrl: string;
    params: {
      canonicalSurfaceForms: string[];
      content: string[];
      yearStart: number;
      yearEnd: number;
      corpusSelector: string;
      corpusQueryParam: number;
      smoothing: number;
      caseSensitive: boolean;
      caseInsensitiveRequestValue: boolean;
    };
    release: { viewerShorthand: string; persistentIdentifier: string };
    rawResponse: { path: string; bytes: number; sha256: string };
    returned: Array<{
      canonicalSurfaceForm: string;
      ngram: string;
      parent: string;
      type: string;
      pointCount: number;
    }>;
  };
  const parsedViewerUrl = new URL(viewerRequest.requestUrl);
  if (
    viewerRequest.requestUrl !== VIEWER_REQUEST_URL ||
    parsedViewerUrl.searchParams.get("content") !==
      "forever:eng_2019,for ever:eng_2019" ||
    parsedViewerUrl.searchParams.get("year_start") !== String(START_YEAR) ||
    parsedViewerUrl.searchParams.get("year_end") !== String(END_YEAR) ||
    parsedViewerUrl.searchParams.get("corpus") !== String(VIEWER_CORPUS_ID) ||
    parsedViewerUrl.searchParams.get("smoothing") !== "0" ||
    parsedViewerUrl.searchParams.get("case_insensitive") !== "false" ||
    JSON.stringify(viewerRequest.params.canonicalSurfaceForms) !==
      JSON.stringify(["forever", "for ever"]) ||
    JSON.stringify(viewerRequest.params.content) !==
      JSON.stringify(["forever:eng_2019", "for ever:eng_2019"]) ||
    viewerRequest.params.yearStart !== START_YEAR ||
    viewerRequest.params.yearEnd !== END_YEAR ||
    viewerRequest.params.corpusSelector !== VIEWER_SHORTHAND ||
    viewerRequest.params.corpusQueryParam !== VIEWER_CORPUS_ID ||
    viewerRequest.params.smoothing !== 0 ||
    viewerRequest.params.caseSensitive !== true ||
    viewerRequest.params.caseInsensitiveRequestValue !== false ||
    viewerRequest.release.viewerShorthand !== VIEWER_SHORTHAND ||
    viewerRequest.release.persistentIdentifier !== RELEASE
  ) {
    throw new Error(
      "Viewer request is not dual-pinned with inline :eng_2019 selectors and numeric corpus=26; corpus=eng_2019 is prohibited because the endpoint ignores that alias",
    );
  }
  const viewerResponseStat = await stat(VIEWER_RESPONSE_PATH);
  const viewerResponseSha = await sha256File(VIEWER_RESPONSE_PATH);
  if (
    viewerRequest.rawResponse.path !== relative(VIEWER_RESPONSE_PATH) ||
    viewerRequest.rawResponse.bytes !== viewerResponseStat.size ||
    viewerRequest.rawResponse.sha256 !== viewerResponseSha
  ) {
    throw new Error("Viewer request descriptor does not bind the frozen response bytes");
  }
  const expectedReturned = viewerRows.map((row) => ({
    canonicalSurfaceForm: row.ngram.replace(`:${VIEWER_SHORTHAND}`, ""),
    ngram: row.ngram,
    parent: row.parent,
    type: row.type,
    pointCount: row.timeseries.length,
  }));
  if (JSON.stringify(viewerRequest.returned) !== JSON.stringify(expectedReturned)) {
    throw new Error("Viewer returned-row provenance does not match the frozen response");
  }
  const totals = validateTotalcountsBytes(await readFile(TOTALCOUNTS_FROZEN_PATH));
  const annualRowsByForm = new Map<
    string,
    ReturnType<typeof parseAnnualRow>[]
  >();
  const summary = JSON.parse(
    await readFile(path.join(EXTRACTED_DIR, "extraction-summary.json"), "utf8"),
  ) as {
    forms: Array<{
      exactForm: string;
      wideRawFile: string;
      annualFile: string;
      ngramOrder: number;
      sourceId: SourceObject["id"];
      role: ExtractSpec["role"];
    }>;
  };
  for (const form of summary.forms) {
    if (!includeOptionalRelated && form.role === "optional_related") continue;
    const source = SOURCE_OBJECTS.find((candidate) => candidate.id === form.sourceId)!;
    const wideBytes = await readFile(path.join(ROOT, form.wideRawFile), "utf8");
    const wideLines = wideBytes.length === 0 ? [] : wideBytes.trimEnd().split("\n");
    if (form.role.startsWith("core_") && wideLines.length !== 1) {
      throw new Error(`Expected one exact wide source record in ${form.wideRawFile}`);
    }
    if (wideLines.length > 1) {
      throw new Error(`Expected at most one exact wide source record in ${form.wideRawFile}`);
    }
    const wideRecord = wideLines.length === 1 ? parseWideSourceRecord(wideLines[0], source) : null;
    if (wideRecord && wideRecord.ngram !== form.exactForm) {
      throw new Error(`Non-exact wide source record in ${form.wideRawFile}`);
    }

    const annualLines = (await readFile(path.join(ROOT, form.annualFile), "utf8"))
      .trimEnd()
      .split("\n");
    if (annualLines[0] !== ANNUAL_HEADER) {
      throw new Error(`Annual header mismatch in ${form.annualFile}`);
    }
    const annualRows = annualLines.slice(1).map((line) => parseAnnualRow(line, source));
    annualRowsByForm.set(form.exactForm, annualRows);
    if (annualRows.length !== (wideRecord?.observations.length ?? 0)) {
      throw new Error(`Annual expansion count mismatch in ${form.annualFile}`);
    }
    const seenYears = new Set<number>();
    for (const row of annualRows) {
      if (row.ngram !== form.exactForm) {
        throw new Error(`Non-exact annual row in ${form.annualFile}`);
      }
      if (seenYears.has(row.year)) {
        throw new Error(`Duplicate annual year ${row.year} in ${form.annualFile}`);
      }
      seenYears.add(row.year);
      const sourceObservation = wideRecord?.observations.find(
        (observation) => observation.wideFieldIndex === row.wideFieldIndex,
      );
      if (
        !sourceObservation ||
        sourceObservation.yearLexeme !== row.yearLexeme ||
        sourceObservation.matchLexeme !== row.matchLexeme ||
        sourceObservation.volumeLexeme !== row.volumeLexeme
      ) {
        throw new Error(`Annual row lineage mismatch in ${form.annualFile}`);
      }
    }
  }

  const joinedRows = annualRowsByForm.get("forever");
  const joinedViewer = viewerRows.find((row) => row.ngram === "forever:eng_2019");
  if (!joinedRows || !joinedViewer) {
    throw new Error("Missing joined-form rows for fixed-release Viewer sanity checks");
  }
  for (const year of [1500, 1520, 1900, 2019]) {
    const raw = joinedRows.find((row) => row.year === year);
    const annualTokens = totals.annualWordTokens.get(year);
    const viewerFraction = joinedViewer.timeseries[year - START_YEAR];
    if (!raw || !annualTokens || viewerFraction === undefined) {
      throw new Error(`Missing fixed-release sanity inputs for forever ${year}`);
    }
    const calculatedFraction = raw.matchCount / annualTokens;
    const tolerance = Math.max(1e-12, calculatedFraction * 1e-6);
    if (Math.abs(calculatedFraction - viewerFraction) > tolerance) {
      throw new Error(
        `Viewer fixed-release sanity mismatch for forever ${year}: ${viewerFraction} vs raw ${calculatedFraction}`,
      );
    }
  }
}

async function main() {
  await ensureDirectories();
  const args = new Set(process.argv.slice(2));
  const knownArgs = new Set([
    "--discover",
    "--download",
    "--extract",
    "--viewer",
    "--viewer-refresh",
    "--validate",
    "--validate-tracked",
    "--validate-optional",
  ]);
  for (const arg of args) {
    if (!knownArgs.has(arg)) throw new Error(`Unknown argument: ${arg}`);
  }
  const runAll = args.size === 0;

  if (
    (args.has("--validate") ||
      args.has("--validate-tracked") ||
      args.has("--validate-optional")) &&
    args.size === 1
  ) {
    await validateCommittedAndCache(
      args.has("--validate-optional"),
      !args.has("--validate-tracked"),
    );
    console.log(
      args.has("--validate-optional")
        ? "Validated fixed Google 20200217 core and optional-related frozen inputs."
        : args.has("--validate-tracked")
          ? "Validated the tracked fixed Google 20200217 core closure without requiring gitignored cache files."
        : "Validated fixed Google 20200217 core frozen inputs; optional related form is outside this gate.",
    );
    return;
  }

  let discovery: HeadRecord[] | null = null;
  let diskBytes: number | null = null;
  let discoveryCompletedAt: string | null = null;
  const retrievalStartedAt = isoNow();
  if (runAll || args.has("--discover") || args.has("--download")) {
    diskBytes = await assertDiskSpace();
    discovery = await discoverObjects();
    discoveryCompletedAt = isoNow();
    await writeSourceRightsManifest();
    await writeAcquisitionManifest(
      discovery,
      retrievalStartedAt,
      discoveryCompletedAt,
      null,
      diskBytes,
    );
    console.log("Discovery passed: exact fixed-release object identity and disk preflight.");
  }
  if (runAll || args.has("--download")) {
    await downloadAll();
    await writeAcquisitionManifest(
      discovery!,
      retrievalStartedAt,
      discoveryCompletedAt!,
      isoNow(),
      diskBytes!,
    );
    console.log("Downloaded and checksum-scanned fixed-release cache objects.");
  }
  if (runAll || args.has("--extract")) {
    await writeSourceRightsManifest();
    await extractAll();
    console.log("Extracted exact source rows and froze totalcounts-1.");
  }
  if (runAll || args.has("--viewer") || args.has("--viewer-refresh")) {
    await writeSourceRightsManifest();
    await freezeViewerResponse(args.has("--viewer-refresh"));
    console.log("Froze and validated the eng_2019 Viewer response.");
  }
  if (
    runAll ||
    args.has("--extract") ||
    args.has("--viewer") ||
    args.has("--viewer-refresh")
  ) {
    if (
      EXTRACT_SPECS.every((spec) =>
        existsSync(path.join(EXTRACTED_DIR, spec.wideSourceFile)) &&
        existsSync(path.join(EXTRACTED_DIR, spec.annualFile)),
      ) &&
      existsSync(TOTALCOUNTS_FROZEN_PATH) &&
      existsSync(VIEWER_RESPONSE_PATH)
    ) {
      await writeRegistries();
      await validateCommittedAndCache();
      console.log("Wrote and validated checksums, family registry, and transform closure.");
    }
  }
}

await main();
