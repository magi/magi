package cluster

import (
	"context"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

func GetK8sClusterVersion(c *kubernetes.Clientset) (string, error) {
	version, err := c.ServerVersion()

	if err != nil {
		return "", err
	}

	return version.String(), nil
}

func GetK8sClusterNodesNumber(c *kubernetes.Clientset) (string, int, int, error) {
	nodes, err := c.CoreV1().Nodes().List(context.TODO(), metav1.ListOptions{})
	readyNodes := 0
	clusterStatus := "Inactive"
	for _, node := range nodes.Items {
		for _, condition := range node.Status.Conditions {
			if condition.Type == v1.NodeReady {
				if condition.Status == v1.ConditionTrue {
					readyNodes += 1
				}
			}
		}
	}
	if err != nil {
		return clusterStatus, readyNodes, 0, err
	}
	if len(nodes.Items) == readyNodes {
		clusterStatus = "Active"
	}
	return clusterStatus, readyNodes, len(nodes.Items), nil
}
