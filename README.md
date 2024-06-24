# weave-metrics-proxy

Super simple proxy for weave net metrics.

It works by just serving a file from specified in $METRICS_FILE
env on $PORT port and /metrics path.

A file is expected to be in prometheus format and already exist.

File can be scraped by a simple cron job from weave net:

```
* * * * * curl 0.0.0.0:6782/metrics > /ebs/containers/{service-name}/weave-metrics/metrics.txt
```

## Generating deploy configs

writing configs for each vm is a pain, so we have a script that generates them for you.

```
node generate-deploy-configs.js
```

If you have new VM, just simply add it to a script and re-run it.