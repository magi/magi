FROM node:16-alpine3.15 AS ui-builder
WORKDIR /magi
COPY web/package*.json ./
RUN npm install
COPY web ./
RUN npm run build

FROM golang:1.18-alpine3.15 as server-builder
ENV CGO_ENABLED 0
WORKDIR /magi
COPY go.mod go.sum ./
RUN go mod download
COPY cmd cmd
COPY internal internal
COPY pkg pkg
RUN go build -o ./build/magi -v ./cmd/magi/main.go

FROM alpine:3.15
WORKDIR /magi
RUN apk --no-cache add ca-certificates

COPY --from=ui-builder /magi/dist ./ui
COPY --from=server-builder /magi/build/magi ./

EXPOSE 8086

ENTRYPOINT ["./magi"]