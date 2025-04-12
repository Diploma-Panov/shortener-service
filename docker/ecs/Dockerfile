FROM node:20 AS builder

ARG ENVIRONMENT_NAME
ENV ENVIRONMENT_NAME=$ENVIRONMENT_NAME

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY .env.${ENVIRONMENT_NAME} .env
COPY src ./src

RUN yarn build:prod

FROM node:20-slim AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/.env ./.env

RUN yarn install --frozen-lockfile --production

CMD ["node", "build/index.js"]
