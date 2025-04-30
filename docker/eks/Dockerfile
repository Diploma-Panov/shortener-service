FROM node:20 AS builder

ARG ENVIRONMENT_NAME
ENV ENVIRONMENT_NAME=$ENVIRONMENT_NAME

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY tsconfig.json /app
COPY drizzle.config.ts /app
COPY ./drizzle /app/drizzle

COPY .env.${ENVIRONMENT_NAME} .env
COPY src ./src

RUN yarn build:prod


FROM node:20-slim AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/build ./build

COPY --from=builder /app/.env /app
COPY --from=builder /app/drizzle.config.ts /app
COPY --from=builder /app/drizzle /app/drizzle

CMD ["node", "build/index.js"]
