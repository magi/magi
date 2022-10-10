package client

import (
	"errors"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

var (
	ErrKubeConfigError = errors.New("kubeConfig error")
	ErrCreateK8sClient = errors.New("creat K8s client error")
)

func GetK8sClient(k8sConf string) (*kubernetes.Clientset, error) {
	config, err := clientcmd.RESTConfigFromKubeConfig([]byte(k8sConf))

	if err != nil {
		return nil, ErrKubeConfigError
	}

	clientSet, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, ErrCreateK8sClient
	}
	return clientSet, nil
}
