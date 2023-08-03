FROM registry.access.redhat.com/ubi9/nodejs-18:latest as builder

USER 1001
COPY --chown=1001 . .
RUN npm clean-install && PUBLIC_URL=. npm run build

LABEL name="konveyor/static-report" \
      description="Konveyor Analysis - Static Report" \
      help="For more information visit https://konveyor.io" \
      license="Apache License 2.0" \
      summary="Static report for Konveyor analysis modules" \
      url="https://quay.io/konveyor/static-report"
