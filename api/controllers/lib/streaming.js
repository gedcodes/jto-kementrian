const fsPromises = require('fs').promises;
const config = require('../../../config/config');
const path = require("path");

exports.generateFile = async (data_streamings) => {
    const pathFile = path.join(config.path_upload) + '/rtsp-simple-server.yml'
    let middle = ''
    const start = `
logLevel: info
logDestinations: [stdout]
logFile: rtsp-simple-server.log
readTimeout: 10s
writeTimeout: 10s
readBufferCount: 512
externalAuthenticationURL:
api: no
apiAddress: 127.0.0.1:9997
metrics: no
metricsAddress: 127.0.0.1:9998
pprof: no
pprofAddress: 127.0.0.1:9999
runOnConnect:
runOnConnectRestart: no
###############################################
# RTSP parameters
rtspDisable: no
protocols: [udp, multicast, tcp]
encryption: 'no'
rtspAddress: :8554
rtspsAddress: :8322
rtpAddress: :8000
rtcpAddress: :8001
multicastIPRange: 224.1.0.0/16
multicastRTPPort: 8002
multicastRTCPPort: 8003
serverKey: server.key
serverCert: server.crt
authMethods: [basic, digest]
###############################################
# RTMP parameters
rtmpDisable: no
rtmpAddress: :1935
rtmpEncryption: 'no'
rtmpsAddress: :1936
rtmpServerKey: server.key
rtmpServerCert: server.crt
###############################################
# HLS parameters
hlsDisable: no
hlsAddress: :8888
hlsAlwaysRemux: no
hlsVariant: mpegts
hlsSegmentCount: 7
hlsSegmentDuration: 1s
hlsPartDuration: 200ms
hlsSegmentMaxSize: 50M
hlsAllowOrigin: '*'
hlsEncryption: no
hlsServerKey: server.key
hlsServerCert: server.crt
hlsTrustedProxies: []
paths:`;
for await (const item of data_streamings) {

const nama = item.nama.replace(/\s/g, '')
if (item.tipe_source_cctv_id === 2) {
    middle +=`
    ${item.kode}_${item.lokasi_id}_${nama}:
        runOnDemand: ffmpeg -i ${item.source_url} -c copy -f rtsp rtsp://localhost:$RTSP_PORT/$RTSP_PATH
        runOnDemandRestart: yes
        runOnDemandStartTimeout: 10s
        runOnDemandCloseAfter: 10s
    `
} else {
    middle +=`
    ${item.kode}_${item.lokasi_id}_${nama}:
        source: ${item.source_url}
        sourceProtocol: tcp
        sourceOnDemand: yes
        sourceOnDemandStartTimeout: 10s
        sourceOnDemandCloseAfter: 10s
    `
}
}
const end = `
    all:
        source: publisher
        sourceProtocol: automatic
        sourceAnyPortEnable: no
        sourceFingerprint:
        sourceOnDemand: no
        sourceOnDemandStartTimeout: 10s
        sourceOnDemandCloseAfter: 10s
        sourceRedirect:
        disablePublisherOverride: no
        fallback:
        publishUser:
        publishPass:
        publishIPs: []
        readUser:
        readPass:
        readIPs: []
        runOnInit:
        runOnInitRestart: no
        runOnDemand:
        runOnDemandRestart: no
        runOnDemandStartTimeout: 10s
        runOnDemandCloseAfter: 10s
        runOnReady:
        runOnReadyRestart: no
        runOnRead:
        runOnReadRestart: no
    `
    const content = start + middle + end

    await fsPromises.writeFile(pathFile, content)

}