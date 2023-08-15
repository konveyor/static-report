FROM golang:1.18 as go-builder
WORKDIR /output-parser
COPY ./analyzer-output-parser/go.mod go.mod
COPY ./analyzer-output-parser/go.sum go.sum
COPY ./analyzer-output-parser/main.go main.go
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o js-bundle-generator ./main.go

FROM registry.access.redhat.com/ubi9/nodejs-18:latest as builder
WORKDIR /static-report
USER 1001
COPY --chown=1001 . .
RUN npm clean-install && CI=true PUBLIC_URL=. npm run build

FROM registry.access.redhat.com/ubi9/ubi-minimal

COPY --from=go-builder /output-parser/js-bundle-generator /usr/bin/js-bundle-generator
COPY --from=builder /static-report/build /usr/local/static-report

LABEL name="konveyor/static-report" \
      description="Konveyor Analysis - Static Report" \
      help="For more information visit https://konveyor.io" \
      license="Apache License 2.0" \
      summary="Static report for Konveyor analysis modules" \
      url="https://quay.io/konveyor/static-report"
