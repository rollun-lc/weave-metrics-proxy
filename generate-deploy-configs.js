import fs from 'fs';

const vms = [
  {
    name: 'hetzner-catalog',
    exporterName: 'catalog-wnp',
  },
  {
    name: 'hetzner-03',
    exporterName: 'hetzner-03-wnp',
  },
  {
    name: 'hetzner-01-test',
    exporterName: 'hetzner-01-wnp',
  },
  {
    name: 'hetzner-staging',
    exporterName: 'staging-wnp',
  },
  {
    name: 'rollun-db-replv2',
    exporterName: 'db-replv2-wnp',
  },
  {
    name: 'rollun-db-master',
    exporterName: 'db-master-wnp',
  },
  {
    name: 'rollun-crm',
    exporterName: 'crm-wnp',
  },
  {
    name: 'hetzner-selenoid',
    exporterName: 'selenoid-wnp',
  },
  {
    name: 'selenoid-asburn',
    exporterName: 's-asburn-wnp',
  },
  {
    name: 'rollun-tmp-db',
    exporterName: 'tmp-db-wnp',
  },
];

const makeServiceConfig = (vm) =>
  `initial-service-host: "${vm.name}"
d2c-service-config:
  type: "docker"
  image: "ghcr.io/rollun-lc/weave-metrics-proxy/weave-metrics-proxy/image"
  version: "latest"
  name: "${vm.exporterName}"
  description: "A weave net metrics proxy. Serves metrics from weave net to prometheus."
  project: "Monitoring:VM"
  ports:
    - value: 80
      protocol: "TCP"
  env:
    - name: "PORT"
      value: "80"
    - name: "METRICS_FILE"
      value: "/tmp/weave-metrics/metrics.txt"
  volumes:
    - dst: /tmp/weave-metrics
      src: /ebs/containers/${vm.exporterName}/weave-metrics
`;

// note: indent is important
const makeDeployStep = (vm) => `
  deploy-${vm.name}:
    if: github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v1
      - uses: rollun-com/actions/update-d2c-service@master
        with:
          config-path: ./config/${vm.name}.yml
          d2c-email: \${{ secrets.D2C_USER }}
          d2c-password: \${{ secrets.D2C_PASSWORD }}
          sm-user: \${{ secrets.SM_USER }}
          sm-password: \${{ secrets.SM_PASSWORD }}
`;

const configs = fs.readdirSync('./config');
for (const config of configs) {
  fs.rmSync(`./config/${config}`);
}

for (const vm of vms) {
  fs.writeFileSync(`./config/${vm.name}.yml`, makeServiceConfig(vm));
}

let deployWorkflow = `name: CI
'on': push
env:
  IMAGE: ghcr.io/$GITHUB_REPOSITORY/$(basename $PWD)/image
jobs:
  build:
    if: github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - name: Docker login
        run: >-
          docker login ghcr.io -u \${{ secrets.DOCKER_USER }} -p \${{secrets.DOCKER_PASS }}
      - name: Build
        run: docker build -t \${{ env.IMAGE }}:latest .
      - name: Push
        run: docker push \${{ env.IMAGE }}:latest
`;

for (const vm of vms) {
  deployWorkflow += makeDeployStep(vm);
}

fs.writeFileSync('./.github/workflows/deploy.yml', deployWorkflow);
