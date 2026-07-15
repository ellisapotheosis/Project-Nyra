const { TextDecoder, TextEncoder } = require("node:util");
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

const { ReadableStream } = require("node:stream/web");
global.ReadableStream = ReadableStream;

const { MessageChannel, MessagePort } = require("node:worker_threads");
global.MessageChannel = MessageChannel;
global.MessagePort = MessagePort;

require("@testing-library/jest-dom");

const { Request, Response, Headers, fetch } = require("undici");
global.Request = Request;
global.Response = Response;
global.Headers = Headers;
global.fetch = fetch;
