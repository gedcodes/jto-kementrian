const NodeMediaServer = require('node-media-server');

const { jt_timbangan, sequelize } = require('../api/models');
const { Op } = require('sequelize');
const moment = require('moment');
const { QueryTypes } = require('sequelize');

async function streamingData() {
	//return new Promise((resolve, reject) => {
        var sql = `SELECT * FROM jt_timbangan WHERE is_active = true AND is_deleted = false`;

        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        })
        
        return result;
	//});
}

// stream_task();
async function stream_task() {
	/*
    let data = await streamingData();
    // console.log(data);
    
	var arr_data = [];
	for(let row of data){
        // console.log(row.cctv_depan_url, row.cctv_belakang_url);
		if (row.cctv_depan && row.cctv_belakang) {
        	arr_data.push(row.cctv_depan, row.cctv_belakang);
		}
    }

	var arr_cctv = [];
	for(var i=0; i<arr_data.length; i++){
        arr_cctv.push({
            app: 'cctv',
            mode: 'static',
            edge: `${arr_data[i]}`,
            name: `cctvjt_${i}`,
            rtsp_transport: 'tcp' //['udp', 'tcp', 'udp_multicast', 'http']
        })
	}
	*/
	const config = {
		rtmp: {
			port: 1935,
			chunk_size: 60000,
			gop_cache: true,
			ping: 30,
			ping_timeout: 60
		},
		http: {
			port: 8085,
			allow_origin: '*'
		},
		relay: {
			ffmpeg: `${process.env.FFMPEG_PATH}`,
			tasks: [
				{
					app: 'cctv',
					mode: 'static',
					edge: `rtsp://admin:Marktel12345@10.29.1.31/Streaming/Channels/102`,
					name: `cctvjt_0`,
					rtsp_transport: 'tcp' //['udp', 'tcp', 'udp_multicast', 'http']
				},
				{
					app: 'cctv',
					mode: 'static',
					edge: `rtsp://admin:Marktel12345@10.29.1.32/Streaming/Channels/102`,
					name: `cctvjt_1`,
					rtsp_transport: 'tcp' //['udp', 'tcp', 'udp_multicast', 'http']
				},
				{
					app: 'cctv',
					mode: 'static',
					edge: `rtsp://admin:Marktel12345@10.29.1.33/Streaming/Channels/102`,
					name: `cctvjt_2`,
					rtsp_transport: 'tcp' //['udp', 'tcp', 'udp_multicast', 'http']
				},
				{
					app: 'cctv',
					mode: 'static',
					edge: `rtsp://admin:Marktel12345@10.29.1.34/Streaming/Channels/102`,
					name: `cctvjt_3`,
					rtsp_transport: 'tcp' //['udp', 'tcp', 'udp_multicast', 'http']
				}
			]
		}
	};
	// console.log(config);
	return config;
}

async function run(){
    let task = await stream_task();


	var nms = new NodeMediaServer(task);

	nms.run();

	nms.on('preConnect', (id, args) => {
		console.log('[NODE_EVENT on PRE_CONNECT]', `id=${id} args=${JSON.stringify(args)}`);
		// let session = nms.getSession(id);
		// session.reject();
	});

	nms.on('postConnect', (id, args) => {
		console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
	});

	nms.on('doneConnect', (id, args) => {
		console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
	});

	nms.on('prePublish', (id, StreamPath, args) => {
		console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
		// let session = nms.getSession(id);
		// session.reject();
	});

	nms.on('postPublish', (id, StreamPath, args) => {
		console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
	});

	nms.on('donePublish', (id, StreamPath, args) => {
		console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
	});

	nms.on('prePlay', (id, StreamPath, args) => {
		console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
		// let session = nms.getSession(id);
		// session.reject();
	});

	nms.on('postPlay', (id, StreamPath, args) => {
		console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
	});

	nms.on('donePlay', (id, StreamPath, args) => {
		console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
	});
}

run();
