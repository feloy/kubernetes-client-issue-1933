"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_node_1 = require("@kubernetes/client-node");
const kc = new client_node_1.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(client_node_1.CoreV1Api);
const path = `/api/v1/namespaces/default/pods`;
const listFn = () => k8sApi.listNamespacedPod({ namespace: 'default' });
startInformer(kc, path, listFn);
function startInformer(kc, path, listFn) {
    const informer = (0, client_node_1.makeInformer)(kc, path, listFn);
    informer.on('add', (obj) => {
        var _a;
        console.log('==> add ', (_a = obj.metadata) === null || _a === void 0 ? void 0 : _a.name);
    });
    informer.on('error', (err) => {
        console.log('==> err start', String(err));
        if (String(err) === 'Error: Premature close' || String(err).startsWith('FetchError') || String(err).startsWith('Forbidden')) {
            console.log('=====> restart in 3s');
            setTimeout(() => {
                informer.start();
            }, 3000);
        }
    });
    informer.start();
    return informer;
}
