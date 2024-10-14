import { CoreV1Api, Informer, KubeConfig, KubernetesObject, ListPromise, makeInformer, V1Pod, V1PodList } from "@kubernetes/client-node";

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(CoreV1Api);
const path = `/api/v1/namespaces/default/pods`;
const listFn = (): Promise<V1PodList> => k8sApi.listNamespacedPod({ namespace: 'default' });

startInformer(kc, path, listFn);

function startInformer(kc: KubeConfig, path: string, listFn: ListPromise<KubernetesObject>): Informer<V1Pod> {
  const informer = makeInformer(kc, path, listFn);
  informer.on('add', (obj: KubernetesObject) => {
    console.log('==> add ', obj.metadata?.name);
  });
  informer.on('error', (err: unknown) => {
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
